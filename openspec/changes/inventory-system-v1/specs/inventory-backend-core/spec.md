## ADDED Requirements

### Requirement: Health endpoint

The inventory backend SHALL expose `GET /healthz` returning HTTP 200 and `{ "status": "ok" }` without authentication.

#### Scenario: Health check

- **WHEN** client calls `GET /healthz`
- **THEN** response status is 200 and body contains `status` equal to `ok`

### Requirement: Admin bootstrap on empty database

When the users table has zero rows and bootstrap credentials are configured, the system SHALL create one admin user on startup.

#### Scenario: First startup creates admin

- **WHEN** no users exist and `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` are set
- **THEN** one user with role `admin` exists with that email

### Requirement: Login without public registration

The system SHALL provide `POST /api/v1/auth/login` and SHALL NOT expose public registration when `ALLOW_REGISTER=false`.

#### Scenario: Login success

- **WHEN** valid email and password are posted to `/api/v1/auth/login`
- **THEN** response includes JWT `token` and user object without password fields

#### Scenario: Registration disabled

- **WHEN** `ALLOW_REGISTER` is false and client posts to `/api/v1/auth/register` if routed
- **THEN** response status is 403

### Requirement: Admin creates users

Only users with role `admin` SHALL create accounts via `POST /api/v1/users` with roles `admin` or `operator`.

#### Scenario: Admin creates operator

- **WHEN** admin posts valid username, email, password, role `operator`
- **THEN** response status is 201 and new user is persisted

### Requirement: Product master data

The system SHALL store products with unique SKU, name, unit, reorder_point, and enabled flag. Admin SHALL create, update, and soft-delete (enabled=false); authenticated operators SHALL list and read.

#### Scenario: Create product

- **WHEN** admin posts unique SKU and name
- **THEN** product is created and returned with HTTP 201

#### Scenario: Duplicate SKU rejected

- **WHEN** admin posts SKU that already exists
- **THEN** response status is 409

### Requirement: Warehouse master data

The system SHALL store warehouses with unique code and name. Admin SHALL create and update; authenticated operators SHALL list.

#### Scenario: List warehouses

- **WHEN** authenticated user calls `GET /api/v1/warehouses`
- **THEN** response includes enabled warehouses by default

### Requirement: Stock levels per product and warehouse

The system SHALL maintain at most one `stock_levels` row per (product_id, warehouse_id) with quantity and version for optimistic locking.

#### Scenario: First movement creates level

- **WHEN** stock movement applies to a pair with no existing level
- **THEN** a level row is created with quantity reflecting the delta

### Requirement: Stock movements with transactional integrity

Stock in, stock out, and adjust operations SHALL run in a database transaction, append an immutable movement row, and update level quantity and version atomically.

#### Scenario: Stock in increases quantity

- **WHEN** operator posts valid stock-in with positive quantity
- **THEN** movement type is `in`, quantity_delta is positive, and level quantity increases

#### Scenario: Stock out allows negative balance

- **WHEN** operator posts stock-out exceeding on-hand quantity
- **THEN** operation succeeds and level quantity MAY become negative

#### Scenario: Version conflict

- **WHEN** concurrent updates cause version mismatch
- **THEN** response status is 409 with retry guidance

### Requirement: Dashboard metrics

Authenticated users SHALL read `GET /api/v1/dashboard` with low-stock count and today's movement count.

#### Scenario: Dashboard response

- **WHEN** authenticated user requests dashboard
- **THEN** response includes `low_stock_count` and `movements_today` numeric fields
