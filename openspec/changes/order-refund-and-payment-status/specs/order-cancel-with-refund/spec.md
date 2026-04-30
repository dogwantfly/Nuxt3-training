## ADDED Requirements

### Requirement: Cancel order with automatic credit card refund

The system SHALL provide a combined cancel endpoint `POST /api/v1/orders/:id/cancel` in freyja that checks the order's payment method and conditionally triggers a NewebPay refund before cancelling the order.

#### Scenario: Credit card order is cancelled and refunded

- **WHEN** `POST /api/v1/orders/:id/cancel` is called for an order whose payment method is credit card
- **THEN** freyja SHALL call NewebPay `CreditCard/Close` with `CloseType=2` using the order's stored `MerchantOrderNo` and `Amt`
- **AND** only if the refund succeeds SHALL freyja mark the order as cancelled and return HTTP 200

##### Example: credit card cancel request

- **GIVEN** order `_id = "676512ae9519e0b01d74c55a"` with `paymentInfo.paymentType = "CREDIT"`, `paymentInfo.MerchantOrderNo = "ORDER20240101001"`, `paymentInfo.Amt = 3000`
- **WHEN** `POST /api/v1/orders/676512ae9519e0b01d74c55a/cancel` is called
- **THEN** freyja calls NewebPay `CreditCard/Close` with `{ MerchantOrderNo: "ORDER20240101001", Amt: 3000, CloseType: 2, IndexType: 1 }`
- **AND** returns `{ success: true }` after the order is cancelled

#### Scenario: Non-credit-card order is cancelled without refund

- **WHEN** `POST /api/v1/orders/:id/cancel` is called for an order whose payment method is not credit card
- **THEN** freyja SHALL cancel the order directly without calling NewebPay and return HTTP 200

#### Scenario: Refund failure blocks cancellation

- **WHEN** the NewebPay `CreditCard/Close` call returns a non-SUCCESS status or fails with a network error
- **THEN** freyja SHALL NOT cancel the order
- **AND** SHALL return HTTP 400 with `{ error: <reason> }`

### Requirement: Frontend calls cancel endpoint instead of delete

The Nuxt3 frontend SHALL replace the existing `DELETE /api/v1/orders/:id` call with `POST /api/v1/orders/:id/cancel` when the user confirms order cancellation.

#### Scenario: Cancel confirmation triggers new endpoint

- **WHEN** the user clicks "確定取消" in the cancel modal on `pages/user/orders/index.vue`
- **THEN** the frontend SHALL call `POST /api/v1/orders/:id/cancel` via `$axios`
- **AND** on success SHALL reload the orders list and show a success toast
- **AND** on failure SHALL show an error toast with the reason
