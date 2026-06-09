## Why

库存接口已经在导出和查询表配置中零散使用 `qp-id-in`、`qp-status-eq`，但还没有形成可追踪的前后端契约。现在需要把 Superpowers 头脑风暴确定的 `qp-<field>-<operator>=<value>` 规范落到库存前后端接口，并用 OpenSpec 建立从设计到实现的最小闭环。

## What Changes

- Introduce a constrained inventory API query predicate contract using `qp-<field>-<operator>=<value>`.
- Require `field` to use public API field names, with backend whitelist mapping to internal query fields.
- Keep pagination (`page`, `page_size`), sorting, and global search (`q`) outside `qp-*`.
- Start implementation with the warehouse list API:
  - backend supports `qp-id-eq`, `qp-id-in`, `qp-enabled-eq`, `qp-code-like`, `qp-name-like`
  - frontend warehouse API can pass optional `qp-*` params
  - existing no-param warehouse list behavior remains compatible
- Establish a follow-up checklist for migrating other inventory list/export APIs.

## Capabilities

### New Capabilities

- `inventory-query-predicate-params`: Inventory APIs accept a constrained `qp-*` query predicate contract for list/export filters, starting with warehouses.

### Modified Capabilities

- None. Existing inventory list/export specs remain valid; this change formalizes and extends the query parameter contract.

## Impact

- `apps/inventory-backend`
  - Warehouse handler/repository query parsing
  - Handler tests for accepted and rejected `qp-*` predicates
- `apps/inventory-front`
  - Warehouse API client parameter shape
- Existing gateway path stays unchanged: `/api/inventory/v1/warehouses`
- No database schema, port, nginx, compose, or host navigation changes.
