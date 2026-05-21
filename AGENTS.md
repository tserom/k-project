# AGENTS.md — k-project 工作区（给 AI 用）

## 工作区性质

- 路径 `k-project/` 是**工作区根**，业务代码在 **`apps/`** 下；`vendor/wujie` 为上游参考。
- 各应用目录多为**独立 Git 仓库**；根目录**没有**统一 `.git`。
- 改业务逻辑时进入**对应子目录**操作，不要把多个应用混成一个无结构的大改。

## 各目录职责（改哪里）

| 目录 | 改什么 |
|------|--------|
| `apps/host/` | 父应用壳、菜单/路由、无界 `WujieReact` 挂载、子应用 `entry` URL 配置（含 `.env.development` 的 `VITE_*`） |
| `apps/user-front/` | 用户中心子应用页面、调用后端的 `src/api`、Vite `proxy` 与 `VITE_API_BASE` |
| `apps/hello-front/` | 试验子应用；与父应用联调时保持端口与父应用环境变量一致 |
| `apps/user-backend/` | Go API、数据库模型、JWT、Swagger 生成物 |
| `apps/inventory-front/` | 库存子应用（React 19），Host 无界 entry `/micro/inventory/` |
| `apps/inventory-backend/` | 库存 API（Go），网关路径 `/api/inventory/v1` |
| `vendor/wujie/` | **官方上游克隆**：优先只读；若需改示例，先考虑是否应在自己业务仓库改 |

## 工具链约定

- **父应用 + user-front**：与各自 README 一致，当前约定 Node **20.19.x**、**pnpm**（父应用 `package.json` 有 `engines`）。
- **hello-front**：曾用于 Node/React 版本试验；`package.json` 里 React 版本可能与父应用不同，集成时注意无界与运行时兼容性。
- **user-backend**：Go **1.22.x**，配置见 `.env.example`；**勿**将含密钥的 `.env` 写入版本控制。

## 端口名单（重要）

所有服务端口的**唯一信息源**：[`docs/WORKSPACE.md`](docs/WORKSPACE.md#端口名单唯一信息源)。前端从 8100 起，后端从 8500 起，每个端口必须同时出现在该服务的 `vite.config.*`、`docker/nginx.conf`、`infra/gateway/nginx.conf` upstream、以及 compose 中。改端口先改这张表，再批量同步。

## Docker

- 编排文件：`infra/docker/docker-compose.yml`，已内含 `gateway` 服务（同域入口，唯一对外端口 80）。
- 浏览器只访问 `https://k-project.com/`（hosts: `127.0.0.1 k-project.com`；TLS 见 `infra/gateway/gen-certs.sh`），不再用多端口 `localhost:xxxx` 入口。
- 父应用构建参数 `VITE_HELLO_FRONT_URL` / `VITE_USER_FRONT_URL` 默认是同源相对路径 `/micro/hello/`、`/micro/user/`；详见 `docs/DOCKER.md`、`docs/SINGLE_DOMAIN.md`。
- 子应用 nginx 与后端 Go 中**不再**配 CORS / 反向代理；同源方案下都不需要。

## Cursor Skills（AI 自动加载范围）

- **工作区根** `k-project/.cursor/skills/`：以根目录打开工作区时，Agent 会按 description **自动**匹配并读取。
- **子应用前端范本**：`.cursor/skills/k-project-subapp-front/`（目录结构、`config/routes`、wujie 路由桥）；各 `apps/*-front/.cursor/skills/k-project-subapp-front/` 为同 skill 的 app 特例摘要。
- **子应用内**（如 `apps/user-backend/.cursor/skills/go-gin-gorm-service/`）：根工作区模式下**通常不会**进入自动 skill 列表；改该应用时 Agent 应 **主动 Read** 该路径，或把 skill **复制/摘要到** 根目录 `.cursor/skills/`（推荐对跨仓常用约定这样做）。
- **`~/.cursor/skills-cursor/`**：Cursor 内置 skill，与业务仓库无关。

实现导航配置等功能前，改 `user-backend` 请先读 `apps/user-backend/.cursor/skills/go-gin-gorm-service/SKILL.md`（或在工作区根增加等价 skill）。

## 文档索引

- `docs/WORKSPACE.md` — 端口、仓库、依赖图
- `docs/NAVIGATION_CONFIG.md` — Host 导航 DB/API/管理页方案（v1 已实现；代码在各 `apps/*` 仓库）
- `docs/MICROFRONTEND.md` — wujie 父子关系与 env
- `docs/DOCKER.md` — 容器化约定与排错
- `docs/reference-wujie-upstream.md` — `vendor/wujie/` 说明
- `docs/REPO_LAYOUT.md` — 物理目录与 Git 说明
- `docs/SINGLE_DOMAIN.md` — 正式域名 **k-project.com** 与 `infra/gateway/`
