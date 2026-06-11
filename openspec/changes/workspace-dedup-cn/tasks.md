# 任务清单：工程化去重与中文化

## 1. skill 单真源（根目录 + 子仓库）

- [x] 1.1 diff `.claude/skills/` 与 `.cursor/skills/`，把 `.claude` 版独有/更新内容合并回 `.cursor/skills/`（k-project-workspace 的 inventory 描述与 2 行文档表；其余 5 个 `.cursor` 版本均为超集）
- [x] 1.2 删除根 `.claude/` 整个目录
- [x] 1.3 删除 `apps/host/.cursor/skills/openspec-apply-change|openspec-archive-change|openspec-explore|openspec-propose`（4 个）
- [x] 1.4 `apps/user-front/.cursor/skills/k-project-subapp-front/SKILL.md` 确认已是短指针（指回根真源 + 本 app 差异点），无需修改
- [x] 1.5 `apps/hello-front/.cursor/skills/k-project-subapp-front/SKILL.md` 同上，已是指针形态
- [x] 1.6 `apps/inventory-front/.cursor/skills/k-project-subapp-front/SKILL.md` 同上，已是指针形态

## 2. 入口文档去重（根目录）

- [x] 2.1 diff `CLAUDE.md` 与 `AGENTS.md`：CLAUDE 独有的 team-agent-standards 说明并入 AGENTS.md 头部；rules 拼接块中「API 分层」新条款经核对来自 team 真源，已同步 `.cursor/rules/api-layering-decision.mdc`
- [x] 2.2 删除根 `CLAUDE.md`
- [x] 2.3 全局 grep `CLAUDE.md` 引用，已改指 `AGENTS.md` 或 `.cursor/rules/` 对应文件（config.yaml、coding-front.md、spec-workflow.md）

## 3. OpenSpec 中文化（openspec/）

- [x] 3.1 `openspec/config.yaml` 的 `rules` 段改中文为主（GIVEN/WHEN/THEN 关键词保留），并新增「每 change 配中文 README + 总索引登记」规则
- [x] 3.2 新增 `openspec/changes/README.md` 中文总索引（含已有 7 个 + 本批 3 个 change）
- [x] 3.3 为已有 7 个 change 目录各补一句话中文 `README.md`

## 4. 命名与说明（workspace-spec/ + scripts/ + 根 README）

- [x] 4.1 `workspace-spec/TECH_CLAUDE.md` 改名 `workspace-spec/tech-rules.md`（git mv 保留历史）
- [x] 4.2 全局 grep `TECH_CLAUDE` 引用并同步（README.md、AGENTS.md、spec-workflow.md、`.cursor/skills/k-project-workspace/`；`.cursor/commands/` 无引用）
- [x] 4.3 新增 `scripts/README.md`：说明 Node 16 工具链只服务 `vendor/` 老组件库；同步修正 `node-toolchain.env` 顶部注释与根 `.nvmrc` 的说明
- [x] 4.4 根 `README.md` 增加「目录地图」中文表格（业务 apps + 工程化目录两张表）

## 5. 验证

- [x] 5.1 全局 grep `CLAUDE`、`.claude/` 确认无断链（`vendor/` 内与本 change 文档自述除外）
- [x] 5.2 根目录与 `apps/host` 仓库分别 `git status` 确认改动范围符合预期（host 仅 4 个 skill 删除；其余全在根仓库）

实施备注：`.cursor/rules/api-layering-decision.mdc` 发现与 team-agent-standards 真源漂移（缺「回退表」两条 MUST），已从 `generated/cursor/rules/` 同步最新版。
