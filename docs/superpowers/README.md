# Superpowers 需求讨论稿

本目录存放 **Superpowers brainstorming** 阶段产出的设计稿（人读、对话沉淀），**不是**实现清单的真源。

## 与 OpenSpec 的关系

| 阶段 | 目录 | 作用 |
|------|------|------|
| 聊需求 | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` | 澄清范围、方案取舍、你确认过的设计 |
| 出清单 | `openspec/changes/{kebab}/` | proposal / specs / design / **tasks.md**（可勾选任务） |
| 写代码 | `apps/*` | `/opsx-apply` 按 tasks 实现 |

**不**使用 `docs/superpowers/plans/`：k-project 以 OpenSpec `tasks.md` 为实施清单。

完整流程见 [workspace-spec/spec-workflow.md](../../workspace-spec/spec-workflow.md#标准流程superpowers-聊需求--openspec-执行)。
