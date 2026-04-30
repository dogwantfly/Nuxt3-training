### Requirement: Query trade info from NewebPay

The system SHALL provide an API endpoint that queries trade status from NewebPay's QueryTradeInfo API using the merchant order number and amount.

The freyja backend SHALL accept `POST /newebpay_query` with `{ MerchantOrderNo, Amt }` and return the decrypted trade result from NewebPay.

The Nuxt3 server API SHALL accept `POST /api/newebpay/query` and proxy the request to freyja's `/newebpay_query` endpoint, returning the result to the frontend.

#### Scenario: Successful trade query

- **WHEN** a valid `MerchantOrderNo` and `Amt` are submitted to `POST /api/newebpay/query`
- **THEN** the system SHALL return the trade status and details from NewebPay

##### Example: query parameters

- **GIVEN** `MerchantOrderNo = "ORDER20240101001"`, `Amt = 3000`
- **WHEN** the request reaches freyja
- **THEN** freyja builds `CheckValue = SHA256(HashIV=<iv>&Amt=3000&MerchantID=<id>&MerchantOrderNo=ORDER20240101001&HashKey=<key>)` (uppercase hex) and POSTs to `https://ccore.newebpay.com/API/QueryTradeInfo`


<!-- @trace
source: add-newebpay-query-and-close-api
updated: 2026-04-28
code:
  - CLAUDE.md
  - server/api/newebpay/query.post.js
  - .spectra.yaml
  - server/api/newebpay/close.post.js
-->

### Requirement: CheckValue generation for QueryTradeInfo

The freyja backend SHALL generate `CheckValue` by SHA-256 hashing the string `HashIV=${HASHIV}&Amt=${Amt}&MerchantID=${MerchantID}&MerchantOrderNo=${MerchantOrderNo}&HashKey=${HASHKEY}` and converting to uppercase hex.

This MUST be implemented as a separate function from the existing `createShaEncrypt` used for payment initiation.

#### Scenario: CheckValue format is uppercase hex

- **WHEN** `createQueryCheckValue` is called with valid params
- **THEN** the returned string SHALL be a 64-character uppercase hexadecimal string


<!-- @trace
source: add-newebpay-query-and-close-api
updated: 2026-04-28
code:
  - CLAUDE.md
  - server/api/newebpay/query.post.js
  - .spectra.yaml
  - server/api/newebpay/close.post.js
-->

### Requirement: Error handling for failed queries

The system SHALL return a structured error response when the NewebPay query fails or returns a non-SUCCESS status.

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

### Requirement: Query trade info from NewebPay

The system SHALL provide an API endpoint that queries trade status from NewebPay's QueryTradeInfo API using the merchant order number and amount.

The freyja backend SHALL accept `POST /newebpay_query` with `{ MerchantOrderNo, Amt }` and return the decrypted trade result from NewebPay.

The Nuxt3 server API SHALL accept `POST /api/newebpay/query` and proxy the request to freyja's `/newebpay_query` endpoint, returning the result to the frontend.

#### Scenario: Successful trade query

- **WHEN** a valid `MerchantOrderNo` and `Amt` are submitted to `POST /api/newebpay/query`
- **THEN** the system SHALL return the trade status and details from NewebPay

##### Example: query parameters

- **GIVEN** `MerchantOrderNo = "ORDER20240101001"`, `Amt = 3000`
- **WHEN** the request reaches freyja
- **THEN** freyja builds `CheckValue = SHA256(HashIV=<iv>&Amt=3000&MerchantID=<id>&MerchantOrderNo=ORDER20240101001&HashKey=<key>)` (uppercase hex) and POSTs to `https://ccore.newebpay.com/API/QueryTradeInfo`

---
### Requirement: CheckValue generation for QueryTradeInfo

The freyja backend SHALL generate `CheckValue` by SHA-256 hashing the string `HashIV=${HASHIV}&Amt=${Amt}&MerchantID=${MerchantID}&MerchantOrderNo=${MerchantOrderNo}&HashKey=${HASHKEY}` and converting to uppercase hex.

This MUST be implemented as a separate function from the existing `createShaEncrypt` used for payment initiation.

#### Scenario: CheckValue format is uppercase hex

- **WHEN** `createQueryCheckValue` is called with valid params
- **THEN** the returned string SHALL be a 64-character uppercase hexadecimal string

---
### Requirement: Error handling for failed queries

The system SHALL return a structured error response when the NewebPay query fails or returns a non-SUCCESS status.

#### Scenario: NewebPay returns failure status

- **WHEN** NewebPay responds with `Status !== "SUCCESS"`
- **THEN** the Nuxt3 proxy SHALL return HTTP 400 with `{ error: <NewebPay message> }`

#### Scenario: freyja call fails

- **WHEN** the freyja endpoint is unreachable or returns HTTP 5xx
- **THEN** the Nuxt3 proxy SHALL return HTTP 502 with `{ error: "freyja service unavailable" }`