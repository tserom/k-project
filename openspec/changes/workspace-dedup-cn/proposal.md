# 工程化去重与中文化

## Why

工作区目前同一份信息最多在 5 个地方重复维护，且部分关键文档是英文，维护者英文阅读吃力：

- 同名 skill 重复：根 `.cursor/skills/` 与 `.claude/skills/` 各 6 个，内容已互相漂移（谁也不是真源）；`openspec-*` 4 个 skill 在 `apps/host/.cursor/skills/` 还有第 3 份；`k-project-subapp-front` 在 user-front / hello-front / inventory-front 又各有一份完整副本。
- 入口文档重复：`CLAUDE.md` ≈ `AGENTS.md` 前半段 + `.cursor/rules/` 全文拼接，Cursor 会把两者同时注入，重复浪费上下文。
- spec 规范是英文：`openspec/config.yaml` 的 `rules` 段要求英文 GIVEN/WHEN/THEN，导致 `openspec/changes/*/specs/` 全英文，维护者看不懂。
- 信息冲突：`scripts/node-toolchain.env` 锁 Node 16.20.0 并自称「唯一信息源」，与工作区约定 Node 20.19.x 打架（实际它只服务 `vendor/` 老组件库）。

## What Changes

- **删除 `.claude/` 目录**：删除前先把 `.claude/skills/` 中比 `.cursor/skills/` 新的内容（如 inventory 相关描述）合并回 `.cursor/skills/`，确立 `.cursor/` 为唯一真源。
- **删除根 `CLAUDE.md`**：先 diff 确认独有内容并回 `AGENTS.md`；全工作区引用 `CLAUDE.md` 的地方改指向 `AGENTS.md` 或 `.cursor/rules/`。
- **子仓库 skill 去重**：
  - 删除 `apps/host/.cursor/skills/openspec-*`（4 个）——单开 host 仓库时没有 `openspec/` 目录，这些 skill 无用。
  - 3 个 front 仓库的 `k-project-subapp-front/SKILL.md` 改为**短指针文件**（指向根 `.cursor/skills/k-project-subapp-front/`，仅保留本 app 差异点），保住「单独打开子仓库」场景。
- **OpenSpec 规范中文化**：`openspec/config.yaml` 的 `rules` 段改为中文为主（GIVEN/WHEN/THEN 等结构关键词保留英文）；已有 7 个 change 的英文 spec 不回翻。
- **中文索引**：新增 `openspec/changes/README.md` 总索引（每个 change 一行：目录名 → 中文一句话 → 状态）；每个 change 目录内补一句话中文 `README.md`。
- **`workspace-spec/TECH_CLAUDE.md` 改名 `tech-rules.md`**：名字可读；grep 全部引用点同步。
- **`scripts/README.md`**：说明 Node 16 工具链只服务 `vendor/` 老组件库，与 apps 的 Node 20 互不冲突。
- **根 `README.md` 目录地图**：每个顶层目录一行中文职责说明。

**Non-goals**：

- 不搬迁 `docs/`、`workspace-spec/` 的目录结构（引用太多，破坏成本高）。
- 不回翻已有 7 个 change 的英文 spec，只加中文索引行。
- 不动 `vendor/` 下的参考仓库（`k-table`、`k-business-component` 两个空目录仅在索引里标注）。
- 不改 `.cursor/rules/*.mdc` 的内容（它们来自 team-agent-standards 构建产物）。

## Capabilities

### New Capabilities

- `workspace-engineering-dedup`：工作区工程化资产（skill / 入口文档 / OpenSpec 规范 / 工具链说明）的单真源与中文化约定。

## Impact

- **目录**：根 `.claude/`（删）、`.cursor/skills/`、`apps/host/.cursor/skills/`、`apps/{user,hello,inventory}-front/.cursor/skills/`、`openspec/`、`workspace-spec/`、`scripts/`、根 `README.md` / `AGENTS.md` / `CLAUDE.md`
- **不涉及**：任何业务代码、网关、端口、Docker
- **验证**：`grep -r "CLAUDE" --include="*.md" --include="*.yaml"` 无断链；Cursor 重开工作区后 rules / skills 注入正常
