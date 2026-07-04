#!/bin/bash
# 更新 shadow-dev-workflow 插件到本地缓存
set -e
PLUGIN_URL="https://github.com/stack-wuh/shadow-dev-workflow.git"
CACHE_PATH="$HOME/.claude/plugins/cache/shadow-dev-workflow-local"
echo "Updating shadow-dev-workflow plugin..."
if [ -d "$CACHE_PATH/.git" ]; then
  git -C "$CACHE_PATH" pull --rebase origin main
else
  mkdir -p "$(dirname "$CACHE_PATH")"
  git clone "$PLUGIN_URL" "$CACHE_PATH"
fi
echo "Update complete."
