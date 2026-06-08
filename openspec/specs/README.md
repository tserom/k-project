# openspec/specs — 系统行为真理源（可选）

本目录存放**已归档、稳定**的能力规格摘要。当前 k-project 以 `openspec/changes/` 中的 change 为主要历史；功能增多后可把归档 change 合并到这里。

## 何时写入

- 某 change 经 `/opsx-archive` 归档且已在生产/主分支验证
- 需要 AI 回答「系统现在怎么 behave」时，优先读此处而非旧 change

## 结构建议

```
openspec/specs/
├── host-shell/
│   └── spec.md
├── inventory/
│   └── spec.md
└── user-auth/
    └── spec.md
```

## 与 changes 的关系

| 目录 | 用途 |
|------|------|
| `openspec/changes/` | 进行中的需求与历史 change |
| `openspec/specs/` | 合并后的现行行为（真理源） |

暂无内容时可直接查 `openspec/changes/*/specs/` 与 `docs/*.md`。
