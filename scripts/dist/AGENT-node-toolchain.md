# Agent 操作：对齐 Node 工具链（跨平台）

> 给 Cursor / Copilot 等 Agent 用。同事**不必克隆 k-project**，只需拿到 `scripts/dist/` 下对应脚本。

## 版本（与脚本内配置块一致）

| 项 | 值 |
|----|-----|
| Node | `16.20.0` |
| npm | `8.17.0` |
| cnpm | `8.3.0` |
| npminstall | `6.5.0`（随 cnpm） |
| cnpm registry | `https://registry.npmmirror.com/` |

macOS/Linux 额外：`nvm-sh` `0.39.7`  
Windows 额外：`nvm-windows`（通过 winget 安装，与 nvm-sh 不是同一产品）

---

## Agent 第一步：判断系统

| 环境 | 用哪个脚本 |
|------|------------|
| **Windows**（PowerShell / cmd） | `setup-node-toolchain.ps1` |
| **macOS / Linux** | `setup-node-toolchain.sh` |
| **Windows + WSL** | 在 WSL 里用 `.sh`（与 Linux 相同） |
| **Windows + Git Bash** | 优先 `.ps1`；Git Bash 跑 `.sh` 也可但需已有 nvm-sh |

**不要**在 Windows 原生 PowerShell 里执行 `.sh`。

---

## Windows — Agent 执行清单

**前提**：用户已把 `setup-node-toolchain.ps1` 放到本机（下载、飞书、任意路径均可）。

### 1. 仅检查（不安装）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "PATH\TO\setup-node-toolchain.ps1" -Check
```

### 2. 安装并对齐

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "PATH\TO\setup-node-toolchain.ps1"
```

**Agent 注意**：

- 需要 **network**（winget 装 nvm-windows、下载 Node/npm 包）。
- 首次 `winget install nvm-windows` 可能需 **用户确认 UAC**；若失败，提示用户手动装 [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases) 后**重开终端**再跑脚本。
- 若脚本提示「请重新打开 PowerShell」，Agent 应在新终端再跑 `-Check` 验证。
- 执行权限：Cursor 终端若报策略错误，必须带 `-ExecutionPolicy Bypass`。

### 3. 验证成功标准

输出表内全部为「期望」版本，且：

```powershell
node -v    # v16.20.0
npm -v     # 8.17.0
cnpm -v    # 含 cnpm@8.3.0
```

---

## macOS / Linux — Agent 执行清单

```bash
bash "PATH/TO/setup-node-toolchain.sh" --check   # 仅检查
bash "PATH/TO/setup-node-toolchain.sh"           # 安装
```

**Agent 注意**：

- 需要 **network**（curl 装 nvm-sh、下载 Node）。
- 若 `node` 找不到，检查 `~/.zshrc` / `~/.bashrc` 是否已 source nvm：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

---

## 升级版本时 Agent 怎么做

1. 编辑对应脚本顶部的 **版本配置** 块（`.ps1` 与 `.sh` 保持一致）。
2. 重新分发给同事（或更新下载链接）。
3. 各平台再跑一遍安装脚本（可重复执行）。

---

## 常见问题（Agent 排错）

| 现象 | 处理 |
|------|------|
| Windows 没有 `winget` | 手动安装 nvm-windows，重开终端，再跑 `.ps1` |
| Windows `nvm use` 后要管理员 | 以管理员开一次 PowerShell 执行 `nvm use 16.20.0`，或检查 `NVM_SYMLINK` 目录权限 |
| macOS `command not found: node` | source nvm 或新开终端；`nvm use 16.20.0` |
| cnpm 慢/失败 | 确认 `~/.cnpmrc`（或 `%USERPROFILE%\.cnpmrc`）registry 为 npmmirror |
| 版本差一个小补丁 | 改脚本里 `NPM_VERSION` / `CNPM_VERSION` 后重跑 |

---

## 给用户的简短话术（Agent 可直接回复）

**Windows：**

> 请把 `setup-node-toolchain.ps1` 存到任意文件夹，在 PowerShell 执行：  
> `powershell -ExecutionPolicy Bypass -File .\setup-node-toolchain.ps1`  
> 装完若提示重开终端，关掉 Cursor 终端再开，执行 `node -v` 应为 `v16.20.0`。

**Mac：**

> 执行 `bash setup-node-toolchain.sh` 即可。
