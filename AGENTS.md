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
| `vendor/wujie/` | **官方上游克隆**：优先只读；若需改示例，先考虑是否应在自己业务仓库改 |

## 工具链约定

- **父应用 + user-front**：与各自 README 一致，当前约定 Node **20.19.x**、**pnpm**（父应用 `package.json` 有 `engines`）。
- **hello-front**：曾用于 Node/React 版本试验；`package.json` 里 React 版本可能与父应用不同，集成时注意无界与运行时兼容性。
- **user-backend**：Go **1.22.x**，配置见 `.env.example`；**勿**将含密钥的 `.env` 写入版本控制。

## Docker

- 编排文件：`infra/docker/docker-compose.yml`。
- 父应用对应 compose 服务名为 **`host`**（构建上下文 `apps/host`）。
- 父应用构建参数中的子应用 URL 必须是**浏览器能访问的地址**（通常为 `http://localhost:端口/`），与 compose 暴露端口一致；详见 `docs/DOCKER.md`。

## 文档索引

- `docs/WORKSPACE.md` — 端口、仓库、依赖图
- `docs/MICROFRONTEND.md` — wujie 父子关系与 env
- `docs/DOCKER.md` — 容器化约定与排错
- `docs/reference-wujie-upstream.md` — `vendor/wujie/` 说明
- `docs/REPO_LAYOUT.md` — 物理目录与 Git 说明
