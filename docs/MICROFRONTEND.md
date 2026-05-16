# 微前端（wujie）在本工作区中的拼法

## 角色

- **父应用**：`apps/host`，`wujie-react` 负责壳层与子应用容器。
- **子应用**：`apps/user-front`、`apps/hello-front`，`base: './'`。
- **参考**：`vendor/wujie/` 为官方上游，非业务代码。

## 端口与 URL

端口名单：[WORKSPACE.md](./WORKSPACE.md)。

| 模式 | 父应用 entry | 说明 |
|------|----------------|------|
| **同源（推荐）** | `/micro/hello/`、`/micro/user/` | Docker + `k-project.com` 网关；见 [SINGLE_DOMAIN.md](./SINGLE_DOMAIN.md) |
| **多端口 dev** | `http://localhost:8101/`、`http://localhost:8102/` | 各服务 `pnpm dev`，见 `apps/host/.env.development` |

改端口须同步：端口表 → 各服务 nginx / Vite → 网关 upstream → 父应用 `VITE_*`。

## 子应用与后端

- **Docker / 网关**：`user-front` 的 `VITE_API_BASE` 留空，请求同域 `/api/v1/...`。
- **多端口 dev**：子应用直连 `http://127.0.0.1:8500` 会跨域；联调 API 请走网关或仅测静态页。

## 与 `vendor/wujie/` 的关系

业务定制在 `apps/host` / `apps/user-front`；上游目录保持可 `git pull`。
