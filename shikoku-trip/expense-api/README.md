# 獨立旅費記帳 API

這個 Worker 專供四國行程手帖的旅費記帳使用，和用餐／營養服務分開部署、分開呼叫、分開保存 Gemini 金鑰設定。它不連接 Firebase、餐點 API、D1 或用餐資料庫；帳本仍只保存在瀏覽器。

部署前在 Cloudflare Wrangler 安全設定專用金鑰（CLI 會以隱藏輸入提示，不要貼進 HTML、Git 或聊天）：

```powershell
wrangler secret put SHIKOKU_EXPENSE_GEMINI_KEY --config shikoku-trip/expense-api/wrangler.jsonc
wrangler deploy --config shikoku-trip/expense-api/wrangler.jsonc
```

`/expense/status` 只回報 Worker 和專用金鑰是否就緒，不會回傳金鑰。`/expense` 只處理旅費品項辨識；來源白名單為 GitHub Pages，並配置每 IP 的邊緣頻率限制。來源限制不是登入驗證，仍應在 Cloudflare 用量面板留意 API 使用量。
