# Team Standard Draft: API Query Predicate Params

> Target for team-agent-standards:
> - Short agent rule: `guidelines/api-query-predicate-params.md`
> - Human-readable standard: `docs/standards/api-query-predicate-params.md`
> - Cursor build output: add/update `cursor-manifest.json`, then run `python3 scripts/build.py cursor`

## Short Rule Draft

# API Query Predicate Params

When designing list, export, or admin filtering APIs, use a constrained query predicate convention:

```text
qp-<field>-<operator>=<value>
```

Rules:

- `field` MUST be the public API field name, normally camelCase, such as `createdAt` or `partyName`.
- Backend code MUST map `field + operator` through an explicit whitelist.
- Frontend code MUST NOT send database column names unless the API contract itself exposes snake_case fields.
- `operator` MUST be from the supported set for that field.
- `value` MUST be treated as data only; never as SQL or query-builder code.
- Multiple `qp-*` params are `AND` by default.
- Do not add `OR`, nested groups, raw expressions, or arbitrary field paths without a separate design.

Recommended v1 operators:

| Operator | Meaning |
|---|---|
| `eq` | equals |
| `ne` | not equals |
| `in` | comma-separated multiple values |
| `like` | fuzzy match, field-specific semantics |
| `gt` | greater than |
| `gte` | greater than or equal |
| `lt` | less than |
| `lte` | less than or equal |

Examples:

```text
qp-id-eq=1
qp-id-in=1,2,3
qp-status-eq=enabled
qp-partyName-like=Acme
qp-createdAt-gte=2026-01-01
qp-createdAt-lte=2026-01-31
```

Keep non-predicate concerns outside `qp-*`:

- `page` / `pageSize`: pagination
- `q`: global or multi-field search
- `sort`: sorting, defined by a separate standard

## Human-Readable Standard Draft

## Purpose

`qp-<field>-<operator>=<value>` is a small query string convention for expressing field-level filter predicates in HTTP APIs. It is useful for tables, admin pages, exports, and other list endpoints.

The convention is intentionally SQL-like, but it is not SQL. The client describes filtering intent; the server owns SQL generation, field mapping, type conversion, authorization, and parameter binding.

## Format

```text
qp-<field>-<operator>=<value>
```

- `qp`: query predicate/query parameter prefix.
- `field`: public API field name.
- `operator`: constrained predicate operator.
- `value`: raw query string value to be parsed according to the field type.

## Field Rule

The `field` segment is part of the public API contract. Use the same field names the API returns or accepts, usually camelCase:

```text
qp-createdAt-gte=2026-01-01
qp-partyName-like=Acme
```

The server maps public fields to internal query fields:

```text
createdAt -> created_at
partyName -> party_name
```

Do not expose database column names by default:

```text
qp-created_at-gte=2026-01-01
qp-party_name-like=Acme
```

This is only acceptable when snake_case is already the explicit API contract.

## Backend Requirements

Every endpoint that accepts `qp-*` must declare its own whitelist:

```text
field + operator -> query behavior
```

Examples:

```text
id + eq -> WHERE id = ?
id + in -> WHERE id IN ?
partyName + like -> WHERE party_name LIKE ?
createdAt + gte -> WHERE created_at >= ?
createdAt + lte -> WHERE created_at <= ?
```

Required behavior:

- Unknown field: return 400.
- Unsupported operator for a known field: return 400.
- Type conversion failure: return 400.
- `in` values: split by comma and convert each item according to field type.
- Empty values: define per field; default to reject or ignore consistently.
- SQL must be generated through parameter binding or a query builder.

MUST NOT:

- Concatenate client values into SQL strings.
- Let clients reference arbitrary columns.
- Let clients pass raw SQL snippets, functions, joins, or expressions.
- Treat the presence of a `qp-*` key as authorization to query sensitive fields.

## Frontend Requirements

Frontend code should build params using API field names:

```ts
const params = {
  "qp-id-in": selectedIds.join(","),
  "qp-partyName-like": partyName,
  "qp-createdAt-gte": range[0],
  "qp-createdAt-lte": range[1],
}
```

Frontend code should not know or send database column names. UI components, table configs, and export actions should use the same public field names documented by the endpoint.

## SQL Relationship

The convention maps naturally to SQL predicates:

```text
qp-id-in=1,2,3
```

Server-side equivalent:

```sql
WHERE id IN (?, ?, ?)
```

But this mapping is owned by the backend. The query string is not a SQL transport format.

## Scope

In scope:

- List filters
- Export filters
- Admin table filters
- Status tabs that map to a single field predicate
- Date/number/string range filters

Out of scope for v1:

- OR conditions
- Nested groups
- Parentheses
- Arbitrary relation paths
- Raw SQL expressions
- Sorting
- Pagination
- Full-text or multi-field search

Pagination, sorting, and global search should keep their own top-level parameters, such as `page`, `pageSize`, `sort`, and `q`.

## API Documentation Template

Each endpoint should document accepted predicates:

| Query Param | Type | Meaning |
|---|---|---|
| `qp-id-eq` | number | Match one ID |
| `qp-id-in` | number[] | Match multiple comma-separated IDs |
| `qp-status-eq` | string | Match status |
| `qp-partyName-like` | string | Fuzzy match party name |
| `qp-createdAt-gte` | date/datetime | Created time lower bound |
| `qp-createdAt-lte` | date/datetime | Created time upper bound |

## Review Checklist

- [ ] Does every `qp-*` field use the public API field name?
- [ ] Does the backend whitelist `field + operator` explicitly?
- [ ] Are invalid fields/operators/type conversions rejected with 400?
- [ ] Are SQL values bound as parameters?
- [ ] Are pagination, sorting, and global search kept outside `qp-*`?
- [ ] Are unsupported advanced conditions intentionally excluded from v1?
