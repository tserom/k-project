## Context

### 参考实现（只读）

| 层级 | 路径 | 职责 |
|------|------|------|
| 业务壳 | `vendor/business-component/.../BsSulaQueryTable` | 列/搜索项 localStorage、权限、流程按钮、全屏、导出、可拖拽列宽；最终 `<QueryTable {...config} />` |
| 内核 | `vendor/sula/.../template-query-table/QueryTable.tsx` | 查询 Form + Table + `statusMapping` Tab + `remoteDataSource` |
| 目标 UI | 用户截图（入库单列表） | 多行筛选、状态 Tab 带数量角标、工具栏按钮、勾选表格、分页 |

### 约束

- k-project 子应用：**React 19 + Ant Design 5 + Vite**（见 `apps/inventory-front`）
- `vendor/sula`、`vendor/business-component` 为**参考仓库**，不在 v1 中作为 runtime 依赖
- 用户希望「大部分基于 antd、不局限于 antd4」→ `antd` 作 **peerDependency `^5.0.0`**，组件内部只用 antd 公共 API

### 已有空目录

- `vendor/k-table/`、`vendor/k-business-component/` 为空；本变更统一使用 **`vendor/k-query-table/`** 作为包根目录（名称与组件 `KQueryTable` 一致）。

## Goals / Non-Goals

**Goals:**

1. 一份 **config 对象** 渲染完整「查询列表页」骨架（与截图结构一致的五段布局）
2. **类型安全的 Config 契约**，字段命名向 `BsSulaQueryTable` 靠拢，降低迁移成本
3. **可插拔字段渲染**（v1：`input`、`select`、`dateRange`），后续可扩展 registry
4. **`remoteDataSource`** 约定与 sula 类似（`url` / `method` / `convertParams` / `converter`），内部用独立 `request()` 实现
5. 包可本地 `pnpm link` 或在 demo 中引用，供后续接入 `apps/*`

**Non-Goals（v1）:**

- 不实现 sula 的 `registerFieldPlugin` / action 表达式 `#{...}`
- 不实现 Bs 的列设置、搜索项设置、权限 `code`、流程 `tradeType`
- 不做主题/design token 与 business-component 像素级一致（仅布局与间距接近）
- 不发布 npm 私服

## Decisions

### 1. 包位置与名称

- **决策**：`vendor/k-query-table/`，包名 `@k-project/k-query-table`
- **理由**：与组件名一致；避免与空的 `k-business-component` 混淆
- **备选**：放入 `k-business-component` monorepo → 推迟，等有更多 K 系列组件再抽 lerna

### 2. 与 sula 的关系：借鉴 config，不依赖运行时

- **决策**：复制 **config 形状**（`fields`、`columns`、`remoteDataSource`、`statusMapping`、`actionsRender`），用 antd 自研布局组件拼装
- **理由**：用户不熟悉 sula 实现；直接依赖 `bssula` 会拖入 antd4 + umi 生态
- **备选**：封装 sula `QueryTable` 并 peer antd4 → 与 k-project 栈冲突，否决

### 3. UI 分层（五段式）

```
┌─ SearchForm (antd Form, fields[]) ─────────────────────────┐
├─ StatusTabs (antd Tabs + Badge, statusMapping[]) ──────────┤
├─ Toolbar (actionsRender[] → Button) ───────────────────────┤
├─ DataTable (antd Table, columns[]) ────────────────────────┤
└─ Pagination (antd Pagination, 与 remoteDataSource 联动) ───┘
```

- **决策**：`KQueryTable` 为容器，子区域纯函数组件 + 单一 `useQueryTable` hook 管理 `queryParams`、`activeStatus`、`list`、`total`、`loading`
- **理由**：与 sula `QueryTable` 类组件状态机解耦，便于测试与后续换 antd 6

### 4. 字段系统

- **决策**：`FieldConfig = { name, label, field: { type, props } }` + `registerFieldType(type, Component)`
- **v1 内置**：`input`、`select`、`dateRange`
- **理由**：对齐 sula `fields[].field.type` 字符串，避免 v1 引入 JSX 字段

### 5. 请求层

- **决策**：`src/request/index.ts` 实现 `runRemoteDataSource(config, ctx)`，支持 GET/POST、`convertParams`、`converter({ data }) => { list, total }`
- **默认**：`fetch` + JSON；业务可 `request.impl(custom)` 覆盖（与 sula 文档一致的模式）
- **理由**：与 `BsSulaQueryTable` demo 中 `remoteDataSource` 一致，mock 友好

### 6. 构建工具

- **决策**：**tsup** 输出 ESM + CJS + `.d.ts`；**Vite** 仅用于 `demo/` 开发预览
- **理由**：轻量、与 inventory-front 的 Vite 一致；不必上 father/dumi（v1）

### 7. React / antd 版本

- **peerDependencies**：`react ^18.0.0 || ^19.0.0`，`antd ^5.0.0`
- **devDependencies**：与 `apps/inventory-front` 对齐（react 19、antd 5）

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| config 与 BsSulaQueryTable 仅部分兼容，迁移需改 config | 文档列出「支持 / 暂不支持」对照表；v2 再做 codemod |
| 自研字段类型少于 sula，复杂筛选无法实现 | 暴露 `field.render` 逃逸口；逐步补 registry |
| 样式与旧系统不一致 | v1 用 `index.less` + antd token；后续抽 `@k-project/query-table-theme` |
| vendor 包未被 apps 引用，易腐烂 | demo + openspec tasks 要求最小 e2e 手测清单 |

## Migration Plan

1. 合并 OpenSpec 变更后，在 `vendor/k-query-table` 执行 `pnpm install && pnpm build && pnpm demo`
2. 后续在某一子应用（建议 `inventory-front`）增加一页「KQueryTable 试验」验证 peer 依赖
3. 无生产数据迁移；不影响现有 Bs 页面

## Open Questions

1. 是否在 v2 提供 **`BsSulaQueryTable` → `KQueryTableConfig` 适配器**（剥离 umi/localStorage 层）？
2. 状态 Tab 的 `count` 由 config 静态传入还是二次请求 `statusMapping[].remoteCount`？
3. 包是否最终迁入独立 git 仓库（当前 vendor 无 remote，与 sula 相同策略）？
