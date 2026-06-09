## Context

Superpowers brainstorming produced the project design at `docs/superpowers/specs/2026-06-09-api-query-predicate-params-design.md`.

The agreed convention is:

```text
qp-<field>-<operator>=<value>
```

The important decision is that `field` uses the public API field name, normally camelCase, and the backend maps it through a whitelist. This preserves the API contract and avoids exposing database column names.

Current inventory code already has partial usage:

- Excel export uses `qp-id-in` for selected row export.
- Query table status mapping has `qp-status-eq` examples.
- Warehouse list currently has a legacy `enabled=false` query and no frontend parameter object.

Changed apps:

- `apps/inventory-backend`
- `apps/inventory-front`

Read-only apps/areas:

- `apps/host`
- `apps/user-backend`
- `apps/user-front`
- `infra/*`
- `vendor/wujie`

No gateway, nginx, compose, database schema, or port changes are required.

## Goals / Non-Goals

**Goals:**

- Establish a traceable OpenSpec change for the Superpowers → OpenSpec → implementation loop.
- Add the first inventory resource migration: warehouse list predicates.
- Preserve existing warehouse list compatibility.
- Keep query parsing constrained by `field + operator` whitelist.
- Make the inventory frontend warehouse API able to pass documented `qp-*` params.

**Non-Goals:**

- Do not migrate every inventory list endpoint in this first step.
- Do not introduce OR, nested conditions, arbitrary relation paths, SQL functions, sorting, or pagination inside `qp-*`.
- Do not change response JSON field naming in this change.
- Do not change gateway paths or host navigation.

## Decisions

### 1. Start with warehouses

Warehouses are the smallest inventory list API and are used by other inventory workflows. Migrating this endpoint first gives a minimal closed loop without forcing all inventory endpoints to move at once.

Alternative considered: migrate all inventory list APIs in one pass. Rejected for this step because the user asked to start with inventory warehouses and wanted a minimal closed loop.

### 2. Keep legacy behavior for compatibility

`GET /api/inventory/v1/warehouses` continues to return enabled warehouses only. `enabled=false` remains as a compatibility entry point for callers that need all warehouses.

New predicate behavior is additive:

```text
qp-enabled-eq=false
qp-code-like=WH
qp-name-like=仓库
qp-id-eq=1
qp-id-in=1,2,3
```

Alternative considered: remove `enabled=false` immediately. Rejected because this is a migration step and existing callers should not break.

### 3. Use per-endpoint whitelist, not a generic SQL DSL

The backend parses only the warehouse fields and operators declared for this endpoint:

| Query Param | Backend behavior |
|---|---|
| `qp-id-eq` | `id = ?` |
| `qp-id-in` | `id IN ?` |
| `qp-enabled-eq` | `enabled = ?` |
| `qp-code-like` | `code LIKE ?` |
| `qp-name-like` | `name LIKE ?` |

Unsupported `qp-*` keys return 400. Invalid values such as `qp-id-in=1,abc` return 400.

Alternative considered: create a generic query predicate framework immediately. Rejected for v1 because a small per-resource whitelist is easier to review and keeps behavior explicit.

### 4. Frontend API stays L1 and parameter-focused

`apps/inventory-front/src/api/warehouses.ts` remains a thin API wrapper. It accepts a typed parameter object and builds a query string; UI components decide which filters to send.

This follows the API layering guideline:

- L1: one URL wrapper for `/warehouses`
- L0: local query string builder, no HTTP side effects

## Risks / Trade-offs

| Risk / Trade-off | Mitigation |
|---|---|
| `qp-*` and legacy `enabled=false` both exist during migration | Keep documented precedence: explicit `qp-enabled-eq` overrides the default enabled-only filter |
| Per-endpoint parsing can duplicate logic across resources | Accept duplication for the first resource; extract shared helpers only after repeated patterns appear |
| `like` semantics may vary by field | Document `like` per endpoint; warehouse uses contains matching |
| Frontend typecheck may fail under wrong Node version | Use `nvm use 20` before `pnpm typecheck`; report engine mismatch if selected Node is still too low |

## Migration Plan

1. Warehouse backend:
   - Add `WarehouseListFilter`.
   - Add handler parser for accepted warehouse `qp-*` predicates.
   - Return 400 for invalid/unsupported predicates.
   - Keep no-query and `enabled=false` compatibility.
2. Warehouse frontend:
   - Add typed optional params to `listWarehouses`.
   - Preserve no-argument calls.
3. Verification:
   - `apps/inventory-backend`: `go test ./...`
   - `apps/inventory-front`: `nvm use 20 && pnpm typecheck`
4. Follow-up resources:
   - Migrate product list, inventory transaction list/export, and sales delivery list/export in separate task groups.

Rollback:

- Remove warehouse `qp-*` parser and restore the previous boolean `List(ctx, enabledOnly)` signature if needed.
- Keep `enabled=false` compatibility during rollback, so existing callers remain safe.

## Open Questions

- Should response JSON fields such as `created_at` later move to camelCase? This change only covers query param field naming.
- Should product/transaction/sales list migrations keep old parameters indefinitely or define a cleanup change later?
