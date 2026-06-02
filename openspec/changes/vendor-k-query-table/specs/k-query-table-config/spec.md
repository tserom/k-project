## ADDED Requirements

### Requirement: Single config prop

`KQueryTable` SHALL accept one primary prop `config` of type `KQueryTableConfig` (or spread equivalent) that drives all sub-regions.

#### Scenario: Minimal config render

- **WHEN** consumer passes `config` with `fields`, `columns`, and `remoteDataSource`
- **THEN** component renders search area, table, and pagination without additional JSX children

### Requirement: Search fields shape

`config.fields` SHALL be an array of `{ name, label, field: { type, props? }, hidden?, initialValue? }` where `type` is a registered field type string.

#### Scenario: Input field binding

- **WHEN** `field.type` is `input` and user submits search
- **THEN** form values include `fields[].name` keys in query parameters passed to `remoteDataSource`

### Requirement: Table columns shape

`config.columns` SHALL be an array compatible with antd `Table` columns: at minimum `key` or `dataIndex`, `title`, optional `width`, `fixed`, `render`.

#### Scenario: Custom cell render

- **WHEN** column defines `render({ text, record, index })`
- **THEN** table cell displays return value of render function

### Requirement: Remote data source contract

`config.remoteDataSource` SHALL support `url`, `method`, optional `convertParams({ params })`, and `converter({ data })` returning `{ list, total }`.

#### Scenario: Paginated fetch

- **WHEN** user changes page or clicks search
- **THEN** component calls remote with merged filter values and pagination, then sets table `dataSource` from `converter` result

### Requirement: Status tabs mapping

Optional `config.statusMapping` SHALL be an array of `{ label, key, value?, count? }` where selecting a tab merges `key=value` into query params.

#### Scenario: Status filter

- **WHEN** user selects tab with `key: 'qp-status-eq'` and `value: 1`
- **THEN** next `remoteDataSource` request includes that query field

### Requirement: Toolbar actions

Optional `config.actionsRender` SHALL be an array of action descriptors with `type: 'button'`, `props` (antd Button props), and optional `onClick` or action id for future plugin use.

#### Scenario: Toolbar button visible

- **WHEN** `actionsRender` contains a primary button descriptor
- **THEN** toolbar region renders antd Button with given `props.children`

### Requirement: Row selection passthrough

Optional `config.rowSelection` and `config.rowKey` SHALL be forwarded to antd Table row selection API.

#### Scenario: Row select callback

- **WHEN** `rowSelection.onChange` is provided
- **THEN** component invokes it when user checks rows

### Requirement: Unsupported Bs features documented

v1 config SHALL NOT require `tableCode`, `tradeType`, `code` (permission), or `BUSINESS_FLOW_BUTTONS`; documentation SHALL list these as unsupported relative to `BsSulaQueryTable`.

#### Scenario: Bs-only config ignored safely

- **WHEN** consumer passes unknown keys such as `tableCode`
- **THEN** component ignores them without runtime error
