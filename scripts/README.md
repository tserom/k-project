# scripts/ 目录说明

## 两套 Node 工具链，各管各的（不冲突）

| 工具链 | 版本 | 用在哪 | 信息源 |
|--------|------|--------|--------|
| **apps 业务开发** | Node **20.19.x** + pnpm | `apps/host`、`apps/*-front` 的日常开发构建 | 各 app 的 `package.json` `engines` + `docs/WORKSPACE.md` |
| **vendor 老组件库** | Node **16.20.0** + cnpm | 跑 `vendor/sula`、`vendor/business-component`、`vendor/k-query-table` 等老库的构建/示例 | 本目录 `node-toolchain.env` |

> 历史说明：`node-toolchain.env` 顶部注释写的「团队对齐唯一信息源」**仅指 vendor 老组件库这条线**，
> 不是 k-project 业务应用的 Node 版本。业务应用一律 `nvm use 20`。
>
> 根目录 `.nvmrc` 写的是 `16.20.0`：因为 openspec CLI 与 vendor 老库都装在 Node 16 下，
> 根目录默认 16；进入 `apps/*` 开发前记得 `nvm use 20`。

## 文件清单

| 文件 | 是干什么的 |
|------|-----------|
| `node-toolchain.env` | vendor 老库工具链版本定义（Node 16.20.0 / npm / cnpm / 镜像） |
| `setup-node-toolchain.sh` | macOS/Linux 上按 `node-toolchain.env` 用 nvm 安装/对齐上述工具链 |
| `dist/` | 可分发给同事的副本（含 Windows `.ps1` 与给 Agent 的操作说明） |

## 常用命令

```bash
# 跑 vendor 老库前：对齐 Node 16 工具链
bash scripts/setup-node-toolchain.sh

# 回到业务开发：
nvm use 20
```
