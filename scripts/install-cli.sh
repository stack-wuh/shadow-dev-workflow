#!/bin/sh
# 安装 shadow-dev-cli：优先用 SHADOW_CLI_TARBALL 本地产物（测试/离线），
# 否则从 stack-wuh/shadow-dev-cli 的 GitHub release 拉取并校验 sha256。
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${SHADOW_CLI_DEST:-$ROOT/scripts/shadow-dev-cli}"
REPO="${SHADOW_CLI_REPO:-stack-wuh/shadow-dev-cli}"
VERSION="${SHADOW_CLI_VERSION:-latest}"

fetch() { curl -fsSL "$1" -o "$2"; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [ -n "${SHADOW_CLI_TARBALL:-}" ]; then
  cp "$SHADOW_CLI_TARBALL" "$WORK/artifact.tar.gz"
  ARTIFACT="artifact.tar.gz"
else
  if [ "$VERSION" = "latest" ]; then
    fetch "https://api.github.com/repos/$REPO/releases/latest" "$WORK/release.json"
    TAG="$(sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' "$WORK/release.json" | head -n 1)"
  else
    TAG="$VERSION"
  fi
  if [ -z "$TAG" ]; then
    echo "install-cli: cannot resolve release tag for $REPO" >&2
    exit 1
  fi
  BASE="https://github.com/$REPO/releases/download/$TAG"
  NAME="shadow-dev-cli-$TAG.tar.gz"
  fetch "$BASE/$NAME" "$WORK/$NAME"
  fetch "$BASE/$NAME.sha256" "$WORK/$NAME.sha256"
  (
    cd "$WORK" &&
      { shasum -a 256 -c "$NAME.sha256" >/dev/null 2>&1 || sha256sum -c "$NAME.sha256" >/dev/null 2>&1; }
  ) || { echo "install-cli: sha256 mismatch for $TAG" >&2; exit 1; }
  echo "install-cli: fetched $TAG"
  ARTIFACT="$NAME"
fi

mkdir -p "$WORK/unpack"
tar -xzf "$WORK/$ARTIFACT" -C "$WORK/unpack"
if [ ! -f "$WORK/unpack/shadow-dev-cli/cli.mjs" ]; then
  echo "install-cli: artifact missing shadow-dev-cli/cli.mjs" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"
mv "$WORK/unpack/shadow-dev-cli" "$DEST"
chmod +x "$DEST/cli.mjs"
node "$DEST/cli.mjs" --help >/dev/null
echo "install-cli: shadow-dev-cli ready at $DEST"
