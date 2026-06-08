## 1. 后端：数据模型与迁移

- [x] 1.1 新增 GORM 模型 `InventoryTransaction` 与迁移（表 `inventory_transactions`）
- [x] 1.2 迁移或 bootstrap：确保存在 SKU=`MISC` 的杂项商品
- [x] 1.3 为 `inventory_transactions` 添加索引：`biz_at`、`party_name`、`type`

## 2. 后端：服务与 API

- [x] 2.1 实现 `TransactionService`：创建/更新时调用库存事务（冲销旧 movement + 应用新 movement）
- [x] 2.2 实现 `GET /api/v1/inventory-transactions`（分页 + 筛选）
- [x] 2.3 实现 `POST /api/v1/inventory-transactions`、`PUT /api/v1/inventory-transactions/:id`
- [x] 2.4 注册路由与 handler；补充请求体验证（party_name、quantity、biz_at）
- [x] 2.5 编写 service 单测（创建入库、出库负库存、编辑冲销）

## 3. 前端：依赖与路由

- [x] 3.1 `inventory-front` 安装 `ag-grid-community`、`ag-grid-react` 及样式引入
- [x] 3.2 在 `config/routes` 增加 `/transactions` 与导航「出入库单」
- [x] 3.3 新增 API 模块 `inventory-transactions.ts`（list/create/update 类型）

## 4. 前端：AG Grid 列表页

- [x] 4.1 实现 `pages/Transactions/index.tsx`：列定义（id、类型、主体、货品详情、数量、仓库、单号、备注、各时间）
- [x] 4.2 顶部筛选 Form + Search；底部分页与 `rowData` 刷新
- [x] 4.3 工具栏「新增」「编辑」+ 行单选；未选行时编辑提示
- [x] 4.4 实现 `TransactionFormModal`（antd Form：type、party、goods_detail、quantity、warehouse、product 可选、biz_at 等）
- [x] 4.5 对接 API；401 跳转登录；提交成功后刷新 Grid

## 5. 文档与验收

- [x] 5.1 更新 `docs/INVENTORY_SYSTEM.md`：出入库单字段与 API 路径
- [ ] 5.2 Host 内手测：登录 → 出入库单 → 查询/新增/编辑 → 库存数量变化符合类型
- [x] 5.3 `inventory-front` `pnpm build` 与 `inventory-backend` `go test ./...` 通过

## 6. 后续（非本变更）

- [ ] 6.1 原 `/movements` antd 页重定向或移除（与产品确认）
- [ ] 6.2 AG Grid 列宽持久化、导出
- [ ] 6.3 多单明细行模型
