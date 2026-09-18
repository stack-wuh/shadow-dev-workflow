#!/usr/bin/env bash
# bootstrap-cli.sh — SessionStart 自举：确保 package.json 锁定的 shadow-dev-cli 版本就位。
# 成功恒零输出（hook stdout 走严格 JSON 校验，空输出即通过）；失败仅 stderr 警告，恒 exit 0 不阻塞会话。
# SHADOW_CLI_HOOK_DISABLE=1 完全跳过（双仓开发时保护手动 --channel main / --from 安装）。
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

[ "${SHADOW_CLI_HOOK_DISABLE:-}" = "1" ] && exit 0

PIN="$(node -pe 'require(process.argv[1]).cliVersion || ""' "$ROOT/package.json" 2>/dev/null)"
if [ -z "${PIN:-}" ]; then
  echo "shadow-dev bootstrap: package.json 缺少 cliVersion pin，跳过自举" >&2
  exit 0
fi

# 已就位（指针与版本目录一致）则不触安装器、不触网
PREFIX="${SD_PREFIX:-$HOME/.local/share/shadow-dev-cli}"
VER="${PIN#v}"
if [ "$(cat "$PREFIX/CURRENT" 2>/dev/null)" = "$VER" ] && [ -d "$PREFIX/shadow-dev-cli-$VER" ]; then
  exit 0
fi

OUT="$(bash "${SHADOW_CLI_INSTALLER:-$ROOT/scripts/install-cli.sh}" install --version "$PIN" --json 2>/dev/null)"
case "$OUT" in
*'"ok":true'*) exit 0 ;;
*)
  echo "shadow-dev bootstrap: CLI $PIN 未能就位（可能离线），shadow-dev 命令暂不可用；可手动安装：bash scripts/install-cli.sh install --version $PIN" >&2
  ;;
esac
exit 0
