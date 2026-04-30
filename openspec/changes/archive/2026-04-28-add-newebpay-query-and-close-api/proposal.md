## Why

藍新金流付款完成後，商家需要主動查詢交易結果，以及在訂單取消時關閉信用卡授權。目前專案僅有幕前支付（送出付款表單）的功能，缺少查詢交易資訊與關閉信用卡交易的 API 串接。

## What Changes

- 在 freyja 後端新增 `POST /api/v1/newebpay/query`：建立 CheckValue 後呼叫藍新 QueryTradeInfo API，回傳交易狀態
- 在 freyja 後端新增 `POST /api/v1/newebpay/close`：AES 加密關閉參數後呼叫藍新 CreditCard/Close API
- 在 Nuxt3 新增 `server/api/newebpay/query.post.js`：作為前端與 freyja query 端點之間的代理
- 在 Nuxt3 新增 `server/api/newebpay/close.post.js`：作為前端與 freyja close 端點之間的代理

## Capabilities

### New Capabilities

- `newebpay-query-trade-info`: 查詢藍新金流交易資訊（freyja 後端 + Nuxt3 代理）
- `newebpay-creditcard-close`: 關閉藍新金流信用卡授權（freyja 後端 + Nuxt3 代理）

### Modified Capabilities

（無）

## Impact

- Affected specs: newebpay-query-trade-info, newebpay-creditcard-close
- Affected code:
  - New: `server/api/newebpay/query.post.js`
  - New: `server/api/newebpay/close.post.js`
  - New: `D:/HSINYUCHEN/projects/freyja/src/controllers/newebpay.ts` 中新增 queryTradeInfo 與 creditCardClose 函式
  - New: freyja 的 newebpay 路由新增對應端點
  - Modified: `D:/HSINYUCHEN/projects/freyja/src/routes/newebpay.ts`
