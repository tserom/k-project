## ADDED Requirements

### Requirement: API base path configuration

The inventory front SHALL call APIs under `/api/inventory/v1` via `VITE_API_BASE=/api/inventory` (or dev proxy equivalent).

#### Scenario: Authenticated API call

- **WHEN** user is logged in and front fetches protected resource
- **THEN** request URL starts with `/api/inventory/v1` and includes `Authorization: Bearer` header

### Requirement: Login page

The front SHALL provide `/login` with email/password form, store JWT in localStorage key `ims_token`, and redirect to dashboard on success.

#### Scenario: Successful login

- **WHEN** user submits valid credentials
- **THEN** token is stored and user navigates to `/`

### Requirement: Protected shell layout

Routes except `/login` SHALL require a valid token and redirect unauthenticated users to `/login`.

#### Scenario: Unauthenticated access

- **WHEN** user opens `/products` without token
- **THEN** browser navigates to `/login`

### Requirement: Wujie route synchronization

When running inside wujie, the front SHALL subscribe to `inventory-front-route` and emit `sub-route-change` with app name `inventory-front` on internal navigation.

#### Scenario: Parent navigates sub-route

- **WHEN** Host emits `inventory-front-route` with path `/products`
- **THEN** child router navigates to `/products`

#### Scenario: Child notifies parent

- **WHEN** user navigates inside child to `/stock`
- **THEN** bus emits `sub-route-change` with `inventory-front` and path `/stock`

### Requirement: Core inventory pages

The front SHALL provide pages for dashboard, products, warehouses, stock levels, movement list, stock-in form, and stock-out form aligned with navigation routes.

#### Scenario: Product list for operator

- **WHEN** operator opens `/products`
- **THEN** table lists products with search; create/edit controls hidden for non-admin

#### Scenario: Negative stock highlight

- **WHEN** stock page shows row with quantity less than zero
- **THEN** quantity is visually distinguished (e.g. red tag)
