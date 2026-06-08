## Context

- 工作区采用 **k-project.com 单域名网关** + **wujie** 微前端；子应用 `base: './'`，API 走 `/api/...` 前缀分流。
- `user-backend`（`:8500`，库 `app`）已提供导航 API；Host 消费 `GET /api/v1/navigation` 的 `entryUrl`。
- Host 为 React 17 + Ant Design 4；IMS 子应用刻意使用 React 19 + Ant Design 5，运行在无界 iframe 内隔离。
- 评审结论见 `docs/INVENTORY_SYSTEM.md` §0：嵌入 Host、独立库 `inventory`、允许负库存、关闭公开注册。

## Goals / Non-Goals

**Goals:**

- 交付 IMS v1 MVP：主数据 + 出入库 + 库存查询 + 仪表盘统计
- 从 Host 顶栏进入「库存管理」，同源 `/micro/inventory/` + `/api/inventory/v1/`
- 库存写入具备事务与 `stock_levels.version` 乐观锁；出库允许扣成负数
- Docker Compose 一键联调（含 `inventory` 库 init）

**Non-Goals:**

- 供应商（v1.1）、多仓调拨（v1.2）、批次效期（v2）
- 与 `user-backend` 共用 `users` / SSO
- 合并 MySQL 库到 `app`（保持 `inventory` 独立库）
- 完整 Swagger/OpenAPI 生成与前端类型 codegen（可后续补）

## Decisions

| 决策 | 选择 | 理由 |
|------|------|------|
| 后端栈 | 对齐 `user-backend`（Gin/GORM/JWT/Zap） | 团队熟悉、分层一致 |
| 前端栈 | React 19 + Ant Design 5 + Vite 6 | 规格要求「最新 React」；与 Host 版本隔离 |
| API 对外前缀 | `/api/inventory/v1` → 服务内 `/api/v1` | 避免与 user API 抢同一 upstream |
| 子应用入口 | `/micro/inventory/` | 与 hello/user 子应用路径一致 |
| 数据库 | 独立库 `inventory` | 避免与 `app.users` 表冲突 |
| 注册 | `ALLOW_REGISTER=false` + bootstrap admin | 内网系统；admin `POST /users` 建号 |
| 负库存 | 出库不校验余额 | 评审拍板；UI 对 `< 0` 标红 |
| Host 路由事件 | `subAppRouteEventName(subAppBusName)` → `{name}-route` | 原硬编码 `user-front-route` 无法驱动 inventory |
| Gateway upstream | inventory 用变量 `proxy_pass` + `resolver 127.0.0.11` | 避免 nginx 启动时解析不到容器而退出 |
| SKU 校验 | 非空 + trim + 唯一 | 简单实现，无正则 |

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| React 19 子应用在无界内兼容问题 | P0 在 Host 内实测；必要时降至 React 18 |
| 导航 DB 已有旧 seed，Host 看不到 inventory | README 说明：导航管理页补全或清空 `navigation_configs` 重 seed |
| 双账号体系（user-front vs IMS） | v2 再考虑 SSO；文档标明独立登录 |
| 无 Swagger，联调靠 README/Postman | 后续补 `swag` 与 `openapi-typescript` |
| 本地 dev 依赖 MySQL 3307（Compose） | `.env.example` 注明先 `up -d mysql` |

## Migration Plan

1. 合并代码后 `docker compose up --build`；确认 `mysql-init/02-inventory.sql` 建库。
2. 已有 `navigation_configs` 的环境：在 user-front 导航管理添加 inventory，或删行后重启 user-backend 触发 seed。
3. 回滚：从 gateway 移除 inventory `location`、compose 服务；Host 导航去掉 inventory app（不影响 user/hello）。

## Open Questions

- 是否在 v1.0.x 补 **admin 用户管理页**（后端已有 `POST /users`）？
- 是否在 v1.0.x 补 **盘点调整** 前端（后端已有 `POST /stock-movements/adjust`）？
- `inventory-front` / `inventory-backend` 是否各自 `git init` 并 push 远端？
