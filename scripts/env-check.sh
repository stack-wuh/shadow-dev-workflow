#!/usr/bin/env bash
# env-check.sh — shadow-dev 工作流环境预检：把反复烧会话时间的环境坑变成开机自检。
# 用法: bash scripts/env-check.sh [repo-root]   # 缺省为当前目录
# 输出: [ok]/[warn]/[fail] 行 + 摘要；存在 fail 时退出码 1，否则 0。
set -uo pipefail

ROOT="${1:-$(pwd)}"
fails=0; warns=0
line() { echo "$*"; }

# 1) node 可用性与段错误率（V8 编译缓存损坏的机器上 139 高发：验证前先探，避免把段错误误判为代码失败）
if command -v node >/dev/null 2>&1; then
  seg=0
  for i in 1 2 3 4 5; do
    node -e 1 >/dev/null 2>&1 || [ $? -eq 139 ] && seg=$((seg+1))
  done
  if [ "$seg" -ge 2 ]; then
    line "[fail] node 段错误率 $seg/5 —— 验证结果不可信；export NODE_DISABLE_COMPILE_CACHE=1 并对失败重试至收敛"
    fails=$((fails+1))
  elif [ "$seg" -eq 1 ]; then
    line "[warn] node 段错误率 1/5 —— 长命令建议带重试循环（139 为机器问题非代码问题）"
    warns=$((warns+1))
  else
    line "[ok] node 段错误率 0/5"
  fi
else
  line "[fail] node 不可用"; fails=$((fails+1))
fi

# 2) 系统代理（electron 主进程 net.fetch 可能被劫持，localhost 自定义端口也难幸免）
if command -v scutil >/dev/null 2>&1; then
  if scutil --proxy | grep -q "HTTPEnable : 1"; then
    line "[warn] 系统代理开启 —— electron 实机走查须加 --no-proxy-server，NEXT_DEV_URL 用独立端口"
    warns=$((warns+1))
  else
    line "[ok] 无系统代理"
  fi
fi

# 3) GitHub 凭证（issue/publish/archive 域需要）
if [ -n "${GITHUB_TOKEN:-}" ] || [ -n "${GH_TOKEN:-}" ]; then
  line "[ok] GITHUB_TOKEN 已设置"
elif command -v gh >/dev/null 2>&1 && gh auth token >/dev/null 2>&1; then
  line "[warn] GITHUB_TOKEN 未设置，但 gh 已认证 —— 用 GH_TOKEN=\"\$(gh auth token)\" 前缀执行网络类命令"
  warns=$((warns+1))
else
  line "[fail] 无 GITHUB_TOKEN 且 gh 未认证 —— issue/publish/archive 将失败"
  fails=$((fails+1))
fi

# 4) lockfile 缺失预警（依赖浮动：runtime 契约可能随依赖小版本漂移，如 electron 补丁收紧 scheme 校验）
if [ -f "$ROOT/package.json" ] && [ ! -f "$ROOT/pnpm-lock.yaml" ] && [ ! -f "$ROOT/package-lock.json" ]; then
  line "[warn] 仓库无 lockfile —— 依赖版本浮动；涉及 runtime 契约的 change 在 verify 前先确认依赖版本未漂移"
  warns=$((warns+1))
fi

# 5) worktree 依赖健康（node_modules 存在性 + electron 二进制）
if [ -d "$ROOT/node_modules" ]; then
  if [ -d "$ROOT/node_modules/electron" ] && [ ! -d "$ROOT/node_modules/electron/dist" ]; then
    line "[fail] electron 包已装但二进制缺失 —— node node_modules/electron/install.js"
    fails=$((fails+1))
  else
    line "[ok] node_modules 就绪"
  fi
else
  line "[warn] 无 node_modules —— 装依赖用 pnpm i --ignore-workspace --prefer-offline（勿用 symlink，Turbopack 会拒）"
  warns=$((warns+1))
fi

line "---- 摘要: fail=$fails warn=$warns"
[ "$fails" -eq 0 ]
