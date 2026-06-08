# CLAUDE.md — k-project 工作区

> 项目上下文维护在本文件；团队通用规范由 [team-agent-standards](https://github.com/tserom/team-agent-standards) 生成并合并于此。
> 团队规范修改请改 team-agent-standards 仓库 `guidelines/*.md` 后 `python3 scripts/build.py claude`，再同步到本项目。

## 工作区性质

- 路径 `k-project/` 是**工作区根**，业务代码在 **`apps/`** 下；`vendor/wujie` 为上游参考。
- 各应用目录多为**独立 Git 仓库**；根目录**没有**统一 `.git`。
- 改业务逻辑时进入**对应子目录**操作，不要把多个应用混成一个无结构的大改。

## 各目录职责

| 目录 | 改什么 |
|------|--------|
| `apps/host/` | 父应用壳、菜单/路由、无界 `WujieReact` 挂载、子应用 `entry` URL 配置（含 `.env.development` 的 `VITE_*`） |
| `apps/user-front/` | 用户中心子应用页面、调用后端的 `src/api`、Vite `proxy` 与 `VITE_API_BASE` |
| `apps/hello-front/` | 试验子应用；与父应用联调时保持端口与父应用环境变量一致 |
| `apps/user-backend/` | Go API、数据库模型、JWT、Swagger 生成物 |
| `apps/inventory-front/` | 库存子应用（React 19），Host 无界 entry `/micro/inventory/` |
| `apps/inventory-backend/` | 库存 API（Go），网关路径 `/api/inventory/v1` |
| `vendor/wujie/` | **官方上游克隆**：优先只读；若需改示例，先考虑是否应在自己业务仓库改 |

## 工具链约定

- **父应用 + user-front**：Node **20.19.x**、**pnpm**（父应用 `package.json` 有 `engines`）。
- **hello-front**：曾用于 Node/React 版本试验；集成时注意无界与运行时兼容性。
- **user-backend**：Go **1.22.x**，配置见 `.env.example`；**勿**将含密钥的 `.env` 写入版本控制。

## 端口名单

所有服务端口的**唯一信息源**：[`docs/WORKSPACE.md`](docs/WORKSPACE.md#端口名单唯一信息源)。前端从 8100 起，后端从 8500 起，每个端口必须同时出现在该服务的 `vite.config.*`、`docker/nginx.conf`、`infra/gateway/nginx.conf` upstream、以及 compose 中。改端口先改这张表，再批量同步。

## Docker

- 编排文件：`infra/docker/docker-compose.yml`，已内含 `gateway` 服务（同域入口，唯一对外端口 80）。
- 浏览器只访问 `https://k-project.com/`（hosts: `127.0.0.1 k-project.com`；TLS 见 `infra/gateway/gen-certs.sh`）。
- 父应用构建参数 `VITE_HELLO_FRONT_URL` / `VITE_USER_FRONT_URL` 默认是同源相对路径 `/micro/hello/`、`/micro/user/`。
- 子应用 nginx 与后端 Go 中**不再**配 CORS / 反向代理；同源方案下都不需要。

## 文档索引

- `docs/WORKSPACE.md` — 端口、仓库、依赖图
- `docs/NAVIGATION_CONFIG.md` — Host 导航 DB/API/管理页方案
- `docs/MICROFRONTEND.md` — wujie 父子关系与 env
- `docs/SCAFFOLD_MICROFRONTEND.md` — 新增子应用快速搭建清单
- `docs/DOCKER.md` — 容器化约定与排错
- `docs/reference-wujie-upstream.md` — `vendor/wujie/` 说明
- `docs/REPO_LAYOUT.md` — 物理目录与 Git 说明
- `docs/SINGLE_DOMAIN.md` — 正式域名 **k-project.com** 与 `infra/gateway/`

---

# Karpathy behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# React / 业务页可读性约定

实现或修改 `src` 下页面、组件、`*Api.ts` 时**默认遵守**。用户若明确要求性能优化或沿用既有 hook 风格，再局部例外并注明原因。

## 1. UI：少用 `useCallback` / `useMemo`

- **默认不写** `useCallback`、`useMemo`。
- **仅当**传给 `React.memo` 子组件、或必须作为 `useEffect` 依赖且无法内联时，才提取。
- 事件处理写在组件内普通函数，或 `actionsRender` / `columns.render` 附近；避免为每个按钮单独包一层 `useCallback`。

```tsx
// ❌ 过度包装
const onClear = useCallback(() => { ... }, [deps]);

// ✅ 同文件内普通函数 + 步骤注释
async function handleClearSelection(rows: any[]) {
  // 1. 校验  2. 调 API  3. refreshTable
  ...
}
```

## 2. 禁止 `useEffect` 串联业务

- **禁止**：`useEffect` 里因 state A 变化去调接口 B、再 setState 触发 C（隐式调用链）。
- **允许**：挂载拉配置、Modal `open` / `afterOpenChange` 拉数、按钮 `onClick` / `Modal.onOk` 里显式请求。
- 向父组件注册回调：优先 `forwardRef` + `useImperativeHandle`，或父组件在操作成功后**显式**调用 ref；避免 `useEffect(() => onRegister?.(fn), [fn])` 反复注册。
- 输入框取消后回显：优先 `key={\`${record.id}-${resetToken}\`}` 重置 `InputNumber`，避免 `useEffect` 同步本地 state。

## 3. API 集中在 `*Api.ts`

- 请求、列表合并、复杂业务计算放在 `services/*Api.ts`，**不在**列 render / Section 里重复写。
- **何时抽象 / 封装 / 复用（L0–L3）**：遵守下方 API 分层规范。
- 文件顶部维护 **入口索引表**（约 5～10 行）：**用户场景 → export 函数名 → 主要接口 → 是否刷新哪些列表**。
- 复杂 export 函数体开头用步骤注释：`// 1. …  2. …  3. refresh …`。
- 若项目有 OpenSpec / 内部调用清单 md，长函数名与索引以该文档为准。

## 4. 命名

| 范围 | 风格 | 示例 |
|------|------|------|
| 单文件 / 单页面内 | 短、动词开头 | `clearSelection`、`refreshTables`、`openEditModal` |
| 跨文件、对应设计文档条目 | 可与文档一致的长名 | 按项目约定 |
| 禁止 | 无业务含义的抽象名 | `handleDataChange`、`processItems`、`resetState` |

## 5. 一个用户动作 = 一个顶层函数

- 按钮 / 工具栏 / 弹框确定：对应**一个**顶层 `async function`（或同文件内具名函数），不要用多层 `useCallback` 间接调用。
- 函数开头 **3～5 行步骤注释**，再写实现。

## 6. 与项目专用规则

若业务仓库另有领域专用规则（如 OpenSpec interactions），**专用规则优先于本文件的泛化约定**。

## 自检（改完扫一眼）

- [ ] 新增 `useEffect` 是否仅为挂载 / Modal 打开 / 无更直观的 `key` 重置？
- [ ] 能否删掉一半 `useCallback`/`useMemo` 而不改行为？
- [ ] 用户动作能否从按钮名追到**一个**具名函数和步骤注释？
- [ ] `*Api.ts` 顶部索引是否已更新？

# 回复末尾：修改的文件

完成**涉及改动的实现、修复、重构**后，在回复**末尾**增加独立小节 **`### 修改的文件`**（无改动则省略）。

## 格式

用 Markdown 表格，两列：

| 文件 | 说明 |
|------|------|
| `相对路径/文件名` | 一句话说明本文件改了什么（业务/行为向，少写函数名堆砌） |

- 路径用仓库内**相对路径**，行内用反引号包裹。
- 说明每条一行，聚焦「为什么 / 用户可见行为」，不必罗列每个函数。
- 若用户关心提交状态，可附一句：`共 N 个文件`；有未提交改动时可写「当前工作区有修改、尚未 commit」（仅在确实查过 `git status` 或用户问提交时说）。

## 何时省略

- 仅答疑、评审、读代码，**未改任何文件**。
- 用户明确只要结论、不要变更清单。

# Git commit message：连续修改序号

当用户在同一需求/工单上多次提交、且希望与「上一次 commit message」保持同一前缀时：

1. 以用户给出的**上一条 message 全文**为基准（例如 `feat: IJJCA3-电商对账-得物增加2个TAB费用`）。
2. 本次在**末尾直接追加递增数字**（无空格、无连字符），形成 `…费用2`、`…费用3`，用于区分连续提交。
3. 若用户未提供上一条 message，用 `git log -1 --pretty=%s` 查看当前分支最近一次提交主题，再在其后追加下一个序号（需与用户确认是否同一需求线）。

## 合代码（MR / PR）

- Agent **不要**在本机 `git checkout <目标分支>` + merge/rebase/cherry-pick，也**不要** `git push` 到 `test`、`main`、`develop` 等共享分支，把功能直接合进别的分支。
- 协助合代码时只做：在**功能分支**上 commit，并 `git push origin <feature-branch>`。
- 推送后，在远端仓库创建 **MR/PR 草稿**（平台以项目为准：GitLab MR、GitHub PR、Gitee 等），或给出可点击的**创建 MR/PR 页面链接**，由用户审阅、点合并。
- 能用 CLI 时优先创建草稿并返回链接，例如：
  - GitHub：`gh pr create --draft --base <目标分支> --head <feature-branch>`
  - GitLab：`glab mr create --draft --target-branch <目标分支> --source-branch <feature-branch>`
- 若环境无对应 CLI、或无法自动创建，在回复中说明分支名，并附上仓库「Compare / New merge request / New pull request」类 URL，让用户自行打开操作。
- 仅在用户**明确要求**且确认权限时，才可代为 merge、push 到共享分支或其它非常规操作。

# API 分层：抽象 / 封装 / 复用

实现或修改 `*Api.ts`、`services/**`、`api/**` 时**默认遵守**。与 React 可读性约定 §3（API 集中、入口索引）配合使用。

**人类可读完整版**（决策表、MUST/NOT、CR 清单）：[team-agent-standards](https://github.com/tserom/team-agent-standards) 仓库 `docs/standards/api-abstraction-encapsulation-reuse.md`

---

## 概念（一句话）

| | 做什么 | 怎么做 |
|---|--------|--------|
| **复用** | 算数、解析 list、拼参 | **L0**，不发 HTTP |
| **封装** | 一个 URL | **L1**，每个 endpoint 一个函数，**必做** |
| **封装** | 一个用户动作 | **L3**，一个 export + 步骤注释 |
| **抽象** | 多步流程 | **L2**，**少做**；所有调用方副作用集合必须一致 |

**口诀**：URL 必封；动作单独函数；编排别万能。

---

## 四层

```
L3  场景入口     一用户动作 = 一个 export
L2  场景编排     sync*（慎用；≥3 个入口步骤+副作用完全相同才抽）
L1  单 URL       每个 endpoint 一个函数（必须）
L0  工具         不发 HTTP，随意复用
```

---

## 新需求：5 问（命中即停）

1. 只拼参/解析响应？→ **L0**
2. 只打一个接口？→ **L1**
3. 新用户动作？→ **新建 L3**（不要先塞进现有 `sync*`）
4. ≥3 个 L3 步骤与副作用完全相同？→ 才考虑 **L2**
5. 与现有 L2 比会多/少调某个 URL？→ **禁止**扩 L2；新建 **L3**

**编排前再问**：主表/汇总总量 **变不变**？要不要 **补偿类接口**（saveOrUpdate、rebalance 等）？  
→ 不变且不要补偿 → **不要**通用 `sync` / **不要**默认 rebalance。

---

## 必须 / 禁止

| ✅ MUST | ❌ MUST NOT |
|---------|-------------|
| 所有 URL 进 `*Api.ts` | UI/列里手写多接口串联 |
| 每动作一个 L3 + 步骤注释 | 为单场景给 L2 加第 3 个 flag |
| 维护入口表（动作→函数→URL） | L0 里发 request |
| 新 L2 写清 **会调 / 不会调** 的 URL | 「凡改子表都走同一个 sync」 |
| 跳转/拼参字段在 `*Row` 类型中**逐字段声明** | 未声明业务字段的 `??` / `\|\|` 回退链 |
| 必须回退时登记 **回退表** 并在 MR/回复单列待确认 | 静默套用参考页字段链 |

---

## 实现后

- 更新该模块 **call-map** 或 `*Api.ts` 顶部索引：**动作 → 函数 → 会调 URL → 不会调的 URL**
- 业务项目若有领域专用规则，**领域规则优先于本通则**

---

## PR 勾选（5 条）

- [ ] L0/1/3？过 5 问？
- [ ] 改 L2？副作用表更新？
- [ ] 单场景专用 options → 应独立 L3？
- [ ] 入口索引 / call-map 更新？
- [ ] 跳转/拼参是否仅声明字段？若有回退，回退表已登记且待确认项已列出？

# 晋升团队规范：何时提醒写入 team-agent-standards

在**任意业务项目**中协作时，若产生**可跨项目复用**的规则或 Skill，**必须提醒用户**是否纳入 [team-agent-standards](https://github.com/tserom/team-agent-standards)，并说明应放在哪一层。

---

## 何时必须提醒用户（触发器）

完成或讨论以下任一情况后，用 **1～3 句话**主动询问：

1. **新建或大幅改写** 业务项目的 `.cursor/rules/*.mdc`、`.cursor/rules/*.md`。
2. **新建或大幅改写** 业务项目的 `.cursor/skills/**/SKILL.md` 或 `.claude/skills/**/SKILL.md`。
3. 总结出 **决策表 / MUST-NOT / 分层约定**（如 API L0–L3、Git/MR 流程），且不只适用于当前需求。
4. 在 `docs/standards/`、`openspec/`、`interactions/` 写了**通用**工程约定（非单接口、单页面）。
5. 用户说「以后都这样做」「其它项目也要」。

**不必提醒**：纯业务文案、单需求 OpenSpec、单页字段、仅本仓库后端路径的 call-map。

---

## 放哪一层（给用户选）

| 内容类型 | 团队仓库位置 | 业务项目保留 |
|----------|--------------|--------------|
| AI 必遵约束、清单、5 问决策表 | `guidelines/*.md` | 仅链到团队或复制构建产物 |
| 评审/飞书长文、完整案例 | `docs/standards/*.md` | 可选副本或链接 |
| 任务流程 Skill | `docs/skills/<name>/SKILL.md` | `.cursor/skills/` 或 `.claude/skills/` 复制安装 |
| 单域双表、单需求交互 | **不晋升** | `openspec/`、项目规则/技能 |

**禁止**：只把团队通用内容写在单一业务仓库而不提醒 team 真源。
