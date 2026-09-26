import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

const origin = 'https://misstryit01-hub.github.io';
const env = (extra = {}) => ({ ALLOWED_ORIGINS: origin, ...extra });
const request = (path, init = {}) => new Request(`https://expense.example${path}`, init);

test('status endpoint reports independent service readiness without exposing a key', async () => {
  const missing = await worker.fetch(request('/expense/status', { headers: { Origin: origin } }), env());
  assert.equal(missing.status, 200);
  assert.deepEqual(await missing.json(), {
    service: 'shikoku-travel-expense-api', ready: false, configured: false, model: 'gemini-3.8-flash'
  });
  const ready = await worker.fetch(request('/expense/status', { headers: { Origin: origin } }), env({ SHIKOKU_EXPENSE_GEMINI_KEY: 'test-secret' }));
  const readyData = await ready.json();
  assert.equal(readyData.ready, true);
  assert.equal(JSON.stringify(readyData).includes('test-secret'), false);
});

test('preflight allows only the GitHub Pages origin', async () => {
  const good = await worker.fetch(request('/expense', { method: 'OPTIONS', headers: { Origin: origin } }), env());
  assert.equal(good.status, 204);
  assert.equal(good.headers.get('Access-Control-Allow-Origin'), origin);
  const bad = await worker.fetch(request('/expense', { method: 'OPTIONS', headers: { Origin: 'https://attacker.example' } }), env());
  assert.equal(bad.status, 403);
});

test('expense route requires valid origin, input, and an independent key', async () => {
  const badOrigin = await worker.fetch(request('/expense', { method: 'POST', headers: { Origin: 'https://attacker.example' } }), env());
  assert.equal(badOrigin.status, 403);
  const noKey = await worker.fetch(request('/expense', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '咖啡 100' })
  }), env());
  assert.equal(noKey.status, 503);
  assert.equal((await noKey.json()).code, 'unconfigured');
  const noContent = await worker.fetch(request('/expense', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ' ' })
  }), env({ SHIKOKU_EXPENSE_GEMINI_KEY: 'test-secret' }));
  assert.equal(noContent.status, 400);
});

test('expense route sends its own key and maps meal-style request data to Gemini', async t => {
  const originalFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), headers: new Headers(init.headers), body: JSON.parse(init.body) };
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ items: [
      { name: '咖啡', category: '飲料', amount: 100, currency: 'JPY' }
    ] }) }] } }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  let limitedKey;
  const limiter = { async limit({ key }) { limitedKey = key; return { success: true }; } };
  const body = {
    prompt: 'ignored client prompt', text: '咖啡 100 日圓', defaultCurrency: 'JPY',
    existingCategories: ['飲料'], images: [{ mimeType: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,AQID' }]
  };
  const response = await worker.fetch(request('/expense', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.7' }, body: JSON.stringify(body)
  }), env({ SHIKOKU_EXPENSE_GEMINI_KEY: 'expense-only-secret', SHIKOKU_EXPENSE_LIMITER: limiter }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [{ name: '咖啡', category: '飲料', amount: 100, currency: 'JPY' }] });
  assert.equal(limitedKey, '203.0.113.7');
  assert.match(captured.url, /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.8-flash:generateContent$/);
  assert.equal(captured.headers.get('x-goog-api-key'), 'expense-only-secret');
  assert.equal(captured.body.contents[0].parts[1].inline_data.mime_type, 'image/jpeg');
  assert.equal(JSON.stringify(captured.body).includes('ignored client prompt'), false);
});

test('expense route rejects over-limit traffic and unsupported images', async () => {
  const limited = await worker.fetch(request('/expense', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'coffee' })
  }), env({ SHIKOKU_EXPENSE_GEMINI_KEY: 'test-secret', SHIKOKU_EXPENSE_LIMITER: { async limit() { return { success: false }; } } }));
  assert.equal(limited.status, 429);
  const invalidImage = await worker.fetch(request('/expense', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: [{ mimeType: 'image/gif', dataUrl: 'data:image/gif;base64,AQID' }] })
  }), env({ SHIKOKU_EXPENSE_GEMINI_KEY: 'test-secret' }));
  assert.equal(invalidImage.status, 400);
});
