## Why

库存子应用的出入库单和销售发货单已经成为日常查询入口，业务需要把列表数据导出给对账、留档和线下沟通使用。此前 `inventory-transaction-ag-grid` 明确把「导出 Excel」列为后续项，本变更补齐这项能力，并追溯记录已完成实现，避免功能只存在于代码提交中而缺少 OpenSpec 轨迹。

## What Changes

- **`apps/inventory-backend`**：新增两个后端生成 Excel 的导出接口：
  - `GET /api/v1/inventory-transactions/export`
  - `GET /api/v1/sales-deliveries/export`
- **筛选契约**：导出接口复用列表筛选条件，并新增 `qp-id-in` 多值 ID 筛选；有选中行时导出选中 ID，无选中行时导出当前筛选条件下的全部结果。
- **销售发货单导出**：生成两个 Sheet：`单据汇总` 与 `明细行`。
- **`apps/inventory-front`**：出入库单 AG Grid 和销售发货单 Table 支持多选；工具栏新增「导出」按钮；查询、分页、刷新后清空选择，避免导出旧选择。
- **补录说明**：本 change 为追溯型 OpenSpec，业务代码已在 `apps/inventory-backend`、`apps/inventory-front` 的 `main` 分支提交并推送；本次补齐 proposal/spec/design/tasks 作为需求真源。

**Non-goals**：

- 不新增网关路径、端口或 Host 导航配置。
- 不实现异步导出任务、导出历史、权限细分或大文件后台下载。
- 不扩展商品/仓库/库存余额等其它页面的导出。

## Capabilities

### New Capabilities

- `inventory-list-excel-export`: 库存列表 Excel 导出，包括出入库单和销售发货单的筛选导出、选中导出和销售发货单双 Sheet 导出。

### Modified Capabilities

（无已归档 capability；本变更依赖 `inventory-transaction-ag-grid` 与 `sales-delivery-list` 的列表能力，在新 capability 中描述导出行为。）

## Impact

- **应用**：`apps/inventory-backend`、`apps/inventory-front`
- **API**：新增 `/api/v1/inventory-transactions/export`、`/api/v1/sales-deliveries/export`
- **依赖**：`apps/inventory-backend` 增加 `github.com/xuri/excelize/v2`（Go 1.22 兼容版本）
- **前端行为**：两个列表页新增多选和导出按钮；选中行优先导出，未选中时按当前筛选导出全量
- **验证**：`apps/inventory-backend` 运行 `GOTOOLCHAIN=local go test ./...`；`apps/inventory-front` 在 Node 20.19.5 下运行 `npm run typecheck`、`npm run build`
