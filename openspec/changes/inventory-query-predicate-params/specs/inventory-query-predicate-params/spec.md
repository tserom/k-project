## ADDED Requirements

### Requirement: Inventory APIs accept constrained query predicates

Inventory list and export APIs that opt into query predicates SHALL accept filters in the form `qp-<field>-<operator>=<value>`.

The `field` segment SHALL use the public API field name, not the database column name. The backend SHALL map each allowed `field + operator` pair through an explicit whitelist.

#### Scenario: Accepted warehouse predicate filters

- **WHEN** a user calls `GET /api/inventory/v1/warehouses?qp-enabled-eq=false&qp-code-like=WH&qp-name-like=仓库`
- **THEN** the backend filters warehouses by enabled state, code, and name according to the registered whitelist
- **AND** the backend treats all values as data, not SQL expressions

#### Scenario: Invalid warehouse predicate returns 400

- **WHEN** a user calls `GET /api/inventory/v1/warehouses?qp-id-in=1,abc`
- **THEN** the backend responds with HTTP 400
- **AND** the response includes an error message for the invalid predicate

#### Scenario: Unsupported warehouse predicate returns 400

- **WHEN** a user calls `GET /api/inventory/v1/warehouses?qp-unknown-eq=1`
- **THEN** the backend responds with HTTP 400
- **AND** no warehouse query is executed with the unsupported field

### Requirement: Warehouse list preserves existing compatibility

The warehouse list API SHALL preserve existing no-parameter behavior while adding the new `qp-*` filters.

#### Scenario: No query returns enabled warehouses

- **WHEN** a user calls `GET /api/inventory/v1/warehouses` without query parameters
- **THEN** the backend returns enabled warehouses only

#### Scenario: Legacy enabled=false remains compatible

- **WHEN** a user calls `GET /api/inventory/v1/warehouses?enabled=false`
- **THEN** the backend returns warehouses without the default enabled-only filter

### Requirement: Frontend warehouse API can send predicates

The inventory frontend warehouse API client SHALL allow callers to pass documented warehouse `qp-*` predicates without changing existing no-argument calls.

#### Scenario: Existing callers remain valid

- **WHEN** frontend code calls `listWarehouses()` with no arguments
- **THEN** the request still targets `/warehouses`
- **AND** existing warehouse selectors continue to receive the same response shape

#### Scenario: Predicate callers encode query string values

- **WHEN** frontend code calls `listWarehouses({ "qp-enabled-eq": false, "qp-code-like": "WH" })`
- **THEN** the request targets `/warehouses?qp-enabled-eq=false&qp-code-like=WH`

### Requirement: Non-predicate query concerns stay outside qp

Inventory APIs SHALL keep pagination, sorting, and global or multi-field search outside `qp-*`.

#### Scenario: Pagination is not encoded as qp

- **WHEN** a future inventory list API supports pagination
- **THEN** it uses `page` and `page_size` or an explicitly documented pagination contract
- **AND** it does not use `qp-page-*` or `qp-pageSize-*`
