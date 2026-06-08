# OpenSpec 工作流（k-project）

适用：**个人 / 小团队**，在 k-project 根目录用 Cursor + OpenSpec 做需求。技术入口见 [TECH_CLAUDE.md](./TECH_CLAUDE.md)。

---

## 0. 快速回答模式

- **「全部按你的建议」** — 从门禁到生成 proposal/specs/design/tasks 一路走完
- **「只建 change 目录」** — 只跑 `openspec new change`，先不写工件
- **「直接 apply」** — 已有 tasks.md，跳过 propose，跑 `/opsx-apply`

---

## 1. 前置门禁（二缺一不开工）

| 必备项 | 说明 | 缺失处理 |
|--------|------|----------|
| 变更描述 | 一句话说清要做什么 | **停**，向用户确认 |
| 涉及 apps | 列出会改的 `apps/*` 或 `infra/*` | **停**，避免改错仓库 |

可选但推荐：

| 推荐项 | 说明 |
|--------|------|
| Issue / 编号 | GitHub Issue、自编号或 kebab 名前缀，写进 change README |
| 分支 | 各 app 独立 git：在**对应 app 目录**切 feature 分支 |

---

## 2. Change 目录命名

```
openspec/changes/{kebab-case-en}/
├── README.md          # 描述、涉及 apps、Issue、状态、日期
├── .openspec.yaml     # openspec new change 自动生成
├── proposal.md
├── specs/
│   └── **/*.md
├── design.md
└── tasks.md
```

**目录名规则**（OpenSpec CLI 硬要求）：

- 全小写 kebab-case：`^[a-z][a-z0-9]*(-[a-z0-9]+)*$`
- **英文**，不用中文（例：`inventory-transaction-ag-grid`）
- 可与各 app 的 git 分支名不一致

创建命令：

```bash
cd k-project
openspec new change "my-feature-name"
```

Cursor 快捷：`/opsx-propose my-feature-name` 或描述需求让 Agent 推导 kebab 名。

---

## 3. 工件顺序（schema: spec-driven）

```
proposal → specs → design → tasks → 实现 → 归档
```

| 工件 | 谁写 | 内容 |
|------|------|------|
| proposal.md | 需求方 / Agent | Why / What / Capabilities / Impact |
| specs/**/*.md | 同上 | GIVEN/WHEN/THEN 可测场景 |
| design.md | 实现方 / Agent | 改哪些 app、API、网关、数据、验证命令 |
| tasks.md | 同上 | 可勾选任务列表，按 app 分组 |

**Cursor 命令**：

| 命令 | 作用 |
|------|------|
| `/opsx-propose` | 创建 change 并生成 proposal → specs → design → tasks |
| `/opsx-explore` | 探索想法，不写代码 |
| `/opsx-apply` | 按 tasks.md 逐步实现 |
| `/opsx-archive` | 完成后归档 change |

---

## 4. Git 与多仓库

k-project 根目录有 `.git`（文档 + openspec + infra）；各 `apps/*` 多为**独立仓库**。

1. **OpenSpec 工件**：在根仓库 commit（`openspec/`、`workspace-spec/`、`docs/`）
2. **业务代码**：进入对应 `apps/host`、`apps/inventory-front` 等各自 commit
3. **合代码**：Agent **不**自动 merge 到 main；只 push feature 分支并开 MR/PR 草稿（见 CLAUDE.md）

跨 app 需求：同一 change 目录写总览；tasks 里标明「在哪个 app 目录执行」。

---

## 5. 新子应用 / 新后端

必须先读：

- [docs/SCAFFOLD_MICROFRONTEND.md](../docs/SCAFFOLD_MICROFRONTEND.md)
- [docs/WORKSPACE.md](../docs/WORKSPACE.md)（端口表）
- [docs/SINGLE_DOMAIN.md](../docs/SINGLE_DOMAIN.md)（网关路径）

design.md 必须包含：新端口、gateway location、compose service、host `VITE_*`、navigation seed（若需菜单）。

---

## 6. 归档与真理源（可选）

完成后：

```bash
/opsx-archive
```

或手动将 change 移入归档目录。长期可把稳定行为摘要合并进 `openspec/specs/`（当前可为空，见该目录 README）。

---

## 7. Checklist

- [ ] 变更描述 + 涉及 apps 已明确
- [ ] `openspec/changes/{kebab}/` 已建
- [ ] proposal + specs + design + tasks 齐全（apply 前至少要有 tasks）
- [ ] design/tasks 标明 gateway / 端口 / env 是否要改
- [ ] 实现后在对应 app 仓库 commit；根仓库 commit OpenSpec 更新
- [ ] 改端口时已同步 `docs/WORKSPACE.md` 及 nginx/gateway/compose
