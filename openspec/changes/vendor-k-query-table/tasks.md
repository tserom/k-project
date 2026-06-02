## 1. 包脚手架

- [x] 1.1 创建 `vendor/k-query-table/`：`package.json`（`@k-project/k-query-table`）、`tsconfig.json`、`tsup.config.ts`、`.gitignore`
- [x] 1.2 配置 peer：`react ^18 || ^19`、`antd ^5`；dev 依赖对齐 inventory-front
- [x] 1.3 实现 `src/index.ts` 导出 `KQueryTable`、类型、`registerFieldType`
- [x] 1.4 `pnpm build` 产出 ESM/CJS/d.ts 无报错

## 2. Config 契约

- [x] 2.1 编写 `src/types/config.ts`：`KQueryTableConfig`、`FieldConfig`、`RemoteDataSourceConfig`、`StatusMappingItem`
- [x] 2.2 编写 `src/request/index.ts`：`runRemoteDataSource` + 可覆盖的 `request.impl`
- [x] 2.3 在 README 增加与 `BsSulaQueryTable` 支持项对照表

## 3. 字段注册表（v1）

- [x] 3.1 `src/fields/registry.ts`：`registerFieldType` / `getFieldComponent`
- [x] 3.2 内置 `input`、`select`、`dateRange` 三个字段组件
- [x] 3.3 `SearchForm` 根据 `fields` 渲染并绑定 antd Form

## 4. KQueryTable 壳组件

- [x] 4.1 `useQueryTable` hook：queryParams、statusKey、list、total、loading、search、reset、changePage
- [x] 4.2 `StatusTabs`：statusMapping + Badge count
- [x] 4.3 `Toolbar`：actionsRender → Button
- [x] 4.4 `DataTable`：columns + rowSelection + rowKey
- [x] 4.5 `KQueryTable` 组合五段布局 + `forwardRef` 暴露 `refresh()`
- [x] 4.6 样式 `KQueryTable/index.css`（间距、工具栏、查询区栅格）

## 5. Demo 与验证

- [x] 5.1 `demo/` Vite 入口：简单入库单风格 config（`simpleDemoConfig.tsx`）
- [x] 5.2 `remoteDataSource` 对接本地 mock（`demo/mock/list.ts` + `request.impl`）
- [x] 5.3 手测：查询、重置、切 Tab、翻页、表格展示（`http://localhost:8200`）
- [ ] 5.4 （可选）在 `docs/WORKSPACE.md` 或 `vendor/README` 登记 k-query-table 说明

## 6. 后续（非 v1）

- [ ] 6.1 评估 `BsSulaQueryTable` config 适配器
- [ ] 6.2 扩展字段类型（`inputfilter`、远程搜索 select 等）
- [ ] 6.3 接入 `apps/inventory-front` 试验页
