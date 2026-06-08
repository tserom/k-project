## ADDED Requirements

### Requirement: Sales delivery routes and navigation

The inventory front SHALL register routes `/sales-deliveries` (list), `/sales-deliveries/new` (create), `/sales-deliveries/:id` (detail/view), and `/sales-deliveries/:id/edit` (edit), with shell navigation label「销售发货单」 protected by the same JWT gate as other inventory pages.

#### Scenario: Navigation entry

- **WHEN** operator opens the inventory sub-app shell
- **THEN** menu includes an item that routes to `/sales-deliveries`

#### Scenario: Wujie route sync

- **WHEN** Host emits `inventory-front-route` with path `/sales-deliveries`
- **THEN** child router shows the sales delivery list page

### Requirement: Sales delivery list page

The list page SHALL display an Ant Design Table with columns: `doc_no`, `doc_date`, `party_b_name`, `party_a_name`, `warehouse_name`, `total_amount`, `paid_amount`, `balance_due`, `created_at`, and actions「查看」「编辑」.

#### Scenario: List loads data

- **WHEN** user opens `/sales-deliveries`
- **THEN** table shows paginated results from `GET /api/v1/sales-deliveries`

#### Scenario: Filter and search

- **WHEN** user sets date range or customer name filter and clicks Search
- **THEN** table reloads with filtered API results

### Requirement: Create and edit form layout

The create and edit pages SHALL render a form titled「销售发货清单（还款协议）」 with header fields: `party_a_name` (甲方), `party_b_name` (乙方), `doc_date` (日期), `warehouse_name` (发货仓库), `phone` (电话); defaults for `party_a_name` and `warehouse_name` MAY be prefilled from app constants.

#### Scenario: Default seller and warehouse

- **WHEN** user opens `/sales-deliveries/new`
- **THEN** 甲方 and 发货仓库 fields show configured default values and remain editable

### Requirement: Dynamic line items table

The form SHALL use `Form.List` (or equivalent) for line items with columns: 品名规格 (`product_spec`), 数量 (`quantity`), 重量 kg (`weight_kg`), 单价 (`unit_price`), 金额 (`amount`, read-only), 备注 (`note`); users SHALL add and remove rows.

#### Scenario: Auto-calculate line amount

- **WHEN** user enters or changes `weight_kg` or `unit_price` on a row
- **THEN** that row's 金额 field updates to `weight_kg * unit_price` rounded to 2 decimals without submitting

#### Scenario: Add row

- **WHEN** user clicks「添加一行」
- **THEN** a new empty line item row appears

### Requirement: Footer totals on form

The form SHALL display: 合计 (numeric `total_amount`, sum of line amounts), 合计大写 (Chinese uppercase of `total_amount`), 已付款 (`paid_amount` input), 尚欠款 (`balance_due`, read-only, `total_amount - paid_amount`).

#### Scenario: Balance updates on paid amount change

- **WHEN** user changes 已付款
- **THEN** 尚欠款 updates immediately on the client

### Requirement: Form submit

Submit SHALL call `POST /api/v1/sales-deliveries` on create or `PUT /api/v1/sales-deliveries/:id` on edit; on success navigate to detail or list and show success message.

#### Scenario: Create success

- **WHEN** user submits a valid new form
- **THEN** API create succeeds and user is redirected to the new document detail or list

#### Scenario: Validation before submit

- **WHEN** required fields are missing or no line items exist
- **THEN** form shows field errors and does not call API

### Requirement: Document detail view

The detail page SHALL show the same header, line table, and footer totals as the form in read-only mode, plus static terms text matching the paper form footer (payment deadline, dispute court, return policy).

#### Scenario: View saved document

- **WHEN** user opens `/sales-deliveries/:id`
- **THEN** all saved fields and line items are displayed read-only

### Requirement: API client integration

The front SHALL call APIs under `/api/inventory/v1/sales-deliveries` with Bearer token from `ims_token`.

#### Scenario: Unauthorized

- **WHEN** API returns 401
- **THEN** user is redirected to `/login`
