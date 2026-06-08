#Requires -Version 5.1
<#
.SYNOPSIS
  Windows 独立版：对齐 Node / npm / cnpm / npminstall（使用 nvm-windows）。

.DESCRIPTION
  不依赖 k-project 仓库。Agent 或同事在 PowerShell 中执行：

    powershell -ExecutionPolicy Bypass -File .\setup-node-toolchain.ps1
    powershell -ExecutionPolicy Bypass -File .\setup-node-toolchain.ps1 -Check

  说明：Windows 使用 nvm-windows（与 macOS/Linux 的 nvm-sh 不是同一产品）。
#>

param(
    [switch]$Check
)

$ErrorActionPreference = 'Stop'

# ========== 版本配置（改这里后重新分发本文件）==========
$NVM_VERSION = '0.39.7'          # 仅 macOS/Linux (nvm-sh)；Windows 见脚本内 nvm-windows
$NODE_VERSION = '16.20.0'
$NPM_VERSION = '8.17.0'
$CNPM_VERSION = '8.3.0'
$NPMINSTALL_VERSION = '6.5.0'
$NVM_DEFAULT_ALIAS = '16'          # Windows nvm-windows 无 alias，安装后 nvm use 即默认
$CNPM_REGISTRY = 'https://registry.npmmirror.com/'
$CNPM_DISTURL = 'https://npmmirror.com/mirrors/node'
# ========================================================

function Write-Log([string]$Message) {
    Write-Host "[node-toolchain] $Message"
}

function Write-Warn([string]$Message) {
    Write-Warning "[node-toolchain] $Message"
}

function Write-Die([string]$Message) {
    throw "[node-toolchain] ERROR: $Message"
}

function Test-SemVerEq {
    param([string]$A, [string]$B)
    $aNorm = ($A -replace '^v', '').Trim()
    $bNorm = ($B -replace '^v', '').Trim()
    return $aNorm -eq $bNorm
}

function Initialize-NvmWindowsPath {
    $nvmHome = if ($env:NVM_HOME) { $env:NVM_HOME } else { Join-Path $env:APPDATA 'nvm' }
    $nvmSymlink = if ($env:NVM_SYMLINK) { $env:NVM_SYMLINK } else { Join-Path ${env:ProgramFiles} 'nodejs' }

    if (Test-Path $nvmHome) {
        $env:NVM_HOME = $nvmHome
    }
    if (Test-Path $nvmSymlink) {
        $env:NVM_SYMLINK = $nvmSymlink
    }

    $extra = @()
    if ($env:NVM_HOME -and (Test-Path $env:NVM_HOME)) { $extra += $env:NVM_HOME }
    if ($env:NVM_SYMLINK -and (Test-Path $env:NVM_SYMLINK)) { $extra += $env:NVM_SYMLINK }

    if ($extra.Count -gt 0) {
        $env:Path = (($extra + ($env:Path -split ';')) | Select-Object -Unique) -join ';'
    }
}

function Test-CommandExists([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Nvm {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    Initialize-NvmWindowsPath
    if (-not (Test-CommandExists 'nvm')) {
        Write-Die '未找到 nvm 命令。请先安装 nvm-windows，并重新打开 PowerShell。'
    }
    & nvm @Args
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        Write-Die "nvm $($Args -join ' ') 失败 (exit $LASTEXITCODE)"
    }
}

function Install-NvmWindows {
    Initialize-NvmWindowsPath
    if (Test-CommandExists 'nvm') {
        $ver = (& nvm version 2>$null)
        Write-Log "nvm-windows 已安装: $ver"
        return
    }

    Write-Log '安装 nvm-windows（winget）...'
    if (-not (Test-CommandExists 'winget')) {
        Write-Die @(
            '未找到 winget。请手动安装 nvm-windows:',
            'https://github.com/coreybutler/nvm-windows/releases',
            '安装完成后重新打开 PowerShell 再运行本脚本。'
        ) -join "`n"
    }

    & winget install --id CoreyButler.NVMforWindows -e `
        --accept-source-agreements --accept-package-agreements

    if ($LASTEXITCODE -ne 0) {
        Write-Die "winget 安装 nvm-windows 失败 (exit $LASTEXITCODE)"
    }

    Initialize-NvmWindowsPath
    if (-not (Test-CommandExists 'nvm')) {
        Write-Die @(
            'nvm-windows 已安装但当前会话找不到 nvm 命令。',
            '请关闭并重新打开 PowerShell（或 Cursor 终端），再运行:',
            '  powershell -ExecutionPolicy Bypass -File .\setup-node-toolchain.ps1'
        ) -join "`n"
    }

    Write-Log "nvm-windows 安装完成: $(nvm version)"
}

function Ensure-Node {
    Initialize-NvmWindowsPath
    $installed = (& nvm list 2>$null | Out-String)

    if ($installed -notmatch [regex]::Escape($NODE_VERSION)) {
        Write-Log "安装 Node v$NODE_VERSION ..."
        Invoke-Nvm install $NODE_VERSION
    }
    else {
        Write-Log "Node v$NODE_VERSION 已存在"
    }

    Invoke-Nvm use $NODE_VERSION
    Write-Log "当前 Node: $(node -v)"
}

function Ensure-Npm {
    Initialize-NvmWindowsPath
    Invoke-Nvm use $NODE_VERSION | Out-Null

    $current = (npm -v).Trim()
    if (Test-SemVerEq $current $NPM_VERSION) {
        Write-Log "npm 版本已对齐: v$current"
        return
    }

    Write-Log "安装 npm@$NPM_VERSION (当前 v$current) ..."
    npm install -g "npm@$NPM_VERSION"
    Write-Log "npm 已对齐: v$(npm -v)"
}

function Ensure-Cnpm {
    Initialize-NvmWindowsPath
    Invoke-Nvm use $NODE_VERSION | Out-Null

    $current = ''
    if (Test-CommandExists 'cnpm') {
        $line = (cnpm -v 2>$null | Select-Object -First 1)
        if ($line -match '^cnpm@([0-9.]+)') {
            $current = $Matches[1]
        }
    }

    if (Test-SemVerEq $current $CNPM_VERSION) {
        Write-Log "cnpm 版本已对齐: v$current"
        return
    }

    Write-Log "安装 cnpm@$CNPM_VERSION (当前 v$(if ($current) { $current } else { '未安装' })) ..."
    npm install -g "cnpm@$CNPM_VERSION"
    Write-Log "cnpm 已安装: $((cnpm -v 2>$null | Select-Object -First 1))"
}

function Set-CnpmConfig {
    $cnpmrc = Join-Path $env:USERPROFILE '.cnpmrc'
    Write-Log "写入 cnpm 配置: $cnpmrc"
    @(
        "registry=$CNPM_REGISTRY"
        "disturl=$CNPM_DISTURL"
    ) | Set-Content -Path $cnpmrc -Encoding UTF8
}

function Get-NpminstallVersion {
    Initialize-NvmWindowsPath
    Invoke-Nvm use $NODE_VERSION | Out-Null

    $prefix = (npm prefix -g).Trim()
    $candidates = @(
        Join-Path $prefix 'node_modules\cnpm\node_modules\npminstall\package.json'
        Join-Path $prefix 'node_modules\npminstall\package.json'
    )

    foreach ($file in $candidates) {
        if (Test-Path $file) {
            $pkg = Get-Content $file -Raw | ConvertFrom-Json
            return [string]$pkg.version
        }
    }
    return $null
}

function Test-Toolchain {
    Initialize-NvmWindowsPath

    if (-not (Test-CommandExists 'nvm')) {
        Write-Warn 'nvm 未安装'
        return $false
    }

    try {
        Invoke-Nvm use $NODE_VERSION | Out-Null
    }
    catch {
        Write-Warn "无法切换到 Node v$NODE_VERSION : $_"
        return $false
    }

    $nodeV = (node -v).Trim()
    $npmV = (npm -v).Trim()
    $cnpmV = ''
    if (Test-CommandExists 'cnpm') {
        $line = (cnpm -v 2>$null | Select-Object -First 1)
        if ($line -match '^cnpm@([0-9.]+)') { $cnpmV = $Matches[1] }
    }
    $npminstallV = Get-NpminstallVersion

    Write-Host ''
    Write-Host '========== 工具链检查结果 (Windows) =========='
    Write-Host ("nvm-windows:  {0}" -f (nvm version))
    Write-Host ("node:         {0} (期望 v{1})" -f $nodeV, $NODE_VERSION)
    Write-Host ("npm:          v{0} (期望 v{1})" -f $npmV, $NPM_VERSION)
    Write-Host ("cnpm:         v{0} (期望 v{1})" -f ($(if ($cnpmV) { $cnpmV } else { '未安装' })), $CNPM_VERSION)
    Write-Host ("npminstall:   v{0} (期望 v{1})" -f ($(if ($npminstallV) { $npminstallV } else { '未找到' })), $NPMINSTALL_VERSION)
    if (Test-CommandExists 'cnpm') {
        Write-Host ("cnpm registry: {0}" -f (cnpm config get registry 2>$null))
    }
    Write-Host '=============================================='
    Write-Host ''

    $ok = $true
    if (-not (Test-SemVerEq $nodeV $NODE_VERSION)) { $ok = $false }
    if (-not (Test-SemVerEq $npmV $NPM_VERSION)) { $ok = $false }
    if (-not (Test-SemVerEq $cnpmV $CNPM_VERSION)) { $ok = $false }
    if (-not (Test-SemVerEq $npminstallV $NPMINSTALL_VERSION)) { $ok = $false }

    if ($ok) {
        Write-Log '全部版本已对齐'
        return $true
    }

    Write-Warn '存在版本不一致，请重新运行本脚本'
    return $false
}

function Show-ShellHint {
    Write-Host @'

下一步:
  1. 若 nvm / node 找不到，请关闭并重新打开 PowerShell 或 Cursor 终端
  2. 验证: node -v && npm -v && cnpm -v
  3. 每次新开终端若 Node 不对，执行: nvm use 16.20.0

'@
}

function Main {
    Write-Log "目标: Node v$NODE_VERSION | npm v$NPM_VERSION | cnpm v$CNPM_VERSION | npminstall v$NPMINSTALL_VERSION"

    if ($Check) {
        if (-not (Test-Toolchain)) { exit 1 }
        exit 0
    }

    Install-NvmWindows
    Ensure-Node
    Ensure-Npm
    Ensure-Cnpm
    Set-CnpmConfig

    if (-not (Test-Toolchain)) {
        Write-Die '安装完成但校验未通过'
    }

    Show-ShellHint
}

Main
