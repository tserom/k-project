## ADDED Requirements

### Requirement: Inventory transaction persistence model

The inventory backend SHALL persist editable inventory transactions in table `inventory_transactions` with at least: `id`, `type` (`in` or `out`), `party_name`, `party_contact`, `goods_detail`, `quantity` (positive integer in API), `warehouse_id`, optional `product_id`, optional `reference_no`, optional `note`, `biz_at`, `movement_id` (nullable FK to latest applied movement), `created_by`, `created_at`, `updated_at`.

#### Scenario: Create transaction row

- **WHEN** operator creates a transaction via API
- **THEN** a row is stored with `created_at` and `updated_at` set by the system

### Requirement: List inventory transactions with filters

Authenticated users SHALL call `GET /api/v1/inventory-transactions` with pagination `page`, `page_size` and optional filters `type`, `party_name` (prefix or contains), `q` (matches `party_name`, `party_contact`, or `goods_detail`), `biz_from`, `biz_to` (ISO date or datetime on `biz_at`).

#### Scenario: Paginated list

- **WHEN** user requests `page=1` and `page_size=20`
- **THEN** response includes `items` array and `total` count; each item includes `id`, `type`, `party_name`, `party_contact`, `goods_detail`, `quantity`, `warehouse_id`, `warehouse_name`, `reference_no`, `note`, `biz_at`, `created_at`, `updated_at`

#### Scenario: Filter by type

- **WHEN** user passes `type=out`
- **THEN** only outbound transactions are returned

### Requirement: Create inventory transaction

Operators with role `operator` or `admin` SHALL create transactions via `POST /api/v1/inventory-transactions` with required fields: `type`, `party_name`, `warehouse_id`, `goods_detail`, `quantity` (> 0), `biz_at`; optional: `party_contact`, `product_id`, `reference_no`, `note`.

#### Scenario: Inbound creates stock increase

- **WHEN** valid `type=in` is posted
- **THEN** HTTP 201 is returned, `stock_levels` quantity for the resolved product and warehouse increases, and an immutable `stock_movements` row is created and linked via `movement_id`

#### Scenario: Outbound allows negative stock

- **WHEN** valid `type=out` is posted with quantity exceeding on-hand balance
- **THEN** operation succeeds and `stock_levels.quantity` MAY become negative

### Requirement: Update inventory transaction

Operators with role `operator` or `admin` SHALL update an existing transaction via `PUT /api/v1/inventory-transactions/:id` with the same field set as create.

#### Scenario: Edit reverses prior stock effect

- **WHEN** user updates a transaction that already has `movement_id`
- **THEN** prior movement effect on `stock_levels` is reversed within the same database transaction before applying the new movement

#### Scenario: Not found

- **WHEN** user updates non-existent id
- **THEN** response status is 404

### Requirement: Miscellaneous product fallback

When `product_id` is omitted or null, the system SHALL resolve stock impact using a dedicated product with SKU `MISC` (created by migration or bootstrap if missing).

#### Scenario: Non-standard goods without product pick

- **WHEN** create body omits `product_id` and `goods_detail` describes non-standard material
- **THEN** stock movement applies to the `MISC` product and `goods_detail` is stored on the transaction row for display

### Requirement: Validation errors

The API SHALL reject invalid payloads with HTTP 400 and `{ "error": "message" }`.

#### Scenario: Missing party name

- **WHEN** `party_name` is empty after trim
- **THEN** response status is 400

#### Scenario: Invalid quantity

- **WHEN** `quantity` is zero or negative
- **THEN** response status is 400
