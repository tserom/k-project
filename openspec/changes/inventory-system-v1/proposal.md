## Why

k-project 需要一套可运行的**库存管理（IMS）**能力：维护 SKU/仓库、记录出入库流水、查询库存余额，并作为 Host 微前端子应用与中台其它模块（user、hello）并列访问。此前仅有用户中心与试验子应用，缺少独立库存域服务与 API。

## What Changes

- 新增 **`apps/inventory-backend`**（Go 1.22 + Gin + GORM + JWT），独立 MySQL 库 **`inventory`**
- 新增 **`apps/inventory-front`**（React 19 + Ant Design 5 + Vite），经无界嵌入 Host
- 扩展 **单域名网关**：`/micro/inventory/`、`/api/inventory/v1/`
- 扩展 **`user-backend` 导航**：`inventory` 应用 seed + `MICRO_INVENTORY_ENTRY_URL`
- 修复 **Host `SubAppView`**：按 `subAppBusName` 下发 `{name}-route` 事件（支持 `inventory-front-route`）
- 工作区文档：`docs/INVENTORY_SYSTEM.md`、`docs/WORKSPACE.md`、`docs/SINGLE_DOMAIN.md`、`AGENTS.md`

**v1 明确不做**：供应商、批次效期、多仓调拨、与 `user-backend` 统一账号、公开注册、Swagger 文档站。

## Capabilities

### New Capabilities

- `inventory-backend-core`: 库存 API——认证、商品/仓库 CRUD、库存余额、出入库/盘点调整、事务与乐观锁
- `inventory-front-mfe`: 库存子应用 UI——登录、概览、商品/仓库/库存/流水、入出库表单，无界路由同步
- `inventory-platform-integration`: 网关/Compose/导航/端口与 Host 接入契约

### Modified Capabilities

（无：`openspec/specs/` 尚无既有 capability 需 delta。Host 路由事件修复归入 `inventory-platform-integration` 的 ADDED 要求。）

## Impact

- **新服务**：`inventory-backend:8501`、`inventory-front:8103`
- **既有服务**：`user-backend`（导航 seed、env）、`host`（无界路由事件）、`infra/gateway`（nginx 路径 + DNS 延迟解析）
- **数据**：MySQL 新库 `inventory`（与 `app` 分离，避免 `users` 表冲突）
- **账号**：IMS 独立 JWT 与 `users` 表；`ALLOW_REGISTER=false`，admin bootstrap + `POST /users`
