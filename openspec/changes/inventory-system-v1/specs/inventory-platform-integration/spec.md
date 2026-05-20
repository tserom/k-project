## ADDED Requirements

### Requirement: Port registry

Inventory services SHALL use ports **8103** (front) and **8501** (backend) documented in `docs/WORKSPACE.md` and reflected in Vite, container nginx, and gateway config.

#### Scenario: Dev server port

- **WHEN** developer runs inventory-front dev server
- **THEN** it listens on port 8103

### Requirement: Gateway path routing

The gateway SHALL route `/micro/inventory/` to inventory-front and `/api/inventory/` to inventory-backend with path rewrite to service-internal `/api/`.

#### Scenario: Subapp static assets

- **WHEN** browser requests `http://k-project.com/micro/inventory/`
- **THEN** gateway proxies to inventory-front after stripping prefix

#### Scenario: API proxy

- **WHEN** browser requests `http://k-project.com/api/inventory/v1/products`
- **THEN** inventory-backend receives `GET /api/v1/products`

### Requirement: Gateway resilient DNS for inventory upstreams

Gateway nginx configuration SHALL resolve inventory backend and front hostnames at request time so gateway can start even if inventory containers are not yet registered.

#### Scenario: Gateway starts before inventory-backend

- **WHEN** gateway container starts while inventory-backend is still starting
- **THEN** nginx process does not exit solely due to unresolved `inventory-backend` hostname

### Requirement: Docker Compose services

Compose SHALL include `inventory-backend`, `inventory-front`, and mysql init creating database `inventory`; gateway depends on inventory services.

#### Scenario: Compose inventory database

- **WHEN** mysql initializes on fresh volume
- **THEN** database `inventory` exists

### Requirement: Navigation exposes inventory app

`user-backend` `GET /api/v1/navigation` SHALL include app key `inventory` with routes for IMS pages and merge `entryUrl` from `MICRO_INVENTORY_ENTRY_URL` default `/micro/inventory/`.

#### Scenario: Navigation entry URL

- **WHEN** Host fetches navigation with default env
- **THEN** inventory app includes `entryUrl` `/micro/inventory/` and `subAppBusName` `inventory-front`

### Requirement: Host subapp route event per bus name

Host `SubAppView` SHALL emit route events as `{subAppBusName}-route` instead of hardcoding only `user-front-route`.

#### Scenario: Inventory receives route event

- **WHEN** Host activates inventory tab with subAppBusName `inventory-front`
- **THEN** bus emits `inventory-front-route` with path and instanceId
