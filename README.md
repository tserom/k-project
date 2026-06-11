# k-project（个人微前端 + Go 全栈工作区）

本目录是**多个独立 Git 仓库**的物理聚合：父应用、子应用、后端各自维护版本与远程地址；根目录用文档与 Docker 编排把它们串成一套可运行的系统。

## 目录地图（每个目录是干什么的）

### 业务代码（apps/，多为独立 Git 仓库）

| 路径 | 角色 | 独立 Git |
|------|------|----------|
| [apps/host](./apps/host/) | wujie 微前端**父应用**（React 17 + Vite + `wujie-react`） | 是 |
| [apps/user-front](./apps/user-front/) | **子应用**：用户中心相关页面（React 17 + TS + Vite） | 是 |
| [apps/hello-front](./apps/hello-front/) | **子应用**：试验用（曾用于验证不同 Node/React 与无界集成） | 否 |
| [apps/inventory-front](./apps/inventory-front/) | **子应用**：库存管理（React 19 + TS + antd 5，新子应用复制范本） | 是 |
| [apps/user-backend](./apps/user-backend/) | **后端**：用户/导航 API（Go + Gin + GORM + MySQL + JWT） | 是 |
| [apps/inventory-backend](./apps/inventory-backend/) | **后端**：库存 API（Go，网关路径 `/api/inventory/v1`） | 是 |

### 工程化与文档（根 Git 仓库）

| 路径 | 是干什么的 |
|------|-----------|
| [docs/](./docs/) | 运行手册与领域规格：端口表、微前端拼法、Docker、新增子应用清单等 |
| [openspec/](./openspec/) | 需求变更追踪：每个 change 一个目录；**中文总索引**见 [openspec/changes/README.md](./openspec/changes/README.md) |
| [workspace-spec/](./workspace-spec/) | 给 AI 的技术硬规则：OpenSpec 流程、架构边界、前后端编码约定 |
| [templates/](./templates/) | 可整体复制的项目模板（微前端最简 starter） |
| [infra/](./infra/) | Docker 编排与 nginx 网关（同源入口） |
| [scripts/](./scripts/) | 工具链脚本；注意其中 Node 16 工具链只服务 `vendor/` 老组件库（见 [scripts/README.md](./scripts/README.md)） |
| [vendor/](./vendor/) | 参考与内部组件库：`wujie`（官方上游，只读）、`k-query-table`（内部组件）、`sula`/`business-component`（老库参考）；`k-table`、`k-business-component` 为空目录待清理 |
| `.cursor/` | Cursor 规则 / skills / 命令的**唯一真源**（已删除重复的 `.claude/`） |

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

**推荐**：Superpowers 聊需求定方案 → `/opsx-propose` 出工件与 tasks → `/opsx-apply` 实现。

- 完整三阶段流程：[workspace-spec/spec-workflow.md](./workspace-spec/spec-workflow.md#标准流程superpowers-聊需求--openspec-执行)
- 需求讨论稿目录：`docs/superpowers/specs/`（OpenSpec 清单在 `openspec/changes/`）
- 技术规范索引：[workspace-spec/tech-rules.md](./workspace-spec/tech-rules.md)
- Cursor 命令：`/opsx-propose` · `/opsx-apply` · `/opsx-archive`

## 给 AI / 协作者

- 工作区总览与编辑边界：[AGENTS.md](./AGENTS.md)
- 人类可读架构说明：[docs/WORKSPACE.md](./docs/WORKSPACE.md)
