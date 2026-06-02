## Context

- k-project 库存域：`apps/inventory-front`（React 19 + Ant Design 5 + Vite 8103）、`apps/inventory-backend`（Gin/GORM，库 `inventory`），API 前缀 `/api/inventory/v1`。
- `inventory-system-v1` 已实现 `stock_movements` **只追加**、列表字段以 `product_id` / `warehouse_id` 为主，适合标准 SKU 场景。
- 业务诉求：不锈钢板、棒材等**非标货品**以自由文本 `goods_detail` 描述；列表需展示 **主体名称**、**主体人**；单据可 **编辑**；列表用 **AG Grid**（用户所称 ad-grid 按 **AG Grid Community** 实现）。
- Host 无界、`WujieRouteBridge` 约定不变；本页不引入 `vendor/k-query-table`。

## Goals / Non-Goals

**Goals:**

- 一张「出入库单」页：AG Grid 列展示 `id`、类型、主体名称、主体人、货品详情、数量、仓库、单号/备注、创建/更新/业务时间；支持筛选与分页
- 工具栏：查询（刷新列表）、新增、编辑（单选一行）
- 后端：`inventory_transactions` 表 + REST；保存时同步一条 `stock_movements` 并更新 `stock_levels`（复用 `stock_service` 事务模式）
- 非标货：可不选 `product_id`；若未选商品，用 **占位 SKU**（如 `MISC-{id}`）或 **虚拟商品**「杂项」保证库存维度一致（实现二选一，见决策 3）

**Non-Goals:**

- AG Grid Enterprise（分组、透视、服务端行模型 enterprise 特性）
- 多单明细行、删除、作废、审批、打印、导入导出
- 替换商品/仓库/仪表盘等现有 antd 页面
- 与 `user-backend` SSO

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | 表格库 | `ag-grid-community` + `ag-grid-react`（Community） | 用户指定；Community 满足列表+排序+筛选列；许可简单 |
| 2 | 录入 UI | Ant Design 5 `Modal` + `Form` | 从简；避免 AG Grid 企业级编辑插件；与现有子应用一致 |
| 3 | 数据模型 | 新表 `inventory_transactions` + 可选 `movement_id` FK | 与只追加 `stock_movements` 解耦；编辑时 **冲销旧 movement + 写新 movement** 或 **更新 level 差量**（v1 采用：编辑时若已有 `movement_id` 则反向冲销再应用新值，同事务） |
| 4 | 商品关联 | `product_id` **可空**；空时后端绑定 `products` 中 code=`MISC` 的杂项 SKU | 保留库存维度；`goods_detail` 存业务描述 |
| 5 | 类型字段 | `type`: `in` \| `out` | 与 `stock_movements.type` 对齐 |
| 6 | 时间字段 | `biz_at`（业务发生时间，可编辑）、`created_at`、`updated_at`（系统） | 满足「各种时间」展示；列表默认按 `biz_at` DESC |
| 7 | 列表 API | `GET /api/v1/inventory-transactions?page&page_size&type&party_name&q&biz_from&biz_to` | 单一资源；`q` 匹配主体/货品详情 |
| 8 | 路由 | `/transactions` + 导航 label「出入库单」 | 与 `/movements` 区分；旧流水页可链到新页 |
| 9 | Grid 数据模式 | **Client-side row model**：每页请求后端，setRowData | 从简；数据量预期 < 几万 |

### 字段映射（列表列）

| 列（UI） | 字段 |
|----------|------|
| ID | `id` |
| 类型 | `type` → 入库/出库 |
| 主体名称 | `party_name` |
| 主体人 | `party_contact` |
| 货品详情 | `goods_detail` |
| 数量 | `quantity`（正数展示，出库存正数、movement delta 为负） |
| 仓库 | `warehouse_name`（join） |
| 单号 | `reference_no` |
| 备注 | `note` |
| 业务时间 | `biz_at` |
| 创建时间 | `created_at` |
| 更新时间 | `updated_at` |

### 编辑与库存联动（v1）

```
POST/PUT inventory_transactions
  → BEGIN TX
  → IF update AND movement_id set: reverse prior movement effect on stock_levels
  → apply in/out via stock_service (product_id or MISC, warehouse_id, quantity)
  → save transaction row + movement_id
  → COMMIT
```

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 编辑单据导致库存与历史 movement 不一致 | 同事务冲销+重写；列表展示 `movement_id` 可选；文档说明「编辑会改库存」 |
| AG Grid 与 Ant Design 样式冲突 | 单独引入 `ag-grid.css`；页面容器限定高度 `calc(100vh - header)` |
| React 19 + AG Grid 版本兼容 | 锁定 `ag-grid-react@^32`（或当前 LTS）；`pnpm build` 验收 |
| 杂项 SKU 误删 | 迁移 seed `MISC` 商品；admin 不可删 |
| 包体积增大 | 仅本路由动态 `import()` 页面组件（可选优化） |

## Migration Plan

1. 后端迁移：创建 `inventory_transactions`；seed `products.sku='MISC'` 若不存在。
2. 部署 backend → front；Host 导航增加「出入库单」或由 front `routes` 静态配置。
3. 回滚：移除路由与 API；表可保留；不影响既有 `stock_movements` 历史行。

## Open Questions

- 是否 **隐藏** 原 `/movements` antd 流水页，仅保留新页？（建议：导航只保留「出入库单」）
- `product_id` 是否在表单中 **可选下拉**（已有商品时关联），还是 v1 完全隐藏仅杂项？（建议：可选下拉，默认空=杂项）
- 数量单位是否写入 `goods_detail` 由用户自由填写？（建议：是，v1 不单独字段）
