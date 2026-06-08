## Why

k-project 在 `vendor/` 下已有 **sula**（配置驱动表单/表格内核）与 **business-component**（业务封装，含 `BsSulaQueryTable`）。后者依赖 `bssula` + Ant Design 4 + umi，与 k-project 子应用（React 19、Ant Design 5、Vite）技术栈不一致，且 `BsSulaQueryTable` 耦合权限、流程、localStorage 列设置等企业逻辑，难以直接复用。

需要一套**可独立演进**的查询表格组件 **KQueryTable**：保留「一份 config 生成整页查询列表」的体验与布局风格，底层以 **Ant Design 5+** 为主、**不绑定 sula 运行时**，先搭架子再逐步补齐能力。

## What Changes

- 在 `vendor/k-query-table/` 新建 npm 包 `@k-project/k-query-table`（TypeScript + React，peer：`react`、`antd` ^5）
- 定义 **KQueryTableConfig** 契约（对齐 `BsSulaQueryTable` / sula `QueryTable` 的子集：`fields`、`columns`、`remoteDataSource`、`statusMapping`、`actionsRender`、`rowSelection` 等）
- 实现 **v1 架子**：五大 UI 区块（查询区、状态 Tab、工具栏、表格、分页）+ 远程数据源适配器；**不含**列拖拽设置、权限码、流程按钮、全屏、导出等企业特性
- 提供 **dumi 或 Vite demo** 页面，用 mock / 公开 API 验证 config 驱动渲染
- OpenSpec 变更文档：`openspec/changes/vendor-k-query-table/`

**v1 明确不做**：替换 `business-component`、对接 umi、复刻 `BsSulaQueryTable` 全部 localStorage 列配置与 `BUSINESS_FLOW_BUTTONS`、sula 插件体系完整移植。

## Capabilities

### New Capabilities

- `k-query-table-package`: 包结构、构建产物、peer 依赖与 vendor 目录约定
- `k-query-table-config`: `KQueryTableConfig` 类型与 config → 运行时 props 映射规则
- `k-query-table-shell`: v1 组件壳——查询表单、状态 Tab、工具栏、表格、分页与 `remoteDataSource` 刷新

### Modified Capabilities

（无：`openspec/specs/` 尚无既有 capability。）

## Impact

- **新目录**：`vendor/k-query-table/`（与 `vendor/sula`、`vendor/business-component` 并列，只读参考上游）
- **不影响**：`apps/*` 业务应用、网关、Host 无界接入（后续子应用可选用本包）
- **参考源码**：`vendor/business-component/.../BsSulaQueryTable`、`vendor/sula/packages/sula/src/template-query-table/QueryTable.tsx`
- **技术选型**：Ant Design 5 Form/Table/Tabs/Pagination；请求层可插拔（默认 `fetch`，不引入 `bssula`）
