## ADDED Requirements

### Requirement: AG Grid dependency

The inventory front SHALL depend on `ag-grid-community` and `ag-grid-react` and import AG Grid base styles on the transaction list page.

#### Scenario: Grid renders

- **WHEN** authenticated user opens the transaction list route
- **THEN** an AG Grid instance is visible with column headers

### Requirement: Transaction list route and navigation

The front SHALL register route `/transactions` (label「出入库单」) in shell navigation and protect it with the same JWT gate as other inventory pages.

#### Scenario: Navigation entry

- **WHEN** operator opens the inventory sub-app shell
- **THEN** menu includes an item that routes to `/transactions`

#### Scenario: Wujie route sync

- **WHEN** Host emits `inventory-front-route` with path `/transactions`
- **THEN** child router shows the transaction list page

### Requirement: Grid columns

The transaction list page SHALL display AG Grid columns for: `id`, transaction type (localized 入库/出库), `party_name`, `party_contact`, `goods_detail`, `quantity`, warehouse name, `reference_no`, `note`, `biz_at`, `created_at`, `updated_at`.

#### Scenario: Column data binding

- **WHEN** list API returns items
- **THEN** each row shows the corresponding field values in the grid

### Requirement: Query toolbar

The page SHALL provide a compact filter area (Ant Design Form) with: type select (all/in/out), party name input, optional date range on `biz_at`, and a Search button that reloads grid data from `GET /api/v1/inventory-transactions`.

#### Scenario: Search refreshes data

- **WHEN** user sets filters and clicks Search
- **THEN** grid row data reflects filtered API results

### Requirement: Create and edit actions

The page SHALL provide toolbar buttons: 新增 (create) and 编辑 (edit). 编辑 SHALL require exactly one selected grid row. Both actions SHALL open an Ant Design Modal form with fields: type, party_name, party_contact, goods_detail (textarea), quantity, warehouse (select), optional product (select), reference_no, note, biz_at (datetime).

#### Scenario: Create success

- **WHEN** user submits valid create form
- **THEN** modal closes, grid reloads, and the new row appears

#### Scenario: Edit success

- **WHEN** user selects one row, opens edit, submits valid changes
- **THEN** modal closes and the row shows updated values after reload

#### Scenario: Edit without selection

- **WHEN** user clicks 编辑 with no row selected
- **THEN** UI shows a warning and does not open the modal

### Requirement: API client integration

The page SHALL call inventory APIs under `/api/inventory/v1/inventory-transactions` with Bearer token from `ims_token`.

#### Scenario: Unauthorized

- **WHEN** API returns 401
- **THEN** user is redirected to `/login`

### Requirement: Pagination with grid

The page SHALL request paginated data from the backend and display current page controls (Ant Design Pagination or equivalent) that update grid `rowData` when page or page size changes.

#### Scenario: Page change

- **WHEN** user changes to page 2
- **THEN** grid loads the second page of results from the API
