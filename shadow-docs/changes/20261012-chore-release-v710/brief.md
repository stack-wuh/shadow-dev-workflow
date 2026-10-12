---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-chore-release-v710",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261012-chore-release-v710",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/changes/20261012-chore-release-v710/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 63,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/63",
    "pullRequest": 64,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/64"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "53fd228b82afa6fbe5cacf19a6daa6601e19a41b",
    "verifiedAt": "2026-10-12T11:32:25.595Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:64",
    "planHash": "6a3ddab047d29086a415dd69da1f3629fd0cf0769bba198ae76cd40fe6f7c040",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[chore] 发版载体 v7.1.0：交付 norms 结构真源与调用面对齐",
      "titleRaw": "[chore] 发版载体 v7.1.0：交付 norms 结构真源与调用面对齐",
      "supplement": "",
      "body": "## 动机\n`#60` 已把 PR/commit message 的结构真源（`norms/pr-message.md` + `norms/templates/pr-body.md`）与三处技能的调用面对齐合进 main，但已发布的 7.0.2 产物里没有它们——按 release 轨安装的宿主拿不到这份规范。需要一个发版载体把 main 的内容对外交付。\n\n## 引用规范\n- `knowledge/release-artifact-pipeline.md`\n  - 当前结论: tag 必须指向已含 bump 的 main；资产名写错等于没发布；冒烟须见 `OK materialized root=… skills=<N>`\n  - 适用 scope: bump、tag、Release、发布链审查\n\n## 决策\n- **bump 位取 minor → 7.1.0**：新增规范文件与技能指令文本、不改命令面与既有契约语义。**这一位由我推定，按 `shadow-dev-publish` SKILL §1.3 属「版本号商定」项，待你否决**；若要 patch（7.0.3）我改一次 bump 重跑门即可。\n- 只 bump 三份 manifest，不动 `cliVersion`（pin 属 #62 独占）。\n- tag 与 GitHub Release 由你执行（本 CLI 无发版命令键，SKILL §5 的委托清单），本载体只把 bump 落进 main。\n\n## 任务\n- [ ] task-1 — `package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json` — 三处同源 bump 到 7.1.0，`cliVersion` 不动\n- [ ] task-2 — 门 — `check:version` + `check:requires` + `check:knowledge` + `check:brief` 全绿，`npm test` 结论与残留项如实记录\n\n完整 brief：shadow-docs/changes/20261012-chore-release-v710/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261012-chore-release-v710\",\"type\":\"chore\",\"scope\":\"distribution\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261012-chore-release-v710/brief.md\",\"cliVersion\":\"1.6.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "chore"
      ]
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-chore-release-v710/brief.md"
      ],
      "message": "chore(release): v7.1.0 三份 manifest 同源 bump（交付 norms 结构真源）",
      "title": "chore(release): v7.1.0 三份 manifest 同源 bump（交付 norms 结构真源）",
      "body": "## 变更\n- `package.json` / `.claude-plugin/plugin.json` / `.codex-plugin/plugin.json`：版本 7.0.2 → 7.1.0（`node scripts/bump-version.mjs 7.1.0` 一次同步，`cliVersion` 保持 v1.5.0 未动）。\n- `shadow-docs/INDEX.md`：`index rebuild` 登记本载体台账条目。\n- 载体 brief：动机、覆盖范围、决策与结果段。\n\n## 影响\n- 行为/触发面变化：对外交付 `#60` 合入的 PR/commit message 结构真源（`norms/pr-message.md` + `norms/templates/pr-body.md`）与三处技能调用面对齐——此前这些只存在于 main，按 release 轨安装的宿主拿不到。\n- 明确不受影响的范围：`requiresCommands` 集合不变（29 条，无新增命令键）；`cliVersion` pin 不变（属 https://github.com/stack-wuh/shadow-dev-workflow/pull/62 独占）；命令面、hooks、adapters、pack 清单目录均未动，`norms/templates/` 由 `pack.mjs` 既有 `norms` 目录递归收录，不需改打包。\n- 时序：tag 必须在 #62 与本 PR 都合入 main 之后再打；若 #62 未在打 tag 前合入，其 pin 落到下一版，本载体不谎称已含。\n- 回滚方式：revert 本 PR 即把三份 manifest 退回 7.0.2；tag 未打则无外部产物受影响。\n\n## 验证\n- 命令与结果：`check:version` → `✓ 三处 manifest 版本同源: 7.1.0（3 个文件）`；`check:requires` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；`check:knowledge` → `fail=0`；`check:brief` → `fail=0`（2 条 warn 为门生效前的 GRANDFATHERED 在途 brief，非本次引入）。\n- 套件：`npm test` → **30 用例 30 绿 0 红**。设 `SHADOW_DEV_BASH` 指向 Git Bash 后，此前本机两挂的 `install-cli.test.mjs` / `pack.test.mjs` 真实参与执行并通过；不带该变量时它们因 PATH 上 `bash` 命中 System32/WindowsApps 的 WSL 入口桩而判「可信 bash 未找到」——`scripts/resolve-bash.mjs` 的注释已记录同一现象，非本 change 回归。\n- 差异面：`git diff --stat` 仅三份 manifest 的版本行 + 载体 brief + INDEX 登记行，无其它文件。\n- 未覆盖项（明说）：tag 与 GitHub Release 不在本 PR 内（本 CLI 无发版命令键，按 `shadow-dev-publish` SKILL §5 委托用户执行）；资产名契约断言与隔离 prefix 发布冒烟只能在 Actions 上判定，交付结论需等 run 链接与 `OK materialized root=… skills=9` 回传后回填 brief。\n\n## 关联\n- Closes #63\n- 前置：https://github.com/stack-wuh/shadow-dev-workflow/pull/60（已合并，本次交付内容）；https://github.com/stack-wuh/shadow-dev-workflow/pull/62（pin，待 CLI tag v1.6.0 后合）\n- brief: shadow-docs/changes/20261012-chore-release-v710/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": "knowledge/release-artifact-pipeline.md",
    "reason": "常规发版载体，资产名契约与冒烟语义未变；pin 与发版分离的既有约定已在卡内"
  }
}
---

# 20261012-chore-release-v710

## 复杂度评级
- **评级:** S
- **理由:** 纯声明式版本 bump（三份 manifest 同源），不改内容语义；真实风险在发版时序与产物契约，由发布链与冒烟判定。
- **期望验证深度:** code-read

## 领域模型
- **限界上下文:** `distribution` — 版本权威与产物分发。上游：已合并的 `#60`（norms 真源）与在途 `#62`（cliVersion pin）；下游：三宿主与 release 轨。
- **被触及既有不变量:** 版本权威＝tag（先合并后打 tag）；三份 manifest 同源由 `check:version` 判定；资产名契约 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`。

## 引用规范
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: tag 必须指向已含 bump 的 main；资产名写错等于没发布；冒烟须见 `OK materialized root=… skills=<N>`
  - 适用 scope: bump、tag、Release、发布链审查

## 动机

`#60` 已把 PR/commit message 的结构真源（`norms/pr-message.md` + `norms/templates/pr-body.md`）与三处技能的调用面对齐合进 main，但已发布的 7.0.2 产物里没有它们——按 release 轨安装的宿主拿不到这份规范。需要一个发版载体把 main 的内容对外交付。

## 覆盖范围

- 本次交付的**已合并** change：`20261012-docs-pr-message-norms`（PR #60）。
- **在途、待并入**：`20261012-chore-cli-pin-v160`（PR #62，本身要等 CLI tag v1.6.0 才能合）。规则：若 #62 在打本 tag 之前合入，则一并进 7.1.0；否则留给下一版，不在本载体里谎称已含。
- 跳过项：main 上纯 `shadow-docs/` 的归档提交（无对外内容变更）。

## 决策

- **bump 位取 minor → 7.1.0**：新增规范文件与技能指令文本、不改命令面与既有契约语义。**这一位由我推定，按 `shadow-dev-publish` SKILL §1.3 属「版本号商定」项，待你否决**；若要 patch（7.0.3）我改一次 bump 重跑门即可。
- 只 bump 三份 manifest，不动 `cliVersion`（pin 属 #62 独占）。
- tag 与 GitHub Release 由你执行（本 CLI 无发版命令键，SKILL §5 的委托清单），本载体只把 bump 落进 main。

## 任务

- [x] task-1 — `package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json` — 三处同源 bump 到 7.1.0，`cliVersion` 不动
- [x] task-2 — 门 — `check:version` + `check:requires` + `check:knowledge` + `check:brief` 全绿，`npm test` 结论与残留项如实记录

## 结果

评级 S。取证为版本同源、四门、套件与 bump 差异面。

- bump 差异：`git diff --stat` 仅 `package.json` / `.claude-plugin/plugin.json` / `.codex-plugin/plugin.json` 三处版本行 + 载体 brief + `shadow-docs/INDEX.md` 登记行；`cliVersion` 保持 v1.5.0 未动（pin 属 #62 独占，`grep cliVersion package.json` 实证）。
- `check:version` → `✓ 三处 manifest 版本同源: 7.1.0（3 个文件）`。
- `check:requires` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`（declared=29 / referenced=23 / missing-in-cli=0）。
- `check:knowledge` → `ok=11 warn=16 fail=0`；`check:brief` → `briefs=4 ok=2 warn=2 fail=0`（2 条 warn 是门生效前的 GRANDFATHERED 在途 brief，非本 change 引入）。
- `npm test` → **30 用例 30 绿 0 红**（`duration_ms 12846`）。设 `SHADOW_DEV_BASH` 指向 Git Bash 后，此前两挂的 `install-cli.test.mjs` 与 `pack.test.mjs` 真实参与执行并通过；不带该变量时它们因 PATH 上的 WSL 入口桩判「可信 bash 未找到」。
- **本机环境留痕（非代码结论）**：`scripts/resolve-bash.mjs` 在本机解析到的可信 bash 为 `C:\Program Files\Git\bin\bash.exe`（source=`env:SHADOW_DEV_BASH`）。不带该变量时，仓库自带解析器会因 PATH 上的 `bash` 命中 System32/WindowsApps 的 WSL 入口桩而判「可信 bash 未找到」——这正是该脚本注释里记录的既有一类现象，不是本 change 的回归。
- 未覆盖项：tag 与 GitHub Release 由用户执行（本 CLI 无发版命令键，SKILL §5 委托清单）；发布链的资产名契约断言与隔离 prefix 冒烟只能在 Actions 上看，交付结论等 run 链接与 `OK materialized root=… skills=9` 回传后回填。
