## 1. Backend: Excel export APIs (`apps/inventory-backend`)

- [x] 1.1 Add Go Excel generation dependency compatible with Go 1.22
- [x] 1.2 Add exporter for inventory transactions workbook
- [x] 1.3 Add exporter for sales deliveries workbook with `单据汇总` and `明细行` sheets
- [x] 1.4 Add `qp-id-in` parser and invalid ID handling
- [x] 1.5 Extend repositories with ID filtering and explicit `NoLimit` export mode
- [x] 1.6 Add `GET /api/v1/inventory-transactions/export`
- [x] 1.7 Add `GET /api/v1/sales-deliveries/export`
- [x] 1.8 Add tests for workbook contents, ID parsing, and pagination boundary
- [x] 1.9 Verify with `GOTOOLCHAIN=local go test ./...`

Implementation trace: `apps/inventory-backend` commit `be7b116 feat: add backend Excel exports for inventory lists`.

## 2. Frontend: list export actions (`apps/inventory-front`)

- [x] 2.1 Add authenticated file download helper
- [x] 2.2 Add export API functions for inventory transactions and sales deliveries
- [x] 2.3 Change transaction AG Grid selection from single-row to multi-row while keeping edit limited to exactly one row
- [x] 2.4 Add transaction list export button and selected-vs-filtered parameter logic
- [x] 2.5 Add sales delivery Table row selection
- [x] 2.6 Add sales delivery export button and selected-vs-filtered parameter logic
- [x] 2.7 Clear selected row IDs on query, page change, page size change, and successful reload
- [x] 2.8 Verify with Node 20.19.5 `npm run typecheck` and `npm run build`

Implementation trace: `apps/inventory-front` commit `897c60d feat: add inventory list Excel export actions`.

## 3. Documentation and OpenSpec trace (`k-project` root)

- [x] 3.1 Update `docs/INVENTORY_SYSTEM.md` to mention current export-capable inventory front routes
- [x] 3.2 Create this retrospective OpenSpec change because implementation happened before `/opsx-propose`
- [ ] 3.3 Optional Host/manual acceptance: login through Host, open inventory, export selected and filtered rows for both lists, verify downloaded Excel sheets
- [ ] 3.4 Optional archive: after manual acceptance, run `/opsx-archive inventory-list-excel-export`

Documentation trace: root commit `1c38ccb docs: update current inventory front routes`; OpenSpec trace added by this retrospective change.
