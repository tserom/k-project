## 1. OpenSpec Artifacts

- [x] 1.1 Capture Superpowers brainstorming output in `docs/superpowers/specs/2026-06-09-api-query-predicate-params-design.md`
- [x] 1.2 Create OpenSpec proposal, specs, design, and tasks for `inventory-query-predicate-params`

## 2. apps/inventory-backend

- [x] 2.1 Add warehouse `qp-*` parser for `qp-id-eq`, `qp-id-in`, `qp-enabled-eq`, `qp-code-like`, and `qp-name-like`
- [x] 2.2 Return HTTP 400 for invalid or unsupported warehouse predicates
- [x] 2.3 Replace warehouse list boolean argument with a filter struct
- [x] 2.4 Preserve default enabled-only warehouse list behavior and legacy `enabled=false`
- [x] 2.5 Add handler tests for accepted and rejected warehouse predicates
- [x] 2.6 Run `gofmt` and `go test ./...` in `apps/inventory-backend`

## 3. apps/inventory-front

- [x] 3.1 Add typed optional `qp-*` params to `src/api/warehouses.ts`
- [x] 3.2 Preserve no-argument `listWarehouses()` behavior
- [x] 3.3 Run `nvm use 20 && pnpm typecheck` in `apps/inventory-front`

## 4. Follow-up Inventory Resources

- [x] 4.1 Migrate product list `enabled` to `qp-enabled-eq` (keep `q` for multi-field search; pagination uses `currentPage` / `pageSize`)
- [x] 4.2 Migrate inventory transaction list/export to `qp-*` filters and `currentPage` / `pageSize` (no legacy params)
- [x] 4.3 Migrate sales delivery list/export to `qp-*` filters and `currentPage` / `pageSize` (no legacy params)
- [x] 4.4 Add per-resource tests for transaction and sales delivery filter parsers plus `parsePageQuery`

## 5. Cross-Repo Commit Notes

- [ ] 5.1 Commit OpenSpec artifacts and Cursor rules in the root `k-project` repository
- [ ] 5.2 Commit backend implementation in `apps/inventory-backend`
- [ ] 5.3 Commit frontend implementation in `apps/inventory-front`
