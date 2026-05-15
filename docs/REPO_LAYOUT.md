# 仓库与目录布局（物理结构）

## 为何这样放

- **`apps/`**：可独立构建、部署的应用（父/子前端 + Go API），名称与职责一眼可读。
- **`vendor/wujie/`**：第三方上游源码，与自有业务隔离，便于偶尔 `git pull` 对照文档与示例。

## Git 与远程

- 每个带 `.git` 的子目录在搬迁后**仍指向原 `origin`**，无需因移动文件夹而改 remote（除非你希望换新托管路径）。
- **本地路径**从例如 `k-project/user-front` 变为 `k-project/apps/user-front`：IDE 里若曾固定「打开文件夹」路径，需重新打开 `apps/user-front` 或整个 `k-project` 根。
- **CI / 脚本**：若有外部流水线写死了旧路径，需改为 `apps/...`。

## 历史名称对照

| 旧路径（根下平铺） | 新路径 |
|-------------------|--------|
| `main-project-front/` | `apps/host/` |
| `user-front/` | `apps/user-front/` |
| `hello-front/` | `apps/hello-front/` |
| `user-backend/` | `apps/user-backend/` |
| `wujie/` | `vendor/wujie/` |

Compose 父应用服务名为 **`host`**，与目录 `apps/host` 一致。
