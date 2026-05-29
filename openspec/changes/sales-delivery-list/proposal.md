## Why

不锈钢零售店日常按「型号 + 切割长度 + 重量」开销售发货清单（含还款协议），目前手写单据易丢、难查、金额易算错。需要一套与纸质单一致的电子表单：录入表头与多行明细、按重量自动算金额、落库并可查询历史，替代手写开票。

## What Changes

- **`apps/inventory-backend`**：新增 **销售发货清单** 资源（主表 + 明细行）；`GET` 分页列表、`GET` 单条详情、`POST` 创建、`PUT` 更新；金额由服务端按「重量 × 单价」校验/重算
- **`apps/inventory-front`**：新增路由（建议 `/sales-deliveries`）及导航「销售发货单」；**新建/编辑页**复刻纸质单布局（甲方、乙方、日期、发货仓库、明细表、合计大写、已付款、尚欠款、电话）；**列表页**按日期/乙方筛选与查看详情
- **计算规则**：行金额 = `weight_kg × unit_price`；单据合计 = 各行金额之和；尚欠款 = 合计 − 已付款；前端实时计算，后端保存时二次校验
- **v1 明确不做**：打印/PDF、与财务系统对接、库存自动扣减、电子签章、删除（仅编辑）、多租户、手机端专用 UI

## Capabilities

### New Capabilities

- `sales-delivery-document-api`: 销售发货清单主从表数据模型、REST API、金额计算与校验
- `sales-delivery-document-ui`: 子应用表单录入、明细行动态增删、列表与详情查看

### Modified Capabilities

（无。`openspec/specs/` 尚无归档 spec；在 `inventory-system-v1` 应用骨架上增量，不修改既有库存流水需求。）

## Impact

- **应用**：`apps/inventory-front`、`apps/inventory-backend`
- **数据**：MySQL `inventory` 库新增 `sales_delivery_documents`、`sales_delivery_items` 表及迁移
- **依赖**：无新网关路径（仍 `/api/inventory/v1`）；前端复用 Ant Design 5 Form/Table，无需 AG Grid
- **关系**：依赖 `inventory-system-v1` 已交付的认证与 Host 无界挂载；**不**与 `stock_movements` 联动（v1 纯销售单据，出库另录或后续迭代）
