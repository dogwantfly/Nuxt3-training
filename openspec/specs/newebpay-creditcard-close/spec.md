### Requirement: Close credit card authorization via NewebPay

The system SHALL provide an API endpoint that closes a credit card authorization on NewebPay's CreditCard/Close API using the merchant order number, amount, and close type.

The freyja backend SHALL accept `POST /newebpay_close` with `{ MerchantOrderNo, Amt, CloseType, IndexType }` and return the result from NewebPay.

The Nuxt3 server API SHALL accept `POST /api/newebpay/close` and proxy the request to freyja's `/newebpay_close` endpoint.

#### Scenario: Successful credit card close

- **WHEN** a valid `MerchantOrderNo`, `Amt`, `CloseType`, and `IndexType` are submitted to `POST /api/newebpay/close`
- **THEN** the system SHALL return the close result from NewebPay

##### Example: close request parameters

- **GIVEN** `MerchantOrderNo = "ORDER20240101001"`, `Amt = 3000`, `CloseType = 1` (退款), `IndexType = 1`
- **WHEN** the request reaches freyja
- **THEN** freyja AES-256-CBC encrypts `RespondType=JSON&TimeStamp=<ts>&MerchantOrderNo=ORDER20240101001&Amt=3000&IndexType=1&CloseType=1` with HASHKEY/HASHIV and POSTs to `https://ccore.newebpay.com/API/CreditCard/Close`


<!-- @trace
source: add-newebpay-query-and-close-api
updated: 2026-04-28
code:
  - CLAUDE.md
  - server/api/newebpay/query.post.js
  - .spectra.yaml
  - server/api/newebpay/close.post.js
-->

### Requirement: PostData_ encryption for CreditCard/Close

The freyja backend SHALL generate `PostData_` by AES-256-CBC encrypting the close parameter string using `HASHKEY` and `HASHIV`, encoded as hex.

The `CheckValue` SHALL be generated using SHA-256 of `HashIV=${HASHIV}&Amt=${Amt}&MerchantID=${MerchantID}&MerchantOrderNo=${MerchantOrderNo}&HashKey=${HASHKEY}` (uppercase hex), identical to the QueryTradeInfo CheckValue formula.

This MUST be implemented as a separate function `createCloseEncrypt` from the existing `createSesEncrypt`.

#### Scenario: PostData_ is hex-encoded AES ciphertext

- **WHEN** `createCloseEncrypt` is called with valid close params
- **THEN** the returned string SHALL be a non-empty lowercase hex string


<!-- @trace
source: add-newebpay-query-and-close-api
updated: 2026-04-28
code:
  - CLAUDE.md
  - server/api/newebpay/query.post.js
  - .spectra.yaml
  - server/api/newebpay/close.post.js
-->

### Requirement: Error handling for failed close requests

The system SHALL return a structured error response when the NewebPay close call fails.

#### Scenario: NewebPay returns failure status

- **WHEN** NewebPay responds with `Status !== "SUCCESS"`
- **THEN** the Nuxt3 proxy SHALL return HTTP 400 with `{ error: <NewebPay message> }`

#### Scenario: freyja call fails

- **WHEN** the freyja endpoint is unreachable or returns HTTP 5xx
- **THEN** the Nuxt3 proxy SHALL return HTTP 502 with `{ error: "freyja service unavailable" }`

## Requirements


<!-- @trace
source: add-newebpay-query-and-close-api
updated: 2026-04-28
code:
  - CLAUDE.md
  - server/api/newebpay/query.post.js
  - .spectra.yaml
  - server/api/newebpay/close.post.js
-->

### Requirement: Close credit card authorization via NewebPay

The system SHALL provide an API endpoint that closes a credit card authorization on NewebPay's CreditCard/Close API using the merchant order number, amount, and close type.

The freyja backend SHALL accept `POST /newebpay_close` with `{ MerchantOrderNo, Amt, CloseType, IndexType }` and return the result from NewebPay.

The Nuxt3 server API SHALL accept `POST /api/newebpay/close` and proxy the request to freyja's `/newebpay_close` endpoint.

#### Scenario: Successful credit card close

- **WHEN** a valid `MerchantOrderNo`, `Amt`, `CloseType`, and `IndexType` are submitted to `POST /api/newebpay/close`
- **THEN** the system SHALL return the close result from NewebPay

##### Example: close request parameters

- **GIVEN** `MerchantOrderNo = "ORDER20240101001"`, `Amt = 3000`, `CloseType = 1` (退款), `IndexType = 1`
- **WHEN** the request reaches freyja
- **THEN** freyja AES-256-CBC encrypts `RespondType=JSON&TimeStamp=<ts>&MerchantOrderNo=ORDER20240101001&Amt=3000&IndexType=1&CloseType=1` with HASHKEY/HASHIV and POSTs to `https://ccore.newebpay.com/API/CreditCard/Close`

---
### Requirement: PostData_ encryption for CreditCard/Close

The freyja backend SHALL generate `PostData_` by AES-256-CBC encrypting the close parameter string using `HASHKEY` and `HASHIV`, encoded as hex.

The `CheckValue` SHALL be generated using SHA-256 of `HashIV=${HASHIV}&Amt=${Amt}&MerchantID=${MerchantID}&MerchantOrderNo=${MerchantOrderNo}&HashKey=${HASHKEY}` (uppercase hex), identical to the QueryTradeInfo CheckValue formula.

This MUST be implemented as a separate function `createCloseEncrypt` from the existing `createSesEncrypt`.

#### Scenario: PostData_ is hex-encoded AES ciphertext

- **WHEN** `createCloseEncrypt` is called with valid close params
- **THEN** the returned string SHALL be a non-empty lowercase hex string

---
### Requirement: Error handling for failed close requests

The system SHALL return a structured error response when the NewebPay close call fails.

#### Scenario: NewebPay returns failure status

- **WHEN** NewebPay responds with `Status !== "SUCCESS"`
- **THEN** the Nuxt3 proxy SHALL return HTTP 400 with `{ error: <NewebPay message> }`

#### Scenario: freyja call fails

- **WHEN** the freyja endpoint is unreachable or returns HTTP 5xx
- **THEN** the Nuxt3 proxy SHALL return HTTP 502 with `{ error: "freyja service unavailable" }`