# k-project 技术规范入口（TECH_CLAUDE）

OpenSpec **出 design / tasks 或 apply 实现前**读本文。AI 总入口仍是根目录 [CLAUDE.md](../CLAUDE.md) 与 [AGENTS.md](../AGENTS.md)。

## 规范索引

| 文件 | 用途 |
|------|------|
| [spec-workflow.md](./spec-workflow.md) | 开 change、目录命名、Cursor 命令、多仓库 commit |
| [tech/architecture.md](./tech/architecture.md) | 调用链、网关、微前端、端口 |
| [tech/coding-front.md](./tech/coding-front.md) | 子应用前端、*Api.ts、React 约定 |
| [tech/coding-go.md](./tech/coding-go.md) | Go 后端分层与质量门禁 |
| [openspec/config.yaml](../openspec/config.yaml) | OpenSpec AI 上下文与 artifact rules |

## 详细文档（人类可读）

- [docs/WORKSPACE.md](../docs/WORKSPACE.md) — 端口唯一信息源
- [docs/MICROFRONTEND.md](../docs/MICROFRONTEND.md)
- [docs/SCAFFOLD_MICROFRONTEND.md](../docs/SCAFFOLD_MICROFRONTEND.md)
- [docs/SINGLE_DOMAIN.md](../docs/SINGLE_DOMAIN.md)
- [docs/NAVIGATION_CONFIG.md](../docs/NAVIGATION_CONFIG.md)

## Cursor Skills

| Skill | 路径 |
|-------|------|
| 工作区 | `.cursor/skills/k-project-workspace/` |
| 子应用前端 | `.cursor/skills/k-project-subapp-front/` |
| Go 后端 | `apps/user-backend/.cursor/skills/go-gin-gorm-service/`（改 backend 时 Agent 应主动 Read） |

## 硬规则摘要

1. **端口**：只认 `docs/WORKSPACE.md`；改一处同步 Vite / nginx / gateway / compose
2. **同源**：浏览器只走 `https://k-project.com`；子应用 API 用同域 `/api/*`
3. **改哪进哪**：业务代码在对应 `apps/*` 独立 git 里 commit
4. **vendor/wujie**：上游参考，业务改 apps
5. **OpenSpec change 名**：小写英文 kebab
6. **团队通用规范**：改 [team-agent-standards](https://github.com/tserom/team-agent-standards)，勿把通用规则只堆在 k-project
