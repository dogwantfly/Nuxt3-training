## Context

專案分為兩個獨立的程式庫：
- **Nuxt3-training**：前端 + Nuxt3 server API（BFF 層）
- **freyja**：Express + TypeScript 後端，管理訂單資料庫與藍新金流加解密邏輯

藍新金流的 `HASHKEY` / `HASHIV` 僅存放在 freyja 的環境變數中。Nuxt3 server API 作為薄代理層，不持有任何藍新加密金鑰，所有加解密邏輯集中於 freyja。

freyja 現有藍新相關功能：
- `src/utils/crypto.ts`：`createSesEncrypt`、`createShaEncrypt`、`createSesDecrypt`
- `src/controllers/newebpay.ts`：`notify`（接收通知並更新訂單）、`paymentReturn`（重導前端）
- `src/routes/newebpay.ts`：`POST /newebpay_notify`、`ALL /newebpay_return`

## Goals / Non-Goals

**Goals:**

- 在 freyja 實作 queryTradeInfo：建立 SHA-256 CheckValue，呼叫藍新 `QueryTradeInfo` API
- 在 freyja 實作 creditCardClose：AES 加密關閉參數，呼叫藍新 `CreditCard/Close` API
- 在 Nuxt3 新增兩個薄代理 server API，轉發前端請求至 freyja

**Non-Goals:**

- 不在 Nuxt3 端持有或操作藍新加密金鑰
- 不修改現有的 notify / paymentReturn 邏輯
- 不實作前端 UI 頁面（僅後端 API）

## Decisions

### QueryTradeInfo 的 CheckValue 產生方式

藍新 QueryTradeInfo 的 `CheckValue` 與幕前支付的 `TradeSha` 演算法不同：
- CheckValue：`SHA256(HashIV=${iv}&Amt=${amt}&MerchantID=${id}&MerchantOrderNo=${no}&HashKey=${key})` → 全大寫
- 現有的 `createShaEncrypt` 用於幕前支付（格式為 `HashKey=...&{aesData}&HashIV=...`）

**決策**：在 `src/utils/crypto.ts` 新增 `createQueryCheckValue(params)` 函式，不修改現有函式。

### CreditCard/Close 的 PostData_ 加密

關閉交易的 `PostData_` 使用與幕前支付相同的 AES-256-CBC 加密，但資料欄位不同（MerchantOrderNo、Amt、IndexType、CloseType）。

**決策**：新增 `createCloseEncrypt(params)` 函式，複用 `HASHKEY`/`HASHIV`，與 `createSesEncrypt` 模式一致。

### Nuxt3 proxy 的 freyja URL

Nuxt3 server API 透過 `process.env.NUXT_API_BASE_URL`（`.env` 中已有 `http://localhost:3001`）呼叫 freyja，與專案現有的 axios plugin 模式一致。

### freyja 路由掛載位置

新端點掛載於現有的 `src/routes/newebpay.ts`，保持藍新相關路由集中管理。路徑定為 `POST /newebpay_query` 與 `POST /newebpay_close`，以便 Nuxt3 proxy 直接對應。

## Risks / Trade-offs

- **[Risk] 藍新沙箱與正式環境 URL 不同** → 以環境變數 `NEWEBPAY_API_URL` 控制（`https://ccore.newebpay.com` 為沙箱），freyja 讀取此變數
- **[Risk] Nuxt3 proxy 呼叫 freyja 失敗時前端收到不明錯誤** → Nuxt3 server API 統一捕捉錯誤並回傳結構化錯誤訊息
