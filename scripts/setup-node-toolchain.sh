#!/usr/bin/env bash
#
# 使用 nvm 安装并对齐 Node / npm / cnpm / npminstall 版本。
# 版本定义见同目录 node-toolchain.env
#
# 用法:
#   bash scripts/setup-node-toolchain.sh          # 安装并对齐
#   bash scripts/setup-node-toolchain.sh --check  # 仅检查，不安装
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/node-toolchain.env"

CHECK_ONLY=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=1
elif [[ -n "${1:-}" ]]; then
  echo "未知参数: $1" >&2
  echo "用法: $0 [--check]" >&2
  exit 1
fi

log() { printf '[node-toolchain] %s\n' "$*"; }
warn() { printf '[node-toolchain] WARN: %s\n' "$*" >&2; }
die() { printf '[node-toolchain] ERROR: %s\n' "$*" >&2; exit 1; }

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令: $1"
}

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    return 0
  fi
  return 1
}

semver_eq() {
  # 去掉前缀 v 后比较
  local a="${1#v}" b="${2#v}"
  [[ "$a" == "$b" ]]
}

install_nvm() {
  if load_nvm; then
    local current_nvm
    current_nvm="$(nvm --version 2>/dev/null || true)"
    if semver_eq "$current_nvm" "$NVM_VERSION"; then
      log "nvm 已安装: v${current_nvm}"
      return 0
    fi
    warn "已存在 nvm (v${current_nvm})，与目标 v${NVM_VERSION} 不一致；跳过重装，继续使用现有 nvm"
    return 0
  fi

  log "安装 nvm v${NVM_VERSION} ..."
  require_command curl
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh" | bash

  load_nvm || die "nvm 安装后无法加载，请手动执行: source \"\$HOME/.nvm/nvm.sh\""
  log "nvm 安装完成: v$(nvm --version)"
}

ensure_node() {
  load_nvm || die "无法加载 nvm"

  if nvm ls "$NODE_VERSION" >/dev/null 2>&1; then
    log "Node v${NODE_VERSION} 已存在"
  else
    log "安装 Node v${NODE_VERSION} ..."
    nvm install "$NODE_VERSION"
  fi

  nvm use "$NODE_VERSION" >/dev/null
  nvm alias default "$NVM_DEFAULT_ALIAS" >/dev/null 2>&1 || nvm alias default "$NODE_VERSION" >/dev/null
  log "当前 Node: $(node -v) (default alias -> ${NVM_DEFAULT_ALIAS})"
}

ensure_npm() {
  load_nvm || die "无法加载 nvm"
  nvm use "$NODE_VERSION" >/dev/null

  local current_npm
  current_npm="$(npm -v)"
  if semver_eq "$current_npm" "$NPM_VERSION"; then
    log "npm 版本已对齐: v${current_npm}"
    return 0
  fi

  log "安装 npm@${NPM_VERSION} (当前 v${current_npm}) ..."
  npm install -g "npm@${NPM_VERSION}"
  log "npm 已对齐: v$(npm -v)"
}

ensure_cnpm() {
  load_nvm || die "无法加载 nvm"
  nvm use "$NODE_VERSION" >/dev/null

  if command -v cnpm >/dev/null 2>&1; then
    local current_cnpm
    current_cnpm="$(cnpm -v 2>/dev/null | head -n1 | sed -n 's/^cnpm@\([0-9.]*\).*/\1/p')"
    if semver_eq "$current_cnpm" "$CNPM_VERSION"; then
      log "cnpm 版本已对齐: v${current_cnpm}"
    else
      log "安装 cnpm@${CNPM_VERSION} (当前 v${current_cnpm:-unknown}) ..."
      npm install -g "cnpm@${CNPM_VERSION}"
      log "cnpm 已安装: v$(cnpm -v 2>/dev/null | head -n1)"
    fi
  else
    log "安装 cnpm@${CNPM_VERSION} ..."
    npm install -g "cnpm@${CNPM_VERSION}"
    log "cnpm 已安装: v$(cnpm -v 2>/dev/null | head -n1)"
  fi
}

configure_cnpm() {
  load_nvm || die "无法加载 nvm"
  nvm use "$NODE_VERSION" >/dev/null

  local cnpmrc="${HOME}/.cnpmrc"
  log "写入 cnpm 配置: ${cnpmrc}"

  cat >"$cnpmrc" <<EOF
registry=${CNPM_REGISTRY}
disturl=${CNPM_DISTURL}
EOF
}

read_npminstall_version() {
  load_nvm || return 1
  nvm use "$NODE_VERSION" >/dev/null

  local root prefix
  prefix="$(npm prefix -g)"
  local candidates=(
    "${prefix}/lib/node_modules/cnpm/node_modules/npminstall/package.json"
    "${prefix}/lib/node_modules/npminstall/package.json"
  )

  for f in "${candidates[@]}"; do
    if [[ -f "$f" ]]; then
      node -e "process.stdout.write(require('${f}').version)"
      return 0
    fi
  done
  return 1
}

verify_toolchain() {
  load_nvm || die "无法加载 nvm"
  nvm use "$NODE_VERSION" >/dev/null

  local ok=1
  local node_v npm_v cnpm_v npminstall_v

  node_v="$(node -v)"
  npm_v="$(npm -v)"
  cnpm_v="$(cnpm -v 2>/dev/null | head -n1 | sed -n 's/^cnpm@\([0-9.]*\).*/\1/p' || true)"
  npminstall_v="$(read_npminstall_version 2>/dev/null || true)"

  echo ""
  echo "========== 工具链检查结果 =========="
  printf "nvm:         v%s\n" "$(nvm --version)"
  printf "node:        %s (期望 v%s)\n" "$node_v" "$NODE_VERSION"
  printf "npm:         v%s (期望 v%s)\n" "$npm_v" "$NPM_VERSION"
  printf "cnpm:        v%s (期望 v%s)\n" "${cnpm_v:-未安装}" "$CNPM_VERSION"
  printf "npminstall:  v%s (期望 v%s)\n" "${npminstall_v:-未找到}" "$NPMINSTALL_VERSION"
  printf "cnpm registry: %s\n" "$(cnpm config get registry 2>/dev/null || echo '—')"
  echo "===================================="
  echo ""

  semver_eq "${node_v#v}" "$NODE_VERSION" || ok=0
  semver_eq "$npm_v" "$NPM_VERSION" || ok=0
  semver_eq "${cnpm_v:-}" "$CNPM_VERSION" || ok=0
  semver_eq "${npminstall_v:-}" "$NPMINSTALL_VERSION" || ok=0

  if [[ "$ok" -eq 1 ]]; then
    log "全部版本已对齐"
    return 0
  fi

  warn "存在版本不一致，请运行: bash scripts/setup-node-toolchain.sh"
  return 1
}

print_shell_hook_hint() {
  cat <<'EOF'

下一步（若新开终端 node 命令不可用）:
  在 ~/.zshrc 或 ~/.bashrc 末尾确保有:

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  然后执行: source ~/.zshrc  (或 source ~/.bashrc)

EOF
}

main() {
  log "目标: Node v${NODE_VERSION} | npm v${NPM_VERSION} | cnpm v${CNPM_VERSION} | npminstall v${NPMINSTALL_VERSION}"

  if [[ "$CHECK_ONLY" -eq 1 ]]; then
    verify_toolchain
    exit $?
  fi

  install_nvm
  ensure_node
  ensure_npm
  ensure_cnpm
  configure_cnpm

  verify_toolchain || die "安装完成但校验未通过"
  print_shell_hook_hint
}

main "$@"
