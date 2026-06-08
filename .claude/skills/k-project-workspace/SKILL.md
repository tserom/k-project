---
name: k-project-workspace
description: >-
  k-project monorepo conventions: microfrontend host navigation API, user-backend
  Gin/GORM patterns, user-front admin pages, inventory system. Use when changing
  apps/host navigation, apps/user-backend APIs, apps/user-front, apps/inventory-front,
  docs/NAVIGATION_CONFIG.md, or cross-app env/ports in this workspace.
---

# k-project 工作区（聚合）

打开 **k-project 根目录** 时优先读本 skill；子应用目录下仍有各自 skill。

## 必读文档

| 文档 | 内容 |
|------|------|
| `docs/NAVIGATION_CONFIG.md` | Host 导航 DB/API、entryUrl 仅 env、admin 写权限 |
| `docs/WORKSPACE.md` | 端口唯一信息源 |
| `docs/MICROFRONTEND.md` | wujie 父子关系与 env |
| `docs/SINGLE_DOMAIN.md` | 同域方案 k-project.com |
| `AGENTS.md` | 各 `apps/*` 职责、skill 加载说明 |

## 子应用 skill

| 路径 | 何时读 |
|------|--------|
| `.claude/skills/k-project-subapp-front/SKILL.md` | 改 user/hello/inventory 子应用结构、路由、wujie |
| `apps/user-backend/.cursor/skills/go-gin-gorm-service/SKILL.md` | 改 Go API、GORM、JWT、路由 |
| `apps/host/.cursor/` | 若存在 host 专用 skill |
| `apps/user-front/.cursor/skills/project-environment/` | user-front 工具链与目录 |

## 导航功能约定（摘要）

- **读**：`GET /api/v1/navigation` 公开；返回含 `entryUrl`（后端 env merge）。
- **写**：`PUT /api/v1/navigation` 需 JWT + `role=admin`；body 为可编辑 payload（无 entryUrl）。
- **Host**：`fetchNavigation` 失败显示 `Result`，不回退 Mock。
- **用户角色**：`users.role`：`user` | `admin`；`ADMIN_EMAIL` 用于引导首个管理员。

## 改端口时

先读 `docs/WORKSPACE.md`，再同步 Vite、nginx、gateway upstream、compose。

## 质量

- user-backend：`go test ./...`，`make lint`
- 勿提交 `.env`、密钥
