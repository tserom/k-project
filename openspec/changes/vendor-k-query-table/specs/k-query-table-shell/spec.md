## ADDED Requirements

### Requirement: Five-region page layout

`KQueryTable` SHALL render, top to bottom: search form, optional status tabs, optional toolbar, data table, and pagination bar matching enterprise query-list page structure.

#### Scenario: Full layout with all optional regions

- **WHEN** config includes `fields`, `statusMapping`, `actionsRender`, `columns`, and `remoteDataSource`
- **THEN** all five regions are visible in order with consistent vertical spacing

### Requirement: Search and reset actions

The search form region SHALL provide primary **查询** and **重置** actions that trigger data refresh and clear form fields respectively.

#### Scenario: Reset clears filters

- **WHEN** user clicks reset
- **THEN** form fields return to initial values and table reloads with cleared filters

### Requirement: Status tab badges

When `statusMapping` is provided, status tabs SHALL display optional numeric `count` as antd Badge on tab label.

#### Scenario: Tab badge display

- **WHEN** status item has `count: 53206`
- **THEN** tab label shows count badge next to label text

### Requirement: Loading and empty states

The table region SHALL show antd Table `loading` during fetch and empty text when `list` is empty.

#### Scenario: Loading indicator

- **WHEN** remote request is in flight
- **THEN** table displays loading spinner overlay

### Requirement: Pagination defaults

Pagination SHALL default to page size 20, show total count, and support page change triggering `remoteDataSource` with updated `current` and `pageSize`.

#### Scenario: Page change refetch

- **WHEN** user selects page 2
- **THEN** component requests data with `current: 2` (or equivalent) in converted params

### Requirement: Auto init fetch

When `config.autoInit` is not `false`, component SHALL fetch table data once on mount.

#### Scenario: Initial load

- **WHEN** component mounts with valid `remoteDataSource`
- **THEN** first request runs without user clicking search

### Requirement: Imperative refresh API

`KQueryTable` ref SHALL expose `refresh()` to reload current query from parent.

#### Scenario: Parent triggers refresh

- **WHEN** parent calls `ref.current.refresh()`
- **THEN** table reloads using current form values and pagination

### Requirement: Demo page

Package SHALL include a demo route/page that reproduces a simplified inbound-order style config (multi filters, status tabs, toolbar buttons, link column) using mock or public API data.

#### Scenario: Demo smoke test

- **WHEN** developer opens demo in browser
- **THEN** table shows rows and pagination without console errors
