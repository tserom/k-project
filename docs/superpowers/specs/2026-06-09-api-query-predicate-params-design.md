# API Query Predicate Params Design

## Context

项目里已经出现过 `qp-id-in=111,222,333` 和 `qp-status-eq=1` 这类参数。它们用于表达列表、导出、状态 Tab 等场景里的筛选条件。

这套约定本质上是一个放在 HTTP query string 里的受限查询谓词协议，类似 SQL `WHERE` 子句、OData `$filter`、RSQL/FIQL、Django Filter/Ransack 等设计，但它不允许前端表达任意 SQL。

## Decision

统一采用：

```text
qp-<field>-<operator>=<value>
```

其中：

- `qp` 表示 query predicate/query parameter。
- `field` 使用 API 契约字段名，例如 `createdAt`、`partyName`、`id`。
- `operator` 是后端允许的受限操作符。
- `value` 只表达值，不表达 SQL 片段。

示例：

```text
qp-id-eq=1
qp-id-in=1,2,3
qp-status-eq=enabled
qp-partyName-like=客户A
qp-createdAt-gte=2026-01-01
qp-createdAt-lte=2026-01-31
```

## Field Naming

`field` 使用接口请求/响应里的字段名，默认 camelCase。

后端通过白名单把 API 字段映射到实际查询字段：

```text
id -> id
status -> status
partyName -> party_name
createdAt -> created_at
```

选择 API 字段名的原因：

- URL 参数属于 API 契约，不属于数据库契约。
- 前端不需要知道数据库列名或 ORM 字段名。
- 后端可以在不破坏前端参数的情况下调整表结构、join、视图或计算字段。
- 同一个 API 字段可以映射到单列、关联表列或表达式，但这个映射必须由后端显式维护。

禁止：

```text
qp-party_name-like=客户A
qp-created_at-gte=2026-01-01
```

除非该接口本身公开字段就是 snake_case。

## Operators

第一版只保留小集合，避免协议过早变成一门查询语言。

| Operator | Meaning | SQL Analogy | Value Example |
|---|---|---|---|
| `eq` | 等于 | `=` | `qp-id-eq=1` |
| `ne` | 不等于 | `!=` | `qp-status-ne=disabled` |
| `in` | 多值命中 | `IN (...)` | `qp-id-in=1,2,3` |
| `like` | 模糊匹配 | `LIKE` | `qp-partyName-like=客户A` |
| `gt` | 大于 | `>` | `qp-amount-gt=100` |
| `gte` | 大于等于 | `>=` | `qp-createdAt-gte=2026-01-01` |
| `lt` | 小于 | `<` | `qp-amount-lt=1000` |
| `lte` | 小于等于 | `<=` | `qp-createdAt-lte=2026-01-31` |

默认多个 `qp-*` 条件之间是 `AND` 关系。

暂不支持：

- `OR`
- 括号
- 嵌套条件
- 前端自定义排序表达式
- 任意 SQL 函数
- 任意字段路径，如 `user.company.name`

这些能力只有在真实业务反复需要时再单独设计，不放进 v1。

## Backend Contract

后端必须按接口维护白名单：

```text
API field + operator -> query builder action
```

例如：

```text
id + eq -> WHERE id = ?
id + in -> WHERE id IN ?
partyName + like -> WHERE party_name LIKE ?
createdAt + gte -> WHERE created_at >= ?
createdAt + lte -> WHERE created_at <= ?
```

后端解析要求：

- 未注册字段返回 400。
- 字段存在但不支持该 operator 返回 400。
- 类型转换失败返回 400，例如 `qp-id-in=1,abc`。
- `in` 使用英文逗号分隔，后端按字段类型逐项转换。
- 空字符串是否有效由字段定义决定，默认忽略空值或返回 400，不能静默拼入 SQL。
- 所有查询必须走参数绑定或 ORM query builder，禁止字符串拼接 SQL。

## Frontend Contract

前端只按 API 字段名组装参数：

```ts
{
  "qp-id-in": selectedIds.join(","),
  "qp-partyName-like": partyName,
  "qp-createdAt-gte": dateRange[0],
  "qp-createdAt-lte": dateRange[1],
}
```

前端不应该：

- 传数据库列名。
- 拼接 SQL 片段。
- 传未在接口文档中声明的 `qp-*` 字段。
- 同时传语义冲突的条件，例如 `qp-id-eq=1` 和 `qp-id-in=2,3`，除非接口文档明确允许。

## Relationship To SQL

这套协议很像 SQL `WHERE` 谓词，但边界不同：

```text
qp-id-in=1,2,3
```

可以被后端翻译为：

```sql
WHERE id IN (?, ?, ?)
```

但前端表达的是“筛选意图”，不是 SQL。SQL 字段、join、表达式、参数绑定都由后端控制。

## Recommended Documentation Shape

每个接口文档在筛选部分列出允许字段：

| Param | Type | Meaning |
|---|---|---|
| `qp-id-eq` | number | 精确筛选单个 ID |
| `qp-id-in` | number[] | 筛选多个 ID，逗号分隔 |
| `qp-partyName-like` | string | 按主体名称模糊筛选 |
| `qp-createdAt-gte` | date/datetime | 创建时间起点 |
| `qp-createdAt-lte` | date/datetime | 创建时间终点 |

如果某个接口使用常规参数，例如 `page`、`pageSize`、`sort`、`q`，它们不强行放进 `qp-*`：

- `qp-*`：字段谓词筛选。
- `q`：全文/多字段搜索。
- `page` / `pageSize`：分页。
- `sort`：排序，后续单独定义。

## Open Questions

- 日期边界用日期还是 datetime，需要按接口声明。
- `like` 是 contains、prefix 还是 suffix，需要按字段声明；默认建议 contains。
- 是否需要 `isNull` / `notNull`，等真实场景出现再加。
- 是否需要排序协议，建议独立设计，不复用 `qp-*`。
