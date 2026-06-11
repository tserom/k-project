# 设计：工程化去重与中文化

## Context

重复资产现状（2026-06-10 摸底）：

| 资产 | 份数 | 位置 |
|------|------|------|
| `k-project-subapp-front` skill | 5 | 根 `.cursor/skills/`、根 `.claude/skills/`、user-front、hello-front、inventory-front |
| `openspec-*` 4 个 skill | 各 3 | 根 `.cursor/skills/`、根 `.claude/skills/`、`apps/host/.cursor/skills/` |
| `k-project-workspace` skill | 2 | 根 `.cursor/skills/`、根 `.claude/skills/`（两边内容已漂移，`.claude` 版含 inventory 描述更新） |
| AI 入口文档 | 3 | `README.md`、`AGENTS.md`、`CLAUDE.md`（CLAUDE ≈ AGENTS + rules 拼接） |
| Node 版本「唯一信息源」 | 2 | `scripts/node-toolchain.env`（16.20.0）、`docs/WORKSPACE.md` 等（20.19.x） |

## Goals / Non-Goals

**Goals：**

- 每份工程化资产只有一个真源：skill 真源在根 `.cursor/skills/`，AI 入口真源是 `AGENTS.md`。
- 今后新写的 OpenSpec 工件中文为主，维护者一眼能懂。
- 所有 change 有中文索引，不点进目录也知道每个 change 是干什么的。

**Non-Goals：**

- 不重组 `docs/` / `workspace-spec/` 目录层级。
- 不翻译存量英文 spec。

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | skill 真源 | 根 `.cursor/skills/` | 当前主力工具是 Cursor；`.claude/` 已不再使用（用户确认删除） |
| 2 | `.claude/` 漂移内容 | 删除前先合并回 `.cursor/` | diff 显示 `.claude` 版 `k-project-workspace` 含 inventory 更新，直接删会丢信息 |
| 3 | 子仓库 front skill | 指针文件而非删除 | 单独打开子仓库时 Cursor 只加载该仓库的 skills，需要指针引导回根真源 |
| 4 | host 仓库 `openspec-*` | 直接删除 | openspec 目录只存在于工作区根，单开 host 时这些 skill 无用武之地 |
| 5 | `CLAUDE.md` | 删除而非保留薄壳 | Cursor 同时注入 AGENTS.md + CLAUDE.md + rules，删除可消除重复注入；Claude Code 已不使用 |
| 6 | spec 语言 | 中文为主，GIVEN/WHEN/THEN 关键词保留英文 | 结构关键词保留便于工具/惯例识别，正文中文便于维护者阅读 |
| 7 | change 索引形式 | `changes/README.md` 表格 + 各目录一句话 `README.md` | 目录名保持英文 kebab-case（openspec CLI 兼容），中文靠索引补 |
| 8 | `TECH_CLAUDE.md` 改名 | `tech-rules.md` | 删除 CLAUDE.md 后「TECH_CLAUDE」名字失去含义且费解 |

## 引用更新清单（实施时 grep 确认）

- `CLAUDE.md` 被引用处：`openspec/config.yaml`（3 处）、`workspace-spec/tech/coding-front.md`、`.cursor/skills/*`、`AGENTS.md` 等 → 改指 `AGENTS.md` 或 `.cursor/rules/` 对应文件
- `TECH_CLAUDE.md` 被引用处：`openspec/config.yaml`、`.cursor/commands/opsx-*.md`、`.cursor/skills/k-project-workspace/`、`AGENTS.md`、`workspace-spec/spec-workflow.md` → 全部改为 `tech-rules.md`
- `.claude/` 被引用处：`AGENTS.md`、skills 内相对链接 → 删除或改指 `.cursor/`

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 删 `CLAUDE.md` 后其它 AI 工具（Claude Code 等）失去入口 | 用户已确认不再使用 Claude Code；若将来恢复，从 `AGENTS.md` 软链或重建 |
| 引用断链 | 实施最后一步全局 grep `CLAUDE`、`TECH_CLAUDE`、`.claude/` 验证 |
| 指针 skill 描述不当导致 Cursor 不加载 | 指针文件保留完整 frontmatter description（与真源一致） |

## Migration Plan

1. 合并 `.claude/skills/` 漂移内容 → 根 `.cursor/skills/`。
2. 删 `.claude/`、删 `apps/host/.cursor/skills/openspec-*`、指针化 3 个 front 仓库 skill。
3. CLAUDE.md 独有内容并回 AGENTS.md → 删 CLAUDE.md → 更新全部引用。
4. TECH_CLAUDE.md 改名 + 更新全部引用。
5. config.yaml rules 中文化；新增 changes 索引、scripts README、根 README 目录地图。
6. 全局 grep 验证无断链。

回滚：所有操作都在 git 内，`git revert` 即可。
