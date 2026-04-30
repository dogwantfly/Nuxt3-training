## Why

訂單取消時目前僅刪除訂單資料，並不觸發退款，導致信用卡付款的用戶無法在取消訂單時取回款項。此外，即將來的行程也缺乏付款狀態查詢功能，用戶無法確認付款是否成功。

## What Changes

- freyja 新增 `POST /api/v1/orders/:id/cancel` 端點：若訂單付款方式為信用卡，先呼叫藍新 `CreditCard/Close`（CloseType=2）退款，成功後再取消訂單
- freyja 新增 `GET /api/v1/orders/:id/payment-status` 端點：依訂單 `_id` 查詢藍新 `QueryTradeInfo` 並回傳付款狀態
- `pages/user/orders/index.vue` 更新取消預訂流程：呼叫新的 cancel 端點
- `pages/user/orders/index.vue` 在「即將來的行程」卡片掛載時自動查詢付款狀態並顯示

## Capabilities

### New Capabilities

- `order-cancel-with-refund`: 取消訂單時若為信用卡付款則自動退款，由 freyja 合併處理兩個步驟
- `order-payment-status`: 查詢即將來的行程的藍新付款狀態，並顯示於訂單頁面

### Modified Capabilities

(none)

## Impact

- Affected specs: `order-cancel-with-refund`（新增）、`order-payment-status`（新增）
- Affected code:
  - New: freyja `src/routes/orders.ts`（新增兩個端點，非本 repo）
  - Modified: `pages/user/orders/index.vue`
