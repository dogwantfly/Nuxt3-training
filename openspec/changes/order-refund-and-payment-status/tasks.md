## 1. freyja — 取消訂單合併端點

- [x] 1.1 在 freyja `src/routes/orders.ts` 新增 `POST /api/v1/orders/:id/cancel` 路由，由合併端點取代前端序列呼叫，handler 讀取並解析訂單文件
- [x] 1.2 在 handler 中從 `paymentInfo.paymentType` 判斷是否為信用卡付款（值為 `CREDIT`）
- [x] 1.3 若為信用卡付款，使用 `paymentInfo.MerchantOrderNo`、`paymentInfo.Amt` 呼叫藍新 `CreditCard/Close`（`CloseType=2`）實作 Cancel order with automatic credit card refund；退款失敗時阻擋取消並回傳 HTTP 400 `{ error: <藍新錯誤訊息> }`
- [x] 1.4 退款成功（或非信用卡訂單）時，將訂單標記為取消，回傳 HTTP 200 `{ success: true }`

## 2. freyja — 付款狀態查詢端點

- [x] 2.1 在 freyja `src/routes/orders.ts` 新增 `GET /api/v1/orders/:id/payment-status` 路由，實作付款狀態查詢由 freyja 解析訂單 ID 的設計
- [x] 2.2 從訂單 `paymentInfo` 取得 `MerchantOrderNo` 與 `Amt`，呼叫 `createQueryCheckValue` 並 POST 至藍新 `QueryTradeInfo`，實作 Query payment status for the upcoming order 需求
- [x] 2.3 回傳藍新回應的 `Status`、`PaymentType`、`Amt` 欄位；若訂單不存在或查詢失敗回傳 HTTP 400 `{ error: <原因> }`

## 3. Nuxt3 前端 — 取消訂單流程

- [x] 3.1 在 `pages/user/orders/index.vue` 的取消 handler 中，將 `$axios.delete` 改為 `$axios.post('/api/v1/orders/${id}/cancel')`，實作 Frontend calls cancel endpoint instead of delete
- [x] 3.2 取消失敗時，toast 訊息改為顯示 API 回傳的 `error` 欄位內容（而非固定文字）

## 4. Nuxt3 前端 — 付款狀態顯示

- [x] 4.1 在 `pages/user/orders/index.vue` 新增 `paymentStatus` ref；`onMounted` 取得訂單後，若 `comingSoonOrders[0]` 存在則呼叫 `GET /api/v1/orders/:id/payment-status`（付款狀態僅對「即將來的行程」自動查詢）；`comingSoonOrders` 為空時略過
- [x] 4.2 在「即將來的行程」卡片按鈕群組上方新增付款狀態區塊：付款成功顯示綠色「付款成功」文字與付款方式，失敗顯示紅色「付款失敗」，實作 Display payment status on the upcoming order card 需求
- [x] 4.3 付款狀態查詢失敗時靜默抑制（`catch` 不顯示 toast），不渲染付款狀態區塊
