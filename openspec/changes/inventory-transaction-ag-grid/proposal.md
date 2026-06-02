## Why

库存子应用需要一张**以出入库单为中心**的查询页：业务侧货品多为不锈钢板、棒材等非标规格，不适合只靠 SKU 主数据表驱动列表；操作员更关心「谁（主体）、什么人、发了什么货、什么时候」的一览与维护。现有 `inventory-system-v1` 流水页基于 Ant Design Table 且 `stock_movements` 为只追加、字段偏 `product_id`/`warehouse_id`，与「可编辑的单据 + 自由文本货品详情」诉求不一致。

本变更在 IMS 内引入 **AG Grid** 驱动的**出入库单查询页**（查询 / 新增 / 编辑），字段与交互从简，作为库存子应用 v1 之后的首个业务向增量。

## What Changes

- **`apps/inventory-front`**：新增路由（建议 `/transactions`）及导航项「出入库单」；使用 **AG Grid Community**（`ag-grid-react` + `ag-grid-community`）展示分页列表；顶部简易筛选（类型、主体名称、时间范围）；工具栏「新增」「编辑」打开 **Ant Design Modal + Form**（表格与表单分工：Grid 负责浏览，antd 负责录入）
- **`apps/inventory-backend`**：新增 **`inventory_transactions`**（或等价命名）资源：`GET` 分页列表、`POST` 创建、`PUT` 按 id 更新；响应/请求体包含 `id`、出入库类型、`party_name`（主体名称）、`party_contact`（主体人）、`goods_detail`（货品详情，自由文本）、`quantity`、`warehouse_id`（可选）、`reference_no`、`note`、时间戳字段
- **与库存联动（从简）**：创建/更新单据时在同一事务内写入 `stock_movements` 并更新 `stock_levels`（沿用既有乐观锁）；v1 **不做**删除、审批流、附件、打印
- **依赖**：`inventory-front` 增加 `ag-grid-react`、`ag-grid-community`；主题与 Ant Design 5 并存（Grid 独立样式）

**v1 明确不做**：多行明细子表、条码、供应商主数据、批次、导出 Excel、AG Grid Enterprise、替换其它页面（商品/仓库仍用原 antd 表）

## Capabilities

### New Capabilities

- `inventory-transaction-document-api`: 出入库单 CRUD 与分页查询 API、数据模型、与 `stock_movements`/`stock_levels` 的最小联动
- `inventory-transaction-ag-grid-page`: 子应用 AG Grid 列表页、筛选、新增/编辑弹窗及 API 对接

### Modified Capabilities

（`openspec/specs/` 尚无归档 spec；与 `openspec/changes/inventory-system-v1` 的实现契约对齐并扩展，不单独写 delta 文件。）

- `inventory-front-mfe`（变更 `inventory-system-v1`）：增加「出入库单」路由与导航；流水页可保留或重定向至新页（实现时二选一，默认新路由为主入口）
- `inventory-backend-core`（变更 `inventory-system-v1`）：在只追加流水之外，增加可更新的「单据」聚合字段或独立表（见 design.md）

## Impact

- **应用**：`apps/inventory-front`、`apps/inventory-backend`
- **数据**：MySQL `inventory` 库新表或扩展字段；迁移脚本
- **依赖**：前端新增 AG Grid 包体积；无网关路径变更（仍 `/api/inventory/v1`）
- **文档**：`docs/INVENTORY_SYSTEM.md` 补充出入库单字段说明（实现阶段）
- **关系**：依赖 `inventory-system-v1` 已交付的认证、仓库、商品与库存服务；可与 `vendor-k-query-table` 并行，本页 **不** 采用 KQueryTable
