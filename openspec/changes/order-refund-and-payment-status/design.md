## Context

專案分為兩個獨立的程式庫：
- **Nuxt3-training**：前端 + Nuxt3 server API（BFF 層）
- **freyja**：Express + TypeScript 後端，管理訂單資料庫與藍新金流加解密邏輯

現有訂單取消流程：前端呼叫 `DELETE /api/v1/orders/:id`，freyja 直接刪除訂單資料，不觸發任何退款。

現有藍新相關 API（已實作完成）：
- `POST /api/newebpay/close`（Nuxt3 proxy → freyja `POST /newebpay_close`）：信用卡關閉/退款
- `POST /api/newebpay/query`（Nuxt3 proxy → freyja `POST /newebpay_query`）：交易狀態查詢

訂單資料存放於 freyja 的 MongoDB，`_id` 為 MongoDB ObjectId。`MerchantOrderNo` 與 `Amt` 儲存於訂單文件的 `paymentInfo` 欄位中，前端無法直接取得。

## Goals / Non-Goals

**Goals:**

- 取消信用卡付款訂單時自動執行退款
- 在「即將來的行程」卡片上顯示付款狀態
- 保持現有非信用卡訂單的取消流程不變

**Non-Goals:**

- 不修改 Nuxt3 server API（`server/api/newebpay/`）既有代理端點
- 不支援部分退款（退款金額固定為訂單全額）
- 不在歷史訂單清單上顯示付款狀態（僅限「即將來的行程」）
- 不新增 Nuxt3 端的代理路由（前端直接透過 `$axios` 呼叫 freyja）

## Decisions

### 合併端點取代前端序列呼叫

freyja 新增 `POST /api/v1/orders/:id/cancel`，在同一個請求中完成「退款 → 取消訂單」兩個步驟，而非由前端分別呼叫退款 API 和刪除 API。

**原因**：避免前端只完成其中一步的部分失敗狀態（已退款但訂單未刪除，或訂單已刪除但未退款）。

**替代方案**：前端序列呼叫 → 拒絕，部分失敗無法從前端可靠地回復。

### 退款失敗時阻擋取消

若藍新退款呼叫失敗，freyja 應回傳錯誤並不刪除訂單。

**原因**：用戶取消的主要動機是取回款項；若退款失敗但訂單被刪除，用戶既無法追蹤訂單也無法要求退款。

**替代方案**：退款失敗仍繼續取消訂單 → 拒絕，對用戶不友善且難以補救。

### 付款狀態查詢由 freyja 解析訂單 ID

freyja 新增 `GET /api/v1/orders/:id/payment-status`，接收 MongoDB `_id`，內部從訂單的 `paymentInfo` 取得 `MerchantOrderNo` 與 `Amt`，再呼叫藍新 `QueryTradeInfo`。

**原因**：`MerchantOrderNo` 僅存於 freyja 資料庫，前端無從得知，不適合暴露給前端。

### 付款狀態僅對「即將來的行程」自動查詢

頁面 `onMounted` 後，若 `comingSoonOrders[0]` 存在，自動呼叫付款狀態查詢一次。

**原因**：用戶最關心即將到來的訂單是否付款成功；歷史訂單的付款狀態實用性較低，且大量查詢會增加藍新 API 呼叫次數。

## Risks / Trade-offs

- **[Risk] 藍新沙箱與正式環境退款行為不同** → 以 `NEWEBPAY_API_URL` 環境變數控制端點（freyja 側已有此機制）
- **[Risk] 非信用卡訂單呼叫 cancel 端點時付款方式判斷錯誤** → freyja 應依訂單的 `paymentInfo.paymentType`（或等效欄位）判斷，若非信用卡則直接取消訂單不呼叫藍新
- **[Risk] 付款狀態查詢結果可能過時** → 本次不實作快取或輪詢，每次掛載查詢一次即可
