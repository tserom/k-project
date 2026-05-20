## 1. 规格与文档

- [x] 1.1 编写 `docs/INVENTORY_SYSTEM.md`（评审结论、领域模型、路线图 §12）
- [x] 1.2 更新 `docs/WORKSPACE.md`、`docs/SINGLE_DOMAIN.md`、`AGENTS.md` 端口与路径
- [x] 1.3 创建 OpenSpec change `inventory-system-v1`（本目录）

## 2. inventory-backend

- [x] 2.1 脚手架：`cmd/server`、Gin 分层、独立 `go.mod`、`DB_NAME=inventory`
- [x] 2.2 模型与迁移：users、products、warehouses、stock_levels、stock_movements
- [x] 2.3 认证：login、JWT、bootstrap admin、`ALLOW_REGISTER=false`、`POST /users`（admin）
- [x] 2.4 商品/仓库 CRUD API
- [x] 2.5 库存服务：入/出/调整、事务、乐观锁、允许负库存
- [x] 2.6 查询：stock-levels、movements 分页、dashboard 统计
- [x] 2.7 `go test ./...`（含 stock_service 单测）
- [ ] 2.8 集成 Swagger（`swag` + `/swagger/*`）
- [ ] 2.9 补充 repository/service 层集成测试（需 test MySQL 或 sqlite 策略）

## 3. inventory-front

- [x] 3.1 脚手架：React 19 + Ant Design 5 + Vite、`base: './'`、port 8103
- [x] 3.2 API client：`VITE_API_BASE=/api/inventory`、Bearer、`ims_token`
- [x] 3.3 `WujieRouteBridge`（`inventory-front-route` / `sub-route-change`）
- [x] 3.4 页面：登录、概览、商品、仓库、库存、流水、入库、出库
- [x] 3.5 Dockerfile + `docker/nginx.conf`（8103）
- [ ] 3.6 Node 20 下 `pnpm build` / `typecheck` 通过（CI 或本机）
- [ ] 3.7 `openapi-typescript` 脚本从 Swagger 生成类型（依赖 2.8）
- [ ] 3.8 Admin：用户管理页（对接 `POST /users`）
- [ ] 3.9 Admin：盘点调整页（对接 `POST /stock-movements/adjust`）

## 4. 平台集成（网关 / Compose / Host）

- [x] 4.1 `infra/docker/docker-compose.yml`：inventory-backend、inventory-front、mysql-init `inventory` 库
- [x] 4.2 `infra/gateway/nginx.conf`：`/micro/inventory/`、`/api/inventory/`、变量 proxy + resolver
- [x] 4.3 `user-backend`：导航 seed 增加 inventory、`MICRO_INVENTORY_ENTRY_URL`、`.env.example`
- [x] 4.4 `apps/host`：`SubAppView` 使用 `subAppRouteEventName(subAppBusName)`
- [ ] 4.5 全链路验收：`docker compose up --build` → Host 顶栏进入库存 → 登录 → 商品/入出库
- [ ] 4.6 已有环境导航迁移说明/脚本（旧 `navigation_configs` 补 inventory 应用）

## 5. 后续版本（非 v1）

- [ ] 5.1 v1.1 供应商主数据 + 入库关联 `supplier_id`
- [ ] 5.2 v1.2 多仓调拨单（`stock_transfers`）
- [ ] 5.3 v2 批次/效期（`batch_lots`、FEFO）
- [ ] 5.4 与 `user-backend` 统一账号 / SSO（可选）
- [ ] 5.5 `apps/inventory-*` 独立 Git 仓库 init 与远端（若需要）
