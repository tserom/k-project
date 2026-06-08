## Context

- 业务：不锈钢零售，按材质型号 + 切割规格（如圆钢直径 × 长度）销售，**计价以重量（kg）为准**；纸质单为「销售发货清单（还款协议）」，含甲方/乙方、发货仓库、多行明细、合计大写、已付款与尚欠款。
- 技术栈：k-project 已有 `apps/inventory-front`（React 19 + Ant Design 5）与 `apps/inventory-backend`（Gin/GORM，库 `inventory`），经 Host 无界挂载，API `/api/inventory/v1`。
- 约束：v1 做**销售单据数字化**（录入 + 查询 + 编辑），**不**自动扣库存（与 `inventory-transaction-ag-grid` 的出入库单分工）；复用 IMS 登录与 JWT。

## Goals / Non-Goals

**Goals:**

- 电子表单字段与纸质单对齐，操作员可快速开单
- 主从表落库：`sales_delivery_documents` + `sales_delivery_items`
- 行金额 = `weight_kg × unit_price`；合计、尚欠款自动计算；合计大写中文金额展示
- 列表按日期/乙方筛选；可打开详情或进入编辑

**Non-Goals:**

- 打印、PDF、电子签章
- 库存联动、商品主数据强绑定（品名规格为自由文本）
- 删除单据、审批流、多币种、税率
- 独立新应用（落在 inventory 子应用内）

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | 落位 | `inventory-front` / `inventory-backend` | 已有部署与认证；销售单与库存同属门店系统 |
| 2 | 数据模型 | 主表 + 明细表（1:N） | 一张清单多行钢材，符合纸质单结构 |
| 3 | 计价 | `amount = round(weight_kg * unit_price, 2)` | 与手写单一致（例：10.5 × 18.5 = 194.25） |
| 4 | 数量字段 | `quantity` 保留为**件数/根数**（整数），不参与金额公式 | 纸质单有「数量」列；金额仍按重量算 |
| 5 | 品名规格 | 单行自由文本 `product_spec` | 非标切割（如 `304圆钢 Φ40×4.3m`）无需预建 SKU |
| 6 | 甲方/仓库默认值 | 主表字段可编辑；前端 `.env` 或常量提供默认「淄博钰鑫不锈钢」「钰鑫成品仓库」 | 减少重复录入 |
| 7 | 单据号 | `doc_no` 后端生成：`SD` + `YYYYMMDD` + 4 位序号 | 便于口头对单 |
| 8 | 大写金额 | 前端 `numberToChineseUppercase(total)`；后端存 `total_amount` 数值 | 展示用；以数值为准 |
| 9 | 尚欠款 | `balance_due = total_amount - paid_amount`（允许为负表示多付） | 对应「尚欠款」 |
| 10 | API | `GET/POST/PUT /api/v1/sales-deliveries`；`GET` 列表分页、`GET/:id` 含 items | REST 主从资源 |
| 11 | UI | 列表 Ant Design Table；新建/编辑独立页 `Form` + `Form.List` 动态行 | 表单行数可变，比 Modal 更适合多行明细 |
| 12 | 条款正文 | 前端静态文案（与纸质单小字一致） | v1 不入库 |

### 字段映射（纸质单 → 数据）

| 纸质单 | 主表/明细 | 类型 |
|--------|-----------|------|
| 乙方 | `party_b_name` | string |
| 日期 | `doc_date` | date |
| 甲方 | `party_a_name` | string |
| 发货仓库 | `warehouse_name` | string |
| 品名规格 | `items[].product_spec` | string |
| 数量 | `items[].quantity` | int |
| 重量(kg) | `items[].weight_kg` | decimal(10,3) |
| 单价 | `items[].unit_price` | decimal(10,2) |
| 金额 | `items[].amount` | decimal(10,2)，服务端计算 |
| 备注 | `items[].note` | string |
| 合计 | `total_amount` | decimal(10,2) |
| 合计(大写) | UI 计算 | — |
| 已付款 | `paid_amount` | decimal(10,2) |
| 尚欠款 | `balance_due` | decimal(10,2) |
| 电话 | `phone` | string |

### ER（逻辑）

```
sales_delivery_documents (1) ──< sales_delivery_items (N)

documents: id, doc_no, doc_date, party_a_name, party_b_name,
           warehouse_name, phone, total_amount, paid_amount,
           balance_due, created_by, created_at, updated_at

items: id, document_id, line_no, product_spec, quantity,
       weight_kg, unit_price, amount, note
```

### 保存流程

```
POST/PUT /sales-deliveries
  → 校验 items 非空、party_b_name、doc_date
  → 服务端逐行计算 amount = weight_kg * unit_price
  → total_amount = sum(amount)
  → balance_due = total_amount - paid_amount
  → BEGIN TX → upsert document → replace items（全量替换行）→ COMMIT
```

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 前端算价与服务端不一致 | 保存时服务端重算并覆盖 amount/total |
| 编辑时误改历史 | v1 无删除；列表展示 `updated_at`；可选后续加「只读归档」 |
| 销售单与库存双录 | 文档说明：出库仍走「出入库单」或后续迭代联动 |
| 浮点精度 | 金额用 `decimal` 类型；计算保留 2 位小数 |
| 默认甲方写死 | v2 可接「店铺设置」表 |

## Migration Plan

1. 后端迁移：创建 `sales_delivery_documents`、`sales_delivery_items` 及外键、索引（`doc_date`、`party_b_name`）。
2. 部署 backend → front；`config/routes` 增加 `/sales-deliveries` 导航。
3. 回滚：移除路由与 API；表可保留。

## Open Questions

- 单价单位是否统一为 **元/kg**？（建议：是，表单 label 写清）
- `quantity` 是否允许小数（如 0.5 根）？（建议：v1 仅整数）
- 是否需要「只读查看」与「编辑」权限区分？（建议：v1 operator/admin 均可编辑）
