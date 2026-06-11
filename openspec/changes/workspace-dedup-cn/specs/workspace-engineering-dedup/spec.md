# 规格：工作区工程化资产单真源与中文化

## ADDED Requirements

### Requirement: skill 只有一个真源

工作区级 skill 的唯一真源 SHALL 是根目录 `.cursor/skills/`；子仓库内只允许存在「app 专属 skill」或「指向根真源的指针 skill」。

#### Scenario: 根目录打开工作区

- **GIVEN** 用户以 `k-project/` 根目录打开 Cursor
- **WHEN** Agent 加载可用 skill 列表
- **THEN** 工作区级 skill（k-project-workspace、k-project-subapp-front、openspec-*）只出现一份，来自根 `.cursor/skills/`
- **AND** 根目录不存在 `.claude/` 目录

#### Scenario: 单独打开 front 子仓库

- **GIVEN** 用户单独打开 `apps/user-front`（或 hello-front / inventory-front）
- **WHEN** Agent 读取该仓库 `.cursor/skills/k-project-subapp-front/SKILL.md`
- **THEN** 该文件是短指针：保留 frontmatter description，正文指回根真源路径，并列出本 app 的差异点

#### Scenario: 单独打开 host 仓库

- **WHEN** 用户单独打开 `apps/host`
- **THEN** 该仓库 `.cursor/skills/` 下不存在 `openspec-*` skill（host 仓库内无 `openspec/` 目录，这些 skill 无用）

### Requirement: AI 入口文档不重复注入

工作区 AI 入口 SHALL 只有 `AGENTS.md` 一份（人类入口为 `README.md`）；不允许存在与其大面积重复的第二入口。

#### Scenario: 删除 CLAUDE.md 后无断链

- **WHEN** 在工作区全局搜索 `CLAUDE.md` 的引用（`vendor/` 除外）
- **THEN** 没有任何文档/配置仍指向已删除的 `CLAUDE.md`

### Requirement: OpenSpec 工件中文为主

`openspec/config.yaml` 的写作规则 SHALL 要求新建 change 的 proposal / design / tasks / specs 以中文为主，GIVEN/WHEN/THEN 等结构关键词保留英文。

#### Scenario: 新建 change

- **WHEN** 维护者按 `/opsx-propose` 新建一个 change
- **THEN** 生成的 proposal / design / tasks / specs 正文为中文
- **AND** change 目录名仍为英文 kebab-case（openspec CLI 兼容）

#### Scenario: 中文总索引

- **WHEN** 维护者打开 `openspec/changes/README.md`
- **THEN** 能看到所有 change 的表格：目录名、中文一句话说明、状态
- **AND** 每个 change 目录内有一句话中文 `README.md`

### Requirement: 工具链版本说明互不冲突

`scripts/` 目录 SHALL 有中文 README 说明 Node 16 工具链仅服务 `vendor/` 老组件库，apps 的 Node 版本以 `docs/WORKSPACE.md` / 各 app README 为准。

#### Scenario: 阅读 scripts 目录

- **WHEN** 维护者打开 `scripts/README.md`
- **THEN** 能明确知道 `node-toolchain.env`（Node 16.20.0）的适用范围是 `vendor/` 老组件库
- **AND** 不会与 apps 约定的 Node 20.19.x 产生「两个唯一信息源」的歧义
