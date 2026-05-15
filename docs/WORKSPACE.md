# 工作区说明（k-project）

## 物理布局

```
k-project/
├── apps/
│   ├── host/              # 微前端父应用（原 main-project-front）
│   ├── user-front/
│   ├── hello-front/
│   └── user-backend/
├── vendor/
│   └── wujie/             # 无界上游源码（参考）
├── docs/                  # 工作区级文档（本文件等）
├── infra/docker/          # Compose 与编排说明
├── AGENTS.md
└── README.md
```

## 仓库与 Git

| 子目录 | 独立 `.git` | 说明 |
|--------|-------------|------|
| `apps/host` | 是 | 父应用，可单独 push |
| `apps/user-front` | 是 | 主业务子应用 |
| `apps/user-backend` | 是 | Go API |
| `vendor/wujie` | 是 | 上游无界仓库，拉取更新时注意与本地魔改冲突 |
| `apps/hello-front` | **否** | 若需版本管理，可在该目录 `git init` 或迁入 monorepo |

根目录 `k-project` 当前无 `.git`；若希望「文档 + compose」也纳入版本控制，可在根目录 `git init`，并用 `.gitignore` 忽略各子目录内已有仓库或改用 submodule。

**说明**：将目录移入 `apps/` / `vendor/` **不会改变**各子仓库的 `origin` 与提交历史；仅本地路径变化。详见 [REPO_LAYOUT.md](./REPO_LAYOUT.md)。

## 端口约定（本地开发）

| 服务 | 端口 | 说明 |
|------|------|------|
| 父应用 `apps/host` | **8000** | `vite.config.js` |
| `apps/hello-front` | **8100** | 与父应用 `.env.development` 中 `VITE_HELLO_FRONT_URL` 一致 |
| `apps/user-front` | **8101** | 与 `VITE_USER_FRONT_URL` 一致；`pnpm dev` 已写死 `--port 8101` |
| `apps/user-backend` | **8080** | `HTTP_ADDR`，健康检查 `GET /healthz` |

## 依赖关系（简图）

```mermaid
flowchart LR
  Browser[浏览器]
  Main[apps/host]
  Hello[apps/hello-front]
  User[apps/user-front]
  API[apps/user-backend]

  Browser --> Main
  Main -->|wujie iframe entry| Hello
  Main -->|wujie iframe entry| User
  User -->|开发 proxy /api| API
```

## 各子项目文档入口

- 父应用：`apps/host/README.md`、`.cursor/skills/`（若有）
- 子应用 user：`apps/user-front/README.md`
- 试验子应用：`apps/hello-front/README.md`
- 后端：`apps/user-backend/README.md`、`.cursor/rules/`（若有）
- 无界上游：`docs/reference-wujie-upstream.md`
