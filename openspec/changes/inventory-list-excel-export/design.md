## Context

库存前端当前以两个列表承载主要业务查询：

- `apps/inventory-front` `/transactions`：出入库单 AG Grid 列表，筛选字段包括类型、主体名称、关键字、业务日期。
- `apps/inventory-front` `/sales-deliveries`：销售发货单 Ant Design Table，筛选字段包括乙方、日期范围。

这两个列表的数据来源分别在 `apps/inventory-backend`：

- `GET /api/v1/inventory-transactions`
- `GET /api/v1/sales-deliveries`

本变更是追溯型 OpenSpec：实现已完成并推送，本文档补齐实现前应有的设计记录。

## Goals / Non-Goals

**Goals:**

- 为出入库单和销售发货单提供 Excel 导出。
- 有选中行时导出选中 ID；无选中行时导出当前筛选条件下的全部数据。
- 销售发货单导出两个 Sheet：`单据汇总` 与 `明细行`。
- 后端生成 `.xlsx`，前端只负责传参和触发下载。
- 保持现有网关、端口、Host 导航不变。

**Non-Goals:**

- 不做导出任务队列、导出进度、历史下载或服务端文件存储。
- 不为商品、仓库、库存余额等其它页面增加导出。
- 不改变销售发货单保存时是否联动库存的业务规则。
- 不引入 AG Grid Enterprise 或浏览器端 Excel 生成。

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | Excel 生成位置 | 后端生成 `.xlsx` | 当前需求包含“按筛选导出全部”和发货单明细 Sheet，后端能直接查询全量和明细，避免前端分页拼数据 |
| 2 | 文件库 | `github.com/xuri/excelize/v2@v2.8.1` | 支持 xlsx 多 Sheet；版本兼容 Go 1.22，不抬升项目 Go 版本 |
| 3 | 接口形态 | `GET /api/v1/inventory-transactions/export`、`GET /api/v1/sales-deliveries/export` | 与列表资源同层；由现有 JWT/operator 路由保护 |
| 4 | 选中行参数 | `qp-id-in=111,222,333` | 与用户明确提出的多值筛选形式一致；前端只需传选中行 id |
| 5 | 无选中导出 | 复用当前筛选条件，不带分页参数 | 导出目标是“当前筛选下全部数据”，不是当前页 |
| 6 | 仓储全量查询 | Filter 增加显式 `NoLimit` | 避免普通列表通过 `page_size=0/-1` 绕过分页；只有导出 handler 可打开全量 |
| 7 | 销售发货单 Sheet | `单据汇总` + `明细行` | 汇总用于对账概览，明细用于查看货品规格、数量、重量、单价、金额 |
| 8 | 前端选择策略 | 不跨分页保留；查询/翻页/刷新清空 | 避免旧筛选条件下的选中行被误导出 |

### 后端数据流

```
GET /api/v1/*/export
  → parse filters + qp-id-in
  → repository.List(..., NoLimit: true)
  → exporter.Build*Workbook(rows)
  → Content-Disposition: attachment; filename="*.xlsx"
```

出入库单导出列：

| 列 | 来源 |
|----|------|
| ID、类型、主体名称、主体人、货品详情、数量、单号、备注、业务时间、创建时间、更新时间 | `inventory_transactions` |
| 仓库 | join `warehouses.name` |
| SKU | join `products.sku` |

销售发货单导出：

| Sheet | 内容 |
|-------|------|
| `单据汇总` | ID、单号、日期、乙方、甲方、仓库、电话、合计、已付、欠款、创建/更新时间 |
| `明细行` | 每个明细一行，带单据 ID、单号、日期、乙方、甲方、行号、货品规格、数量、重量、单价、金额、备注 |

### 前端数据流

```
列表页 selectedIds
  ├─ selectedIds.length > 0 → export({ "qp-id-in": selectedIds.join(",") })
  └─ selectedIds.length = 0 → export(currentFilters)
```

`apps/inventory-front/src/api/client.ts` 增加下载 helper，统一处理 Bearer token、非 2xx 错误和浏览器下载。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 全量导出数据过大导致请求变慢 | v1 先同步导出；后续若数据量增大，再引入异步导出任务 |
| 普通列表被非法 `page_size` 触发全量查询 | 使用 `NoLimit` 显式开关，并补分页归一化测试 |
| 发货单明细预加载造成内存压力 | 仅导出接口预加载；普通列表仍不加载 `items` |
| Excel 列名和业务口径后续变化 | exporter 独立包集中维护列定义 |
| 前端选中状态跨筛选残留 | 查询、翻页、刷新成功后清空选择 |

## Migration Plan

1. 部署 `apps/inventory-backend`，新增导出接口和 Excel 生成依赖。
2. 部署 `apps/inventory-front`，新增多选和导出按钮。
3. 无数据库迁移；无网关、端口、env、Host 导航变更。
4. 回滚：前端隐藏导出按钮；后端导出接口保留不影响既有列表和保存接口。

## Open Questions

（无。当前需求已实现；后续可单独评估异步导出、打印/PDF、库存余额导出。）
