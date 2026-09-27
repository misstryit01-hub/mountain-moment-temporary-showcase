/* Compact, date-aware payment reminders for the daily itinerary. */
(() => {
  const PAYMENT_NOTES = {
    0: [
      {
        kind: 'available',
        label: 'ICOCA 可用',
        text: '高松空港利木津接受 ICOCA；現金也可，依乘車日票價與班次為準。'
      }
    ],
    1: {
      A: [
        {
          kind: 'separate',
          label: '直島渡輪另購票',
          text: '高松—宮浦渡輪須另購船票；四國汽船不接受事前預約，請在售票處購票並依序候船。'
        },
        {
          kind: 'cash',
          label: '町營巴士備 ¥100 硬幣',
          text: '直島町營巴士每程 ¥100，現金投幣、車上不找零且不能刷 ICOCA；按上下車趟數備好硬幣。'
        }
      ],
      B: [
        {
          kind: 'separate',
          label: '女木／男木渡輪購票',
          text: 'めおん渡輪需按班次購票候船；付款方式以售票處公告為準，備日圓現金。島上交通以步行為主。'
        }
      ],
      C: [
        {
          kind: 'ticket',
          label: 'FIT 船券・免預約',
          text: '符合香川 FIT 優惠資格可兌領高松—土庄往返電子船券，免另付渡輪船費；搭船仍須出示有效動態乘船憑證並依現場核銷。散客通常不接受預約、依序登船；未符合資格仍須現場購票，備日圓現金。'
        },
        {
          kind: 'optional',
          label: '橄欖巴士先查班次',
          text: '土庄港—天使之路班距有限，出發前確認當日巴士時刻與付款方式；不要把 ICOCA 可用視為已確認，備日圓現金。'
        }
      ]
    },
    2: [
      {
        kind: 'ticket',
        label: '單車租借先登記',
        text: '高松站前租車不是刷 ICOCA；高松市租車採 App 註冊與無現金付款，出發前先完成登記。付款選項以 App 畫面為準。'
      }
    ],
    3: [
      {
        kind: 'available',
        label: 'ICOCA 可用',
        text: '琴電全線支援 ICOCA 等全國互通交通卡；出門前確認餘額。'
      }
    ],
    4: [
      {
        kind: 'ticket',
        label: 'JR 請先買全程票',
        text: '琴平前往松山跨出 JR 四國 ICOCA 使用區；不要中途刷卡，先買全程乘車券，特急另買特急券。'
      }
    ],
    5: [
      {
        kind: 'ticket',
        label: 'JR 請先買來回票',
        text: '松山—下灘不在 JR 四國公告的 ICOCA 區域；去回程先買車票，不要只用 ICOCA 進站。'
      }
    ],
    6: [
      {
        kind: 'optional',
        label: '改搭車時留意',
        text: '道後市內電車／一般路線巴士可用 ICOCA；伊予鐵道每張卡每次只付一人，高速巴士除外。若選內子 JR 行程，須另買全程車票。'
      }
    ],
    7: [
      {
        kind: 'ticket',
        label: 'JR 請先買全程票',
        text: '松山—高松跨出 JR 四國 ICOCA 使用區；先買全程乘車券與特急券，不可刷 ICOCA 跨區。'
      },
      {
        kind: 'available',
        label: '機場巴士可刷',
        text: '高松空港利木津接受 ICOCA；也可用現金，按當日公告票價搭乘。'
      }
    ]
  };

  const style = document.createElement('style');
  style.id = 'shk-payment-advisories-style';
  style.textContent = `
    .shk-payment-guidance{margin:8px 0 12px;padding:8px 10px;display:grid;gap:6px;border:1px solid rgba(188,157,103,.25);border-left:2px solid #c7a772;border-radius:0 8px 8px 0;background:rgba(24,43,43,.7)}
    .shk-payment-guidance__head{font-size:10px;letter-spacing:.06em;color:#d0b77e}
    .shk-payment-guidance__line{display:grid;grid-template-columns:max-content minmax(0,1fr);align-items:start;gap:4px 8px;color:#c1d0c9;font-size:11px;line-height:1.55}
    .shk-payment-guidance__label{white-space:nowrap;font-weight:650}
    .shk-payment-guidance__label.available{color:#9fd7b6}
    .shk-payment-guidance__label.separate,.shk-payment-guidance__label.cash,.shk-payment-guidance__label.ticket,.shk-payment-guidance__label.optional{color:#e4c17d}
    @media(max-width:420px){.shk-payment-guidance{padding:8px}.shk-payment-guidance__line{grid-template-columns:1fr;gap:1px}}
  `;
  document.head.append(style);

  const app = document.getElementById('app');
  if (!app) return;

  let queued = false;
  const refresh = () => {
    queued = false;
    const existing = app.querySelector('.shk-payment-guidance');
    const selectedDay = app.querySelector('.date-rail [role="tab"][aria-selected="true"]');
    const day = Number(selectedDay?.dataset.day);
    const activeVariant = day === 1
      ? (app.querySelector('.var15-seg button[aria-pressed="true"]')?.dataset.var15?.split(':')[1] || 'A')
      : '';
    const notes = day === 1 ? PAYMENT_NOTES[day]?.[activeVariant] : PAYMENT_NOTES[day];
    const tools = app.querySelector('.day-main .itinerary-tools');
    if (!notes?.length || !tools) {
      existing?.remove();
      return;
    }
    if (existing?.dataset.day === String(day) && existing.dataset.plan === activeVariant && existing.previousElementSibling === tools) return;
    existing?.remove();

    const panel = document.createElement('aside');
    panel.className = 'shk-payment-guidance';
    panel.dataset.day = String(day);
    panel.dataset.plan = activeVariant;
    panel.setAttribute('aria-label', '當日交通支付提醒');
    const heading = document.createElement('div');
    heading.className = 'shk-payment-guidance__head';
    heading.textContent = '交通支付提醒';
    panel.append(heading);
    for (const note of notes) {
      const line = document.createElement('div');
      line.className = 'shk-payment-guidance__line';
      const label = document.createElement('span');
      label.className = `shk-payment-guidance__label ${note.kind}`;
      label.textContent = note.label;
      const text = document.createElement('span');
      text.textContent = note.text;
      line.append(label, text);
      panel.append(line);
    }
    tools.insertAdjacentElement('afterend', panel);
  };

  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-view', 'aria-selected'],
    childList: true,
    subtree: true
  });
  app.addEventListener('click', event => {
    if (!event.target.closest('.date-rail [data-day]')) return;
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  }, true);
  refresh();
})();
