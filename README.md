# k-project（个人微前端 + Go 全栈工作区）

本目录是**多个独立 Git 仓库**的物理聚合：父应用、子应用、后端各自维护版本与远程地址；根目录用文档与 Docker 编排把它们串成一套可运行的系统。

## 目录一览

| 路径 | 角色 | 独立 Git |
|------|------|----------|
| [apps/host](./apps/host/) | wujie 微前端**父应用**（React 17 + Vite + `wujie-react`） | 是 |
| [apps/user-front](./apps/user-front/) | **子应用**：用户中心相关页面（React 17 + TS + Vite） | 是 |
| [apps/hello-front](./apps/hello-front/) | **子应用**：试验用（曾用于验证不同 Node/React 与无界集成） | 否 |
| [apps/user-backend](./apps/user-backend/) | **后端**：Go + Gin + GORM + MySQL + JWT | 是 |
| [vendor/wujie](./vendor/wujie/) | **上游参考**：无界官方源码与示例（React/Vue），以阅读、对照为主 | 是 |

更细的端口、环境变量与依赖关系见 [docs/WORKSPACE.md](./docs/WORKSPACE.md)。微前端如何拼在一起见 [docs/MICROFRONTEND.md](./docs/MICROFRONTEND.md)。**新增子应用快速搭建**见 [docs/SCAFFOLD_MICROFRONTEND.md](./docs/SCAFFOLD_MICROFRONTEND.md)。**单域名 / 同源入口** 设计见 [docs/SINGLE_DOMAIN.md](./docs/SINGLE_DOMAIN.md)。目录搬迁说明见 [docs/REPO_LAYOUT.md](./docs/REPO_LAYOUT.md)。

## 端口名单

所有服务端口的**唯一信息源**：[docs/WORKSPACE.md](./docs/WORKSPACE.md#端口名单唯一信息源)。前端从 8100 起，后端从 8500 起，网关 80 是唯一对外端口。

## 本地开发（不用 Docker）

1. **MySQL**：按 [apps/user-backend/README.md](./apps/user-backend/README.md) 创建库并配置 `.env`。
2. **后端**：`cd apps/user-backend && make run`（默认 `:8500`）。
3. **子应用**：`apps/hello-front`、`apps/user-front` 分别 `pnpm install && pnpm dev`（端口 `8101` / `8102`）。
4. **父应用**：`cd apps/host`，确认 `.env.development` 里子应用 URL 与上一步端口一致，再 `pnpm dev`（默认 `8100`）。

## Docker（可选）

多服务编排与浏览器可访问的 URL 约定见 [docs/DOCKER.md](./docs/DOCKER.md)。从仓库根目录执行：

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

首次使用请先阅读 `infra/docker/README.md` 中的环境变量与局限说明。

## OpenSpec + Cursor

- 开需求流程：[workspace-spec/spec-workflow.md](./workspace-spec/spec-workflow.md)
- 技术规范索引：[workspace-spec/TECH_CLAUDE.md](./workspace-spec/TECH_CLAUDE.md)
- 变更记录：`openspec/changes/`
- Cursor 命令：`/opsx-propose` · `/opsx-apply` · `/opsx-archive`

## 给 AI / 协作者

- 工作区总览与编辑边界：[AGENTS.md](./AGENTS.md)
- 人类可读架构说明：[docs/WORKSPACE.md](./docs/WORKSPACE.md)
