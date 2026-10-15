---
{
  "schema": "shadow-dev/v1",
  "name": "20261015-chore-release-v7.2.0",
  "type": "chore",
  "scope": "distribution",
  "status": "archived",
  "baseBranch": "main",
  "branch": "chore/20261015-chore-release-v7.2.0",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261015-chore-release-v7.2.0/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 69,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/69"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "fe9cd401ae8a89967b0801aa17b534b369f93873",
    "verifiedAt": "2026-10-15T07:16:02.441Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:69",
    "planHash": "48e507dab41a1660355c12da0c4116c0f4faea8d16ed0e4dd75f113984d2cc12",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261015-chore-release-v7.2.0/brief.md"
      ],
      "message": "chore(release): v7.2.0 版本号三处同源 bump 与宿主清单表述同步",
      "title": "chore(release): v7.2.0 版本号三处同源 bump 与宿主清单表述同步",
      "body": "## 变更\n- `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`：`version` 7.1.1 → 7.2.0（由 `node scripts/bump-version.mjs 7.2.0` 一处命令写入三处，不手改）。\n- `.codex-plugin/plugin.json`：`interface.longDescription` 增补「实现计划执行调度（波次并行、分级审查）与 Bug 根因调查技能」，与 README/CLAUDE.md 技能清单同源。\n- `shadow-docs/INDEX.md`：登记本发版载体；载体 brief 自身。\n\n## 影响\n- 行为/触发面变化：安装轨将拿到含 `shadow-dev-tdd` 与 `shadow-dev-debug` 两个新技能的 7.2.0 产物；对外技能清单表述与 README/CLAUDE.md 一致。\n- 明确不受影响的范围：`skills/**`、`norms/**`、`rules/**`、`scripts/**` 未触碰；`requiresCommands` 与 `cliVersion`（v1.7.0）不动——无能力面变化。\n- 回滚方式：revert 本 PR 即回落 7.1.1；tag 尚未打，无产物副作用。\n\n## 验证\n- `node scripts/bump-version.mjs 7.2.0` → `✓ 版本 bump 完成: 7.2.0`；`npm run check:version` → `✓ 三处 manifest 版本同源: 7.2.0（3 个文件）`。\n- `npm run ci` exit 0：`check:requires:strict` ✓、`check:knowledge` `ok=11 warn=16 fail=0`、`check:brief` `briefs=4 ok=2 warn=2 fail=0`、`check:smoke` `checks=4 fail=0 deferred=1`、`npm test` `tests 30 / pass 30 / fail 0`。\n- 差异面：4 文件 5 增 4 删（三份 manifest + INDEX，另载体 brief 自身）。\n- 未覆盖项（明说）：发布链端到端（tag → `publish-release` Actions → 资产名契约断言 → 隔离 prefix 冒烟）须待 tag `v7.2.0` 落地后取证回填；tag 与 Release 按能力契约委托用户执行。\n\n## 关联\n- Refs #68（本次覆盖的已合并变更）\n- brief: shadow-docs/changes/20261015-chore-release-v7.2.0/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "声明式发版载体（bump + 表述同步），无新增跨项目结论；发布链结果已按实回填"
  }
}
---

# 20261015-chore-release-v7.2.0

## 动机

对外交付本轮技能族增量：`shadow-dev-tdd`（实现计划执行调度）与 `shadow-dev-debug`（Bug 根因调查）已随 PR #68 合并进 main 并归档，需要经正式发版随产物分发；同时把宿主清单的对外表述与 README/CLAUDE.md 同步，避免对外描述与产物能力不一致。

## 复杂度评级

- **评级:** S
- **理由:** 纯声明式发版载体——三份 manifest 版本 bump + 一处宿主清单表述同步。零 SKILL 正文、零脚本、零命令面改动，`requiresCommands` 与 `cliVersion` 不动。
- **期望验证深度:** field——四门本地判定；发布链端到端在 tag 落地后回填。

## 覆盖范围

- **覆盖的已合并 change：** `20261015-feature-tdd-debug-skills`（PR #68，已合并、已归档）——两个新技能与文档增量随本版本对外交付。
- **跳过与理由：** `20261012-fix-smoke-failure-as-fixture` 已包含在 v7.1.1（实测判定：PR #55 mergeCommit `e383212` 是 tag v7.1.1 的祖先）；`20261010-build-quality-gate`、`20261010-refactor-domain-driven-workflow` 均无 PR、未合并，不在交付面。
- **载体自身文件：** `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、`shadow-docs/INDEX.md`、载体 brief。

## 决策

- **minor 位 7.2.0（用户 2026-10-15 裁定）：** 新增两个技能属向后兼容的功能增量。
- **宿主清单只改一处表述：** `.codex-plugin/plugin.json` 的 `interface.longDescription` 是枚举式对外技能清单，增补两个新技能；`.claude-plugin/plugin.json` 的 `description` 为泛化表述（不枚举技能），未变即同源，不需要改。
- **不动 `cliVersion`：** pin v1.7.0 属能力契约，本发版无能力变化，不与 bump 混在一起。
- **台账一次到位：** 先 `index rebuild` 登记本载体并把 `shadow-docs/INDEX.md` 纳入 `release --files`，避免 PR 阶段「台账缺条目」判红（20261015 实证）。
- **tag 指向含 bump 的 main：** 先合并后打 tag；发版动作（tag + Release）按能力契约委托用户执行。

## 任务

- [x] task-1 — `package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json` — `node scripts/bump-version.mjs 7.2.0` 三处同源
- [x] task-2 — `.codex-plugin/plugin.json` — `interface.longDescription` 增补两个新技能表述
- [x] task-3 — `shadow-docs/INDEX.md` — `index rebuild` 登记本载体
- [x] task-4 — 观察点 — `check:version` + 四门本地判定

## 结果

评级 S，取证形态 field——四门本地判定 + 三处同源；发布链端到端待 tag 落地回填。

- 三处同源：`npm run check:version` → `✓ 三处 manifest 版本同源: 7.2.0（3 个文件）`；写入由 `node scripts/bump-version.mjs 7.2.0` 一处命令完成（`✓ 版本 bump 完成: 7.2.0`），不手改三份。
- 对外表述同源：`.codex-plugin/plugin.json` 的 `interface.longDescription` 增补「实现计划执行调度（波次并行、分级审查）与 Bug 根因调查技能」，与 README/CLAUDE.md 技能清单一致（`hotfix 快车道` 计数 = 1，无重复行）；`.claude-plugin/plugin.json` 为泛化表述不枚举技能，未变即同源。
- 门禁：`npm run ci` exit 0——`check:version` ✓ 7.2.0 同源、`check:requires:strict` `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`、`check:knowledge` `ok=11 warn=16 fail=0`、`check:brief` `briefs=4 ok=2 warn=2 fail=0`、`check:smoke` `checks=4 fail=0 deferred=1`、`npm test` `tests 30 / pass 30 / fail 0`。
- 台账一次到位：`index rebuild plan/execute` 登记本载体，`shadow-docs/INDEX.md` 已纳入 release 文件集（规避 PR 阶段「台账缺条目」判红）。
- 差异面：`git diff --stat` = `.claude-plugin/plugin.json | 2 +-`、`.codex-plugin/plugin.json | 4 ++--`、`package.json | 2 +-`、`shadow-docs/INDEX.md | 1 +`，共 4 文件 5 增 4 删；`skills/**`、`norms/**`、`scripts/**` 未被本载体触碰。

**发布链端到端（回填）**

- 版本权威：`✓ 版本权威成立：v7.2.0`（tag 去 `v` == `package.json.version`），`check:version` 在发布链内复跑通过。
- 资产契约：`shadow-dev-workflow-v7.2.0.tar.gz` · 129119B · `uploader=github-actions[bot] state=uploaded`（`gh api …/releases/tags/v7.2.0` 实取），资产名匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`。
- 隔离 prefix 冒烟（run `38697454104`，success · 13s）：`OK plan version=7.2.0 missing=null` → `OK execute version=7.2.0` → `OK materialized root=… skills=11`（与 `skills/` 目录数一致：9 旧 + 2 新）→ `OK bind plan host-version=7.2.0`。
- Release：https://github.com/stack-wuh/shadow-dev-workflow/releases/tag/v7.2.0
- 执行注记：tag 与 Release 按用户明确指示由 AI 代跑委托清单命令（能力缺口已在「决策」与本节如实登记，非静默降级；待 execution-layer 提供发版命令键后替换为 CLI 调用）。
