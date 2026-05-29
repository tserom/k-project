## ADDED Requirements

### Requirement: Sales delivery document persistence model

The inventory backend SHALL persist sales delivery documents in table `sales_delivery_documents` with at least: `id`, `doc_no` (unique), `doc_date`, `party_a_name`, `party_b_name`, `warehouse_name`, `phone`, `total_amount`, `paid_amount`, `balance_due`, `created_by`, `created_at`, `updated_at`.

Line items SHALL be stored in `sales_delivery_items` with at least: `id`, `document_id` (FK), `line_no`, `product_spec`, `quantity` (positive integer), `weight_kg` (> 0), `unit_price` (>= 0), `amount`, optional `note`.

#### Scenario: Create document with items

- **WHEN** operator creates a document with one or more line items via API
- **THEN** one header row and N item rows are stored; `doc_no` is system-generated and unique

### Requirement: Line amount calculation

For each line item, the system SHALL set `amount = round(weight_kg * unit_price, 2)` using decimal arithmetic.

#### Scenario: Weight times unit price

- **WHEN** a line has `weight_kg=10.5` and `unit_price=18.5`
- **THEN** stored `amount` is `194.25`

### Requirement: Document totals calculation

The system SHALL set `total_amount` to the sum of all line `amount` values and `balance_due = total_amount - paid_amount` on create and update.

#### Scenario: Total and balance

- **WHEN** document has line amounts `194.25` and `paid_amount=100`
- **THEN** `total_amount` is `194.25` and `balance_due` is `94.25`

### Requirement: List sales delivery documents

Authenticated users SHALL call `GET /api/v1/sales-deliveries` with pagination `page`, `page_size` and optional filters `party_b_name` (contains), `doc_from`, `doc_to` (date range on `doc_date`), and `q` (matches `doc_no`, `party_b_name`, or `party_a_name`).

#### Scenario: Paginated list

- **WHEN** user requests `page=1` and `page_size=20`
- **THEN** response includes `items` array and `total`; each item includes `id`, `doc_no`, `doc_date`, `party_b_name`, `party_a_name`, `warehouse_name`, `total_amount`, `paid_amount`, `balance_due`, `created_at`

#### Scenario: Filter by customer name

- **WHEN** user passes `party_b_name=埃`
- **THEN** only documents whose `party_b_name` contains the substring are returned

### Requirement: Get sales delivery document detail

Authenticated users SHALL call `GET /api/v1/sales-deliveries/:id` and receive the header fields plus `items` array ordered by `line_no`.

#### Scenario: Detail with lines

- **WHEN** user requests an existing document id
- **THEN** response includes all header fields and each line's `product_spec`, `quantity`, `weight_kg`, `unit_price`, `amount`, `note`

#### Scenario: Not found

- **WHEN** user requests non-existent id
- **THEN** response status is 404

### Requirement: Create sales delivery document

Operators with role `operator` or `admin` SHALL create documents via `POST /api/v1/sales-deliveries` with required header fields: `doc_date`, `party_b_name`; optional: `party_a_name`, `warehouse_name`, `phone`, `paid_amount`; required `items` array (min length 1) where each item has `product_spec`, `quantity`, `weight_kg`, `unit_price`.

#### Scenario: Create success

- **WHEN** valid payload is posted
- **THEN** HTTP 201 is returned with `id`, `doc_no`, computed `total_amount`, `balance_due`, and persisted items

#### Scenario: Empty items rejected

- **WHEN** `items` is empty
- **THEN** response status is 400

### Requirement: Update sales delivery document

Operators with role `operator` or `admin` SHALL update via `PUT /api/v1/sales-deliveries/:id` with the same field set as create; item rows SHALL be replaced in full (delete existing lines for document, insert new lines).

#### Scenario: Update recalculates totals

- **WHEN** user changes line weights or prices
- **THEN** line amounts and `total_amount` / `balance_due` are recalculated and saved

### Requirement: Validation errors

The API SHALL reject invalid payloads with HTTP 400 and `{ "error": "message" }`.

#### Scenario: Missing party B

- **WHEN** `party_b_name` is empty after trim
- **THEN** response status is 400

#### Scenario: Invalid weight

- **WHEN** any item has `weight_kg` <= 0
- **THEN** response status is 400
