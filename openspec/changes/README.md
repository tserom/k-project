# 变更总索引（一眼看懂每个 change 是干什么的）

> 目录名保持英文 kebab-case（openspec CLI 兼容），中文说明看这张表。
> 每个 change 目录里还有一句话 `README.md`；详细内容看各自的 `proposal.md`。
> 状态以 `tasks.md` 勾选为准，归档后移入 `archive/`。

| 目录 | 中文一句话 | 状态 |
|------|-----------|------|
| [workspace-dedup-cn](workspace-dedup-cn/) | 工程化去重与中文化：删重复 skill / 入口文档，spec 规范改中文，加中文索引 | 已完成 |
| [host-layout-extract](host-layout-extract/) | Host 布局拆层：逻辑下沉 + 布局注册表 + 新 modern 默认皮肤，classic 可切回 | 已完成（待 commit） |
| [microfrontend-starter](microfrontend-starter/) | 可整体复制的微前端最简 starter（host 壳 + demo 子应用 + 静态导航 + 中文文档） | 已完成 |
| [host-shell-welcome-user-menu](host-shell-welcome-user-menu/) | Host 壳层：欢迎首页、顶栏用户菜单（登录/个人中心/退出） | 已完成（20/20） |
| [inventory-system-v1](inventory-system-v1/) | 库存系统 v1 全栈：inventory-backend + inventory-front + 平台接入 | 部分完成（19/32） |
| [inventory-transaction-ag-grid](inventory-transaction-ag-grid/) | 出入库单列表换 AG Grid + 单据 API | 大部分完成（18/22） |
| [sales-delivery-list](sales-delivery-list/) | 销售发货单：单据 API + 列表/编辑页 | 大部分完成（21/25） |
| [vendor-k-query-table](vendor-k-query-table/) | KQueryTable 查询表格组件包（vendor 内部组件） | 大部分完成（19/23） |
| [inventory-list-excel-export](inventory-list-excel-export/) | 出入库单 / 销售发货单列表导出 Excel（追溯型补档） | 大部分完成（19/21） |
| [inventory-query-predicate-params](inventory-query-predicate-params/) | `qp-字段-操作符` 受限查询谓词规范在库存接口落地 | 大部分完成（15/18） |

## 实施顺序（本批 3 个新 change）

```text
workspace-dedup-cn  →  host-layout-extract  →  microfrontend-starter
（去重与中文化）        （布局拆层+新皮肤）       （依赖新布局架构，最后做）
```
