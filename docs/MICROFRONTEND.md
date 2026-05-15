# 微前端（wujie）在本工作区中的拼法

## 角色

- **父应用**：`apps/host`（`package.json` 内 `name` 为 `host`），依赖 `wujie-react`，负责布局与子应用容器。
- **子应用**：`apps/user-front`、`apps/hello-front`，独立 Vite 构建的 SPA；`base: './'` 便于作为无界子应用加载时静态资源相对路径正确。
- **参考仓库**：`vendor/wujie/` 为无界官方 monorepo，含 React/Vue 示例与文档源码，**不是**线上业务代码。

## 开发时 URL 从哪里来

父应用在本地通过环境变量把子应用入口交给无界（见 `apps/host/.env.development`）：

- `VITE_HELLO_FRONT_URL` → 默认 `http://localhost:8100/`
- `VITE_USER_FRONT_URL` → 默认 `http://localhost:8101/`

修改子应用端口时，必须同步改父应用环境变量并重启父应用 dev server。

## 子应用与后端

- `apps/user-front` 开发态通过 Vite `server.proxy` 将 `/api` 转发到 `http://127.0.0.1:8080`，与 `apps/user-backend` 对齐。
- 生产构建可使用 `VITE_API_BASE` 指向网关或后端公网地址（见 `apps/user-front/src/api/client.ts`）。

## 与 `vendor/wujie/` 官方仓库的关系

学习生命周期、插件、预加载等，以[官方文档](https://wujie-micro.github.io/doc/)与 `vendor/wujie` 仓库内示例为准；业务定制放在 `apps/host` / `apps/user-front`，避免在上游目录内堆业务代码，以便 `git pull` 上游。
