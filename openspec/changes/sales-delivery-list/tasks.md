## 1. 后端：数据模型与迁移

- [ ] 1.1 新增 GORM 模型 `SalesDeliveryDocument`、`SalesDeliveryItem` 及迁移（表 `sales_delivery_documents`、`sales_delivery_items`）
- [ ] 1.2 为 `doc_no` 添加唯一索引；为 `doc_date`、`party_b_name` 添加查询索引
- [ ] 1.3 实现 `doc_no` 生成器（`SD` + 日期 + 序号）

## 2. 后端：服务与 API

- [ ] 2.1 实现 `SalesDeliveryService`：行金额与合计、尚欠款计算（decimal）
- [ ] 2.2 实现 `GET /api/v1/sales-deliveries`（分页 + 筛选）
- [ ] 2.3 实现 `GET /api/v1/sales-deliveries/:id`（含 items）
- [ ] 2.4 实现 `POST /api/v1/sales-deliveries`、`PUT /api/v1/sales-deliveries/:id`（全量替换明细行）
- [ ] 2.5 注册路由与 handler；请求体验证（party_b_name、items 非空、weight_kg > 0）
- [ ] 2.6 编写 service 单测（金额计算、合计、更新替换行）

## 3. 前端：工具与路由

- [ ] 3.1 新增 `utils/amountChinese.ts`（数字转人民币大写）
- [ ] 3.2 在 `config/routes` 增加 `/sales-deliveries` 系列路由与导航「销售发货单」
- [ ] 3.3 新增 API 模块 `sales-deliveries.ts`（list/get/create/update 类型，L1/L3 分层）

## 4. 前端：列表页

- [ ] 4.1 实现 `pages/SalesDeliveries/index.tsx`：Table 列（单号、日期、乙方、甲方、仓库、合计、已付、欠款）
- [ ] 4.2 顶部筛选（日期范围、乙方）+ 分页；「新建」按钮跳转 `/sales-deliveries/new`

## 5. 前端：表单与详情

- [ ] 5.1 实现 `pages/SalesDeliveries/Form.tsx`：表头字段 + `Form.List` 明细表（品名规格、数量、重量、单价、金额、备注）
- [ ] 5.2 行金额与合计、尚欠款实时计算；合计大写展示
- [ ] 5.3 默认甲方/发货仓库常量（可配置）；底部条款静态文案
- [ ] 5.4 实现 `pages/SalesDeliveries/Detail.tsx` 只读详情
- [ ] 5.5 新建/编辑提交对接 API；401 跳转登录

## 6. 文档与验收

- [ ] 6.1 更新 `docs/INVENTORY_SYSTEM.md`：销售发货单字段与 API 路径
- [ ] 6.2 Host 内手测：登录 → 销售发货单 → 新建多行 → 保存 → 列表查看 → 编辑
- [ ] 6.3 `inventory-front` `pnpm build` 与 `inventory-backend` `go test ./...` 通过

## 7. 后续（非本变更）

- [ ] 7.1 打印/PDF 导出
- [ ] 7.2 保存时可选联动出库扣库存
- [ ] 7.3 店铺设置（甲方、仓库、电话默认值入库）
