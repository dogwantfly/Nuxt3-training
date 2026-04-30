## ADDED Requirements

### Requirement: Query payment status for the upcoming order

The system SHALL automatically query the NewebPay payment status for the first upcoming order (`comingSoonOrders[0]`) when the orders page mounts.

freyja SHALL provide `GET /api/v1/orders/:id/payment-status` that resolves `MerchantOrderNo` and `Amt` from the order's `paymentInfo` and calls NewebPay `QueryTradeInfo`, returning the payment status to the caller.

#### Scenario: Payment status is loaded on mount

- **WHEN** `pages/user/orders/index.vue` mounts and `comingSoonOrders[0]` exists
- **THEN** the frontend SHALL call `GET /api/v1/orders/:id/payment-status` once via `$axios`
- **AND** SHALL display the returned payment status on the upcoming order card

#### Scenario: Payment status query succeeds

- **WHEN** `GET /api/v1/orders/:id/payment-status` is called with a valid order `_id`
- **THEN** freyja SHALL call NewebPay `QueryTradeInfo` using the order's `MerchantOrderNo` and `Amt`
- **AND** SHALL return the trade status to the Nuxt3 frontend with HTTP 200

##### Example: successful payment status response

- **GIVEN** order `_id = "676512ae9519e0b01d74c55a"` with `paymentInfo.MerchantOrderNo = "ORDER20240101001"`, `paymentInfo.Amt = 3000`
- **WHEN** `GET /api/v1/orders/676512ae9519e0b01d74c55a/payment-status` is called
- **THEN** freyja returns `{ status: "SUCCESS", paymentType: "CREDIT", tradeAmt: 3000 }` (fields from NewebPay response)

#### Scenario: No upcoming order — query is skipped

- **WHEN** `pages/user/orders/index.vue` mounts and `comingSoonOrders` is empty
- **THEN** the frontend SHALL NOT call the payment status endpoint

#### Scenario: Payment status query fails

- **WHEN** the NewebPay query returns a non-SUCCESS status or freyja cannot find the order
- **THEN** freyja SHALL return HTTP 400 with `{ error: <reason> }`
- **AND** the frontend SHALL silently suppress the error (no toast) and not display a payment status section

### Requirement: Display payment status on the upcoming order card

The Nuxt3 orders page SHALL show a payment status section on the "即將來的行程" card when the query result is available.

#### Scenario: Payment status section is shown after successful query

- **WHEN** the payment status query returns successfully
- **THEN** the upcoming order card SHALL display the payment result (e.g., 付款成功 / 付款失敗) and payment type
