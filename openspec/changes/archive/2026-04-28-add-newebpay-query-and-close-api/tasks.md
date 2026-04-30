## 1. freyja — 加解密工具擴充

- [x] 1.1 在 `D:/HSINYUCHEN/projects/freyja/src/utils/crypto.ts` 新增 `createQueryCheckValue({ Amt, MerchantOrderNo })` 函式，實作 QueryTradeInfo 的 CheckValue 產生方式：SHA-256(`HashIV=${HASHIV}&Amt=${Amt}&MerchantID=${MerchantID}&MerchantOrderNo=${MerchantOrderNo}&HashKey=${HASHKEY}`) 並轉大寫 hex
- [x] 1.2 在 `D:/HSINYUCHEN/projects/freyja/src/utils/crypto.ts` 新增 `createCloseEncrypt({ MerchantOrderNo, Amt, IndexType, CloseType })` 函式，實作 CreditCard/Close 的 PostData_ 加密：AES-256-CBC 加密參數字串，輸出 hex（與 createSesEncrypt 模式一致）

## 2. freyja — Query trade info from NewebPay 控制器

- [x] 2.1 實作 Query trade info from NewebPay：在 `D:/HSINYUCHEN/projects/freyja/src/controllers/newebpay.ts` 新增 `queryTradeInfo` 函式，從 req.body 取得 `MerchantOrderNo` 與 `Amt`，呼叫 `createQueryCheckValue` 產生 CheckValue，以 `RespondType=JSON&TimeStamp=<timestamp>&MerchantOrderNo=<no>&Amt=<amt>&MerchantID=<id>&Version=2.0&CheckValue=<cv>` 的格式 POST 至 `${NEWEBPAY_API_URL}/API/QueryTradeInfo`，回傳 JSON 結果；若 Status !== "SUCCESS" 則回傳 HTTP 400 並帶 error 訊息
- [x] 2.2 確認 CheckValue generation for QueryTradeInfo：單元測試或手動驗證 `createQueryCheckValue` 產生的 CheckValue 為 64 字元大寫 hex

## 3. freyja — Close credit card authorization via NewebPay 控制器

- [x] 3.1 實作 Close credit card authorization via NewebPay：在 `D:/HSINYUCHEN/projects/freyja/src/controllers/newebpay.ts` 新增 `creditCardClose` 函式，從 req.body 取得 `MerchantOrderNo`、`Amt`、`CloseType`（1=退款）、`IndexType`（1=以訂單編號查詢），呼叫 `createCloseEncrypt` 產生 PostData_，以 `MerchantID=<id>&PostData_=<data>` POST 至 `${NEWEBPAY_API_URL}/API/CreditCard/Close`；若 Status !== "SUCCESS" 則回傳 HTTP 400
- [x] 3.2 確認 PostData_ encryption for CreditCard/Close：驗證 `createCloseEncrypt` 輸出為非空 hex 字串

## 4. freyja — 路由掛載

- [x] 4.1 在 `D:/HSINYUCHEN/projects/freyja/src/routes/newebpay.ts` 依照 freyja 路由掛載位置決策，新增 `router.post('/newebpay_query', newebpayController.queryTradeInfo)` 路由
- [x] 4.2 在 `D:/HSINYUCHEN/projects/freyja/src/routes/newebpay.ts` 新增 `router.post('/newebpay_close', newebpayController.creditCardClose)` 路由
- [x] 4.3 在 freyja 的 `.env` 新增 `NEWEBPAY_API_URL=https://ccore.newebpay.com`（沙箱）

## 5. Nuxt3 — Query trade info 代理

- [x] 5.1 建立 `server/api/newebpay/query.post.js`，實作 Nuxt3 proxy 的 freyja URL 決策：從 `process.env.NUXT_API_BASE_URL` 取得 freyja base URL，以 `$fetch` 或 axios 將 `{ MerchantOrderNo, Amt }` 轉發至 `${NUXT_API_BASE_URL}/newebpay_query`，正常回傳結果；freyja 回應非 2xx 時回傳 HTTP 502 並帶 `{ error: "freyja service unavailable" }`；符合 Error handling for failed queries 規格

## 6. Nuxt3 — Creditcard close 代理

- [x] 6.1 建立 `server/api/newebpay/close.post.js`，將 `{ MerchantOrderNo, Amt, CloseType, IndexType }` 轉發至 `${NUXT_API_BASE_URL}/newebpay_close`，正常回傳結果；freyja 回應非 2xx 時回傳 HTTP 502 並帶 `{ error: "freyja service unavailable" }`；符合 Error handling for failed close requests 規格
