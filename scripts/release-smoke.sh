#!/usr/bin/env bash
# 发布冒烟的唯一实现（single implementation）。
# CI（release.published 的冒烟步骤）与本机门（scripts/check-release-smoke.mjs 的离线腿）都调本文件——
# 断言只允许写在这里，任何位置再抄一遍都是本仓已付出两次发版代价禁止的形态（INV-1/INV-3）。
# 用法：bash scripts/release-smoke.sh (--release <tag> | --from <tarball>) [--work <dir>]
# 五条断言（INV-2，删任一条会被门判红）：
#   1 plan 返回 version  2 execute 返回 version  3 CURRENT 指针 == 物化版本
#   4 产物含 norms/verification.md  5 skills 数 == 仓内实测 EXPECTED
set -euo pipefail

MODE=""; REL=""; FROM=""; WORK=""
while [ $# -gt 0 ]; do
  case "$1" in
    --release) MODE=release; REL="$2"; shift 2 ;;
    --from) MODE=from; FROM="$2"; shift 2 ;;
    --work) WORK="$2"; shift 2 ;;
    *) echo "x unknown argument: $1" >&2; exit 2 ;;
  esac
done
[ -n "$MODE" ] || { echo "x 必须指定 --release <tag> 或 --from <tarball>" >&2; exit 2; }
command -v shadow-dev >/dev/null 2>&1 || { echo "x shadow-dev 不在 PATH，冒烟无从执行" >&2; exit 3; }

if [ -z "$WORK" ]; then WORK=$(mktemp -d); fi
rm -rf "$WORK"; mkdir -p "$WORK/prefix" "$WORK/home"
export SHADOW_WORKFLOW_PREFIX="$WORK/prefix"
export SHADOW_WORKFLOW_HOME="$WORK/home"

# JSON 取值：只允许读被 pin 命令真实返回的键（字段契约见 check-release-smoke.mjs 的 ALLOW 表）
jq() { node -pe "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))$2" "$1"; }

if [ "$MODE" = release ]; then
  shadow-dev workflow plan --release "$REL" --json | grep '^{"ok"' | tail -1 > "$WORK/plan.json"
else
  shadow-dev workflow plan --from "$FROM" --json | grep '^{"ok"' | tail -1 > "$WORK/plan.json"
fi
PLAN_VER=$(jq "$WORK/plan.json" .data.version)
MISS=$(jq "$WORK/plan.json" .data.missingCommands)
[ -n "$PLAN_VER" ] || { echo "x plan 未返回 version" >&2; exit 1; }
echo "OK plan version=$PLAN_VER missing=$MISS"
HASH=$(jq "$WORK/plan.json" .planHash)

if [ "$MODE" = release ]; then
  shadow-dev workflow execute --release "$REL" --plan-hash "$HASH" --confirm --json | grep '^{"ok"' | tail -1 > "$WORK/exec.json"
else
  shadow-dev workflow execute --from "$FROM" --plan-hash "$HASH" --confirm --json | grep '^{"ok"' | tail -1 > "$WORK/exec.json"
fi
VER=$(jq "$WORK/exec.json" .data.version)
# 断言 2：字段是 execute 的 version，不是 status 的 current——v7.0.0 的链红正是借错了字段
[ -n "$VER" ] || { echo "x execute 未返回 data.version（该命令只返回 action|version|prefix|previous）" >&2; exit 1; }
echo "OK execute version=$VER"

ROOT="$WORK/prefix/shadow-dev-workflow-$VER"
shadow-dev workflow status --prefix "$SHADOW_WORKFLOW_PREFIX" --json | grep '^{"ok"' | tail -1 > "$WORK/status.json"
PTR=$(jq "$WORK/status.json" .data.current)
# 断言 3：指针与物化版本同源
[ "$PTR" = "$VER" ] || { echo "x CURRENT 指针=$PTR 但物化版本=$VER" >&2; exit 1; }
# 断言 4：规范文件在位
test -f "$ROOT/norms/verification.md" || { echo "x 物化产物缺 norms/verification.md: $ROOT" >&2; exit 1; }
# 断言 5：技能数与仓内实测一致，期望值不得写死（v7.0.1 的链红是这里的变量被写成反引号形态）
N=$(find "$ROOT/skills" -name SKILL.md | wc -l | tr -d ' ')
EXPECTED=$(find skills -name SKILL.md | wc -l | tr -d ' ')
[ "$N" = "$EXPECTED" ] || { echo "x materialized skills count=$N expected $EXPECTED" >&2; exit 1; }
echo "OK materialized root=$ROOT skills=$N"

shadow-dev bind plan --host codex --prefix "$SHADOW_WORKFLOW_PREFIX" --json | grep '^{"ok"' | tail -1 > "$WORK/bind.json"
BIND_VER=$(jq "$WORK/bind.json" .data.version)
[ "$BIND_VER" = "$VER" ] || { echo "x bind plan 宿主可见版本=$BIND_VER 物化版本=$VER" >&2; exit 1; }
echo "OK bind plan host-version=$BIND_VER"
