---
{
  "schema": "shadow-dev/v1",
  "name": "20261013-chore-release-v711",
  "type": "chore",
  "scope": null,
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261013-chore-release-v711",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261013-chore-release-v711/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": null,
    "issueUrl": null,
    "pullRequest": 66,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/66"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "59ae33711f8405ba47728f53c95bf7525e13d676",
    "verifiedAt": "2026-10-13T07:04:36.120Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:66",
    "planHash": "306e6a462653807032f5ec40bbc6ea43fc009dff9e8d44c5c10ac0bad20cf9f5",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261013-chore-release-v711/brief.md"
      ],
      "message": "chore: v7.1.1 三份 manifest 同源 bump 与 cliVersion pin v1.7.0",
      "title": "chore: v7.1.1 三份 manifest 同源 bump 与 cliVersion pin v1.7.0",
      "body": "## 变更\n- `package.json`：`version` 7.1.0 → 7.1.1、`cliVersion` v1.6.0 → v1.7.0\n- `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`：`version` → 7.1.1\n- 三份由 `node scripts/bump-version.mjs 7.1.1` 一处命令写入，不手改\n- `shadow-docs/INDEX.md`：登记本载体；载体 brief 自身\n\n## 影响\n- 行为/触发面变化：安装轨自此拿到带无 brief `sync` 的 CLI，与已合并的文档形态（PR #65）同源\n- 装 v1.6.0 的机器上「文档教无 `--name`、CLI 却 `NAME_REQUIRED`」的错配自此消除\n- 明确不受影响的范围：`skills/**`、`norms/**`、`rules/**`、`scripts/**` 未触碰\n- `requiresCommands` 29 项不动——`sync.plan` / `sync.execute` 键名未变，是判定结果而非省略\n\n## 验证\n- 命令与结果：`npm run check:version` → `✓ 三处 manifest 版本同源: 7.1.1（3 个文件）`\n- `npm run check:requires:strict` → `declared=29 undeclared=[] missing-in-cli=[] strict=on`\n- `npm run check:knowledge` → `ok=11 warn=16 fail=0`；`npm run check:brief` → `briefs=4 ok=2 warn=2 fail=0`\n- 差异面：`git diff --stat` = 4 文件 5 增 4 删\n- pin 目标在位：`gh release download v1.7.0 --pattern *.tar.gz` 实取 `49057B`，`uploader=github-actions[bot]`\n- 本机 `curl` 直连 github https 下载不通（`HTTP 000`/`exit 43`），故 runner 侧可达性以本 PR 的 `quality-gate` 为准\n- 未覆盖项：本机不跑 `npm test`（含 install-cli/pack/release-smoke，依赖 `SHADOW_DEV_BASH` 口径）\n- 未覆盖项：发布链端到端需 tag `v7.1.1` 落地才可取证，已在 brief 结果段登记为待回填\n\n## 关联\n- Refs #65\n- brief: shadow-docs/changes/20261013-chore-release-v711/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": null
  }
}
---

# 20261013-chore-release-v711

## 动机

文档对齐（PR #65，已合并）把 `sync` 的收口形态改成不传 `--name`，但产物仍 pin 在 `cliVersion: v1.6.0`——装 v1.6.0 的机器上，文档教的形态会直接 `NAME_REQUIRED`（brief 硬依赖在 CLI v1.7.0 才解除）。内容与能力必须同源交付，否则这份文档对使用者就是错的。

## 复杂度评级

- **评级:** S
- **理由:** 纯声明式 bump——三份 manifest 版本 + `cliVersion` pin。零脚本、零 SKILL 正文改动（正文由 PR #65 承载），`requiresCommands` 不动（`sync.plan` / `sync.execute` 键名未变）。
- **期望验证深度:** field——四门本地判定 + `check:version` 三处同源；发布链端到端在 tag 落地后回填。

## 覆盖范围

- `package.json`：`version` 7.1.0 → 7.1.1、`cliVersion` v1.6.0 → v1.7.0
- `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`：`version` → 7.1.1（由 `scripts/bump-version.mjs` 一处命令写三处，不手改）
- `shadow-docs/INDEX.md`：登记本载体（PR #65 的 CI 因台账缺条目红过一次，这次一次性带上）
- 载体 brief 自身

## 决策

- **patch 位 7.1.1**：无新增技能、无命令键变化、无破坏性契约，只交付已合并的文档对齐与 CLI pin。
- **pin 与 bump 合进同一个 PR**：两者同属 `chore` 意图，且拆开会多一轮 CI 与一次台账登记；本 change 不触碰 SKILL 正文，不构成混交。
- pin 只能指向**已存在的 release**：v1.7.0 已打 tag，资产由发布链自动产出（run `38356779724` success，uploader `github-actions[bot]`）——不复现 v1.6.0 那次 pin 先于 tag 的 404 红灯。
- 台账一次到位：先 `index rebuild` 再把 `shadow-docs/INDEX.md` 纳入 `release --files`，避免 PR 阶段 `[fail] 台账缺条目`。
- tag 指向含 bump 的 main：先合并后打 tag；归档提交不得触碰三份 manifest。

## 任务

- [x] task-1 — 三份 manifest — `node scripts/bump-version.mjs 7.1.1`
- [x] task-2 — `package.json` — `cliVersion` v1.6.0 → v1.7.0
- [x] task-3 — `shadow-docs/INDEX.md` — `index rebuild plan/execute` 登记本载体
- [x] task-4 — 观察点 — `check:version` / `check:requires:strict` / `check:knowledge` / `check:brief` 本地判定

## 结果

评级 S，取证形态 field——四门本地判定 + 可达性实测。发布链端到端待 tag 落地回填。

- 差异面：`git diff --stat` = `.claude-plugin/plugin.json | 2 +-`、`.codex-plugin/plugin.json | 2 +-`、`package.json | 2 ++--`、`shadow-docs/INDEX.md | 1 +`，共 4 文件 5 增 4 删。`skills/**`、`norms/**`、`scripts/**` 未被本载体触碰。
- 三处同源：`npm run check:version` → `✓ 三处 manifest 版本同源: 7.1.1（3 个文件）`；写入由 `node scripts/bump-version.mjs 7.1.1` 一处命令完成（`✓ 版本 bump 完成: 7.1.1`），不手改三份。
- pin 字段：`node -p "j.version+' '+j.cliVersion"` → `7.1.1 v1.7.0`。
- pin 目标可达性（先写错一次，已按实测更正）：本机 `curl -sIL https://github.com/stack-wuh/shadow-dev-cli/releases/download/v1.7.0/…tar.gz` 返回 `HTTP 000`、`exit 43`——本机去掉 `http.proxy` 后直连 github https 下载不通，这是本机网络通路，不是资产缺失。资产本体实测在位且可取：`gh release download v1.7.0 --pattern *.tar.gz` 成功落盘 `shadow-dev-cli-v1.7.0.tar.gz` 49057B；`gh api …/releases/tags/v1.7.0` → `size=49057 uploader=github-actions[bot]`。CI runner 侧的可达性由本仓 `quality-gate` 的 install-cli 步骤实证，checks 未绿前不当作已证。
- 能力面：`npm run check:requires:strict` → `declared=29 skills-referenced=23 undeclared=[] cli-catalog=47 catalog=resolved strict=on missing-in-cli=[]`，尾行 `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`。`sync.plan` / `sync.execute` 键名未变，故 `requiresCommands` 不动是判定结果而非偷懒。
- 知识与台账：`npm run check:knowledge` → `摘要: ok=11 warn=16 fail=0`；`npm run check:brief` → `摘要: briefs=4 ok=2 warn=2 fail=0`；`grep -c 20261013-chore-release-v711 shadow-docs/INDEX.md` = 1（PR #65 曾因台账缺条目被 CI 判红，本次一次到位）。

**未覆盖项（明说）**

- 本机不跑 `npm test`：含 `install-cli` / `pack` / `release-smoke`，依赖 `SHADOW_DEV_BASH` 指向 Git bash，本机口径易错；由本仓 `quality-gate`（6 matrix）承担，checks 未绿前不视为交付完成。
- 发布链端到端（Actions 物化 + 资产）只有在 tag `v7.1.1` 落地后可取证，届时追加到本节。
