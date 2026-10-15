---
{
  "schema": "shadow-dev/v1",
  "name": "20261015-chore-release-v7.2.1",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261015-chore-release-v7.2.1",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261015-chore-release-v7.2.1/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 72,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/72"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "8ca6b7f0e213f90fc587db7b15b6954336a9314f",
    "verifiedAt": "2026-10-15T07:57:39.950Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:72",
    "planHash": "800ad6d99921f33825969237ce0ba4697b95696143c16e2b59cb651fbbc5ad34",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261015-chore-release-v7.2.1/brief.md"
      ],
      "message": "chore(release): v7.2.1 版本号三处同源 bump",
      "title": "chore(release): v7.2.1 版本号三处同源 bump",
      "body": "## 变更\n- `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`：`version` 7.2.0 → 7.2.1（由 `node scripts/bump-version.mjs 7.2.1` 一处命令写入三处，不手改）。\n- `shadow-docs/INDEX.md`：登记本发版载体；载体 brief 自身。\n\n## 影响\n- 行为/触发面变化：安装轨将拿到含 node 形态 SessionStart 自举入口与本机插件自同步的 7.2.1 产物（内容由 PR #71 承载并已合并）。\n- 明确不受影响的范围：`skills/**`、`norms/**`、`rules/**`、`hooks/**`、`scripts/**` 未被本载体触碰；`requiresCommands` 与 `cliVersion`（v1.7.0）不动。\n- 回滚方式：revert 本 PR 即回落 7.2.0；tag 尚未打，无产物副作用。\n\n## 验证\n- `node scripts/bump-version.mjs 7.2.1` → `✓ 版本 bump 完成: 7.2.1`；`npm run check:version` → `✓ 三处 manifest 版本同源: 7.2.1（3 个文件）`。\n- `npm run ci` exit 0：`check:requires:strict` ✓、`check:knowledge` `ok=11 warn=16 fail=0`、`check:brief` `briefs=5 ok=3 warn=2 fail=0`、`check:smoke` `checks=4 fail=0 deferred=1`、`npm test` `tests 35 / pass 35 / fail 0`。\n- 差异面：4 文件 5 增 4 删（三份 manifest + INDEX，另载体 brief 自身）。\n- 未覆盖项（明说）：发布链端到端（tag → `publish-release` Actions → 资产名契约断言 → 隔离 prefix 冒烟）须待 tag `v7.2.1` 落地后取证回填。\n\n## 关联\n- Refs #71（本次覆盖的已合并变更）\n- brief: shadow-docs/changes/20261015-chore-release-v7.2.1/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "声明式发版载体（bump），无新增跨项目结论"
  }
}
---

# 20261015-chore-release-v7.2.1

## 动机

对外交付本机自举修复与插件自同步：SessionStart 入口 node 化（修复 ZCode 直 spawn 宿主上裸 `bash` 命中 WSL 入口桩导致的 hook 恒失败）与目录型 marketplace 的本机安装自同步已随 PR #71 合并进 main，需要经正式发版随产物分发——此后宿主重启，本机安装自动同步到新版本。

## 复杂度评级
- **评级:** S
- **理由:** 纯声明式发版载体——三份 manifest 版本 bump。零 SKILL 正文、零脚本改动（由 PR #71 承载），`requiresCommands` 与 `cliVersion` 不动。
- **期望验证深度:** field——四门本地判定 + 三处同源；发布链端到端在 tag 落地后回填。

## 覆盖范围
- **覆盖的已合并 change：** `20261015-feature-plugin-self-sync`（PR #71，已合并、待归档）——node 形态自举入口与本机插件自同步随本版本对外交付。
- **跳过与理由：** 自 v7.2.0（`fe9cd40`）以来 main 仅合入 PR #71，无其它未交付内容变更；休眠 change 无 PR 未合并，不在交付面。
- **载体自身文件：** `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、`shadow-docs/INDEX.md`、载体 brief。

## 决策
- **patch 位 7.2.1（用户 2026-10-15 裁定）：** 以修复宿主自举失败为主体；自同步作为自举入口的补齐动作随行，不单独占 minor 位。
- **宿主清单表述不动：** hook 装配与自同步属分发机制，流程描述（interface.longDescription）描述的是五段式管线与技能面，无需同步。
- **不动 `cliVersion`：** pin v1.7.0 属能力契约，本发版无能力变化。
- **台账一次到位：** 先 `index rebuild` 登记本载体并把 `shadow-docs/INDEX.md` 纳入 release 文件集。
- **tag 指向含 bump 的 main：** 先合并后打 tag；tag 与 Release 的委托清单按既有先例执行并在载体 brief 留痕。

## 任务
- [x] task-1 — `package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json` — `node scripts/bump-version.mjs 7.2.1` 三处同源
- [x] task-2 — `shadow-docs/INDEX.md` — `index rebuild` 登记本载体
- [x] task-3 — 观察点 — `check:version` + 四门本地判定
- [x] task-4 — 发布链回填 — tag / run / Release URL / 隔离冒烟

## 结果

评级 S，取证形态 field——四门本地判定 + 三处同源；发布链端到端待 tag 落地回填。

- 三处同源：`node scripts/bump-version.mjs 7.2.1` → `✓ 版本 bump 完成: 7.2.1`；`npm run check:version` → `✓ 三处 manifest 版本同源: 7.2.1（3 个文件）`。
- 门禁：`npm run ci` exit 0——`check:version` 7.2.1 同源、`check:requires:strict` ✓、`check:knowledge` `ok=11 warn=16 fail=0`、`check:brief` `briefs=5 ok=3 warn=2 fail=0`、`check:smoke` `checks=4 fail=0 deferred=1`、`npm test` `tests 35 / pass 35 / fail 0`。
- 台账一次到位：`index rebuild` 登记本载体，`shadow-docs/INDEX.md` 已纳入 release 文件集。
- 差异面：`git diff --stat` = `.claude-plugin/plugin.json | 2 +-`、`.codex-plugin/plugin.json | 2 +-`、`package.json | 2 +-`、`shadow-docs/INDEX.md | 3 ++-`，共 4 文件 5 增 4 删；`skills/**`、`hooks/**`、`scripts/**` 未被本载体触碰。

**未覆盖项（明说）**

- 发布链端到端（tag `v7.2.1` → `publish-release` Actions → 资产名契约断言 → 隔离 prefix 冒烟）在 tag 落地后回填本节。
