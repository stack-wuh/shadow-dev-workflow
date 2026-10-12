---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-chore-cli-pin-v160",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261012-chore-cli-pin-v160",
  "files": [
    "package.json",
    "shadow-docs/changes/20261012-chore-cli-pin-v160/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 61,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/61",
    "pullRequest": 62,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/62"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "53fd228b82afa6fbe5cacf19a6daa6601e19a41b",
    "verifiedAt": "2026-10-12T11:26:28.839Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:62",
    "planHash": "e348c534dbcf1957567741dad215f0984c4cbff8a849569096b1a3b8aa1686b8",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[chore] cliVersion pin v1.5.0 → v1.6.0（对齐 PR 必填门与 --body-file 能力）",
      "titleRaw": "[chore] cliVersion pin v1.5.0 → v1.6.0（对齐 PR 必填门与 --body-file 能力）",
      "supplement": "",
      "body": "## 动机\n插件的 `norms/pr-message.md`（已随 #60 合并）规定了「`release/publish plan` 必须显式传 `--title` 与 `--body`/`--body-file`」，而这两个能力（硬门 `PR_PARAMS_REQUIRED`、`--body-file` 参数）是 shadow-dev-cli 的 `fix(release)` #56 与 `chore(scripts)` 引入、由 **v1.6.0** 首次对外交付。当前产物仍 pin `v1.5.0`，等于规范要求宿主用旧 CLI 去传一个旧 CLI 不认的参数。\n\n## 引用规范\n- `knowledge/distribution-capability-contract.md`\n  - 当前结论: 能力不齐即 `ARTIFACT_INCOMPATIBLE`，判定发生在任何落盘之前；pin 是能力契约不是版本装饰\n  - 适用 scope: `package.json.cliVersion`、`requiresCommands`\n\n## 决策\n- 只 bump pin，不 bump 产物版本：混在一起会让 tag 指向的 tree 与实际发布内容分裂（发版版本权威由 publish 阶段独占）。\n- **合并时序硬约束（非协商）**：本 PR 必须在 shadow-dev-cli 的 `v1.6.0` tag 与 GitHub Release **落地之后**才能合。提前合并会让按 release 轨解析的宿主拿到一个指向不存在版本的 pin。\n- 备选「等下次发版一起 bump」被否：规范已进 main，pin 与规范之间的空窗越长，宿主越容易按新规范传参却撞上旧 CLI 的未知参数。\n\n## 任务\n- [ ] task-1 — `package.json` — `cliVersion` bump 到 v1.6.0，且不动 `requiresCommands` 与三份 manifest 的 `version`\n- [ ] task-2 — 门与观察点 — `check:requires`/`check:version` 绿，pin 与 #60 规范所需能力逐条对照\n\n完整 brief：shadow-docs/changes/20261012-chore-cli-pin-v160/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261012-chore-cli-pin-v160\",\"type\":\"chore\",\"scope\":\"distribution\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261012-chore-cli-pin-v160/brief.md\",\"cliVersion\":\"1.6.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "chore"
      ]
    },
    "release": {
      "files": [
        "package.json",
        "shadow-docs/changes/20261012-chore-cli-pin-v160/brief.md"
      ],
      "message": "chore(distribution): cliVersion pin v1.5.0 → v1.6.0，对齐 PR 必填门与 --body-file 能力",
      "title": "chore(distribution): cliVersion pin v1.5.0 → v1.6.0，对齐 PR 必填门与 --body-file 能力",
      "body": "## 变更\n- `package.json`：`cliVersion` `v1.5.0` → `v1.6.0`。仅此一个字段；`version`（7.0.2）与 `requiresCommands`（29 条）不动。\n\n## 影响\n- 行为/触发面变化：产物声明的最低 CLI 能力抬到 v1.6.0 —— 即 `norms/pr-message.md`（已随 #60 合并）要求的 `release/publish plan` 必填 `--title`/`--body`、以及 `--body-file` 参数，在 v1.6.0 才存在。此前 pin 停在 v1.5.0，等于规范要求宿主用不认这些参数的旧 CLI 去传参。\n- 明确不受影响的范围：`requiresCommands` 判定集不变（本次无新增命令键），能力不齐仍是 `ARTIFACT_INCOMPATIBLE` 在任何落盘之前判红；三份 manifest 的 `version` 不变，发版 bump 属 `shadow-dev-publish` 独占。\n- **合并时序硬约束**：必须在 CLI 的 `v1.6.0` tag 与 GitHub Release 落地之后才能合。实测 `git tag` 当前**尚无 v1.6.0**，所以本 PR 现在不能合。\n- 回滚方式：revert 即把 pin 退回 v1.5.0，无其它副作用。\n\n## 验证\n- 命令与结果：`check:requires` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；`check:version` → `✓ 三处 manifest 版本同源: 7.0.2`（证明没误碰发版版本）。\n- 能力对照（取自 shadow-dev-cli main）：`--body-file` 在命令目录出现 2 次；`PR_PARAMS_REQUIRED` 存在：true；`lib/domains/release.mjs` 调用 `prParams(`：true；CLI `package.json.version = 1.6.0`，与本 pin 目标一致。\n- 时序证据：`git tag` 无 `v1.6.0` → 本 PR 保持 open 待发版，非疏漏。\n- 未覆盖项（明说）：未跑 `workflow plan --release v1.6.0` 验证 release 轨解析（tag 不存在时按设计应 `RELEASE_NOT_FOUND`，要发版后才能验）；最终判定交 Actions 三平台矩阵。\n\n## 关联\n- Closes #61\n- 依赖：CLI tag `v1.6.0`（由 https://github.com/stack-wuh/shadow-dev-cli/pull/61 的 main 承载，待打 tag）\n- brief: shadow-docs/changes/20261012-chore-cli-pin-v160/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": "knowledge/distribution-capability-contract.md",
    "reason": "pin 与能力的对应关系已由该卡承载，本次只是把取值往前推一个 CLI 版本，无新增长期事实"
  }
}
---

# 20261012-chore-cli-pin-v160

## 复杂度评级
- **评级:** S
- **理由:** 单一声明式字段 bump（`package.json.cliVersion`），不改代码与命令面；风险在合并时序而非内容。
- **期望验证深度:** code-read

## 领域模型
- **限界上下文:** `distribution` — 产物与 CLI 的能力契约对齐。上游 `shadow-dev-cli`（新门 `PR_PARAMS_REQUIRED` 与 `--body-file` 自 v1.6.0 起提供）；下游三宿主。
- **被触及既有不变量:** `cliVersion` 随能力变化单独走变更，不与发版 bump 混交（`norms`/`knowledge` 既有约定）。

## 引用规范
- `knowledge/distribution-capability-contract.md`
  - 当前结论: 能力不齐即 `ARTIFACT_INCOMPATIBLE`，判定发生在任何落盘之前；pin 是能力契约不是版本装饰
  - 适用 scope: `package.json.cliVersion`、`requiresCommands`

## 动机

插件的 `norms/pr-message.md`（已随 #60 合并）规定了「`release/publish plan` 必须显式传 `--title` 与 `--body`/`--body-file`」，而这两个能力（硬门 `PR_PARAMS_REQUIRED`、`--body-file` 参数）是 shadow-dev-cli 的 `fix(release)` #56 与 `chore(scripts)` 引入、由 **v1.6.0** 首次对外交付。当前产物仍 pin `v1.5.0`，等于规范要求宿主用旧 CLI 去传一个旧 CLI 不认的参数。

## 覆盖范围

- `package.json`：`cliVersion` `v1.5.0` → `v1.6.0`（仅此一个字段；三份 manifest 的 `version` 不动，那属发版载体）。
- `requiresCommands` 不变：本次没有新增命令键，能力判定集不受影响。

## 决策

- 只 bump pin，不 bump 产物版本：混在一起会让 tag 指向的 tree 与实际发布内容分裂（发版版本权威由 publish 阶段独占）。
- **合并时序硬约束（非协商）**：本 PR 必须在 shadow-dev-cli 的 `v1.6.0` tag 与 GitHub Release **落地之后**才能合。提前合并会让按 release 轨解析的宿主拿到一个指向不存在版本的 pin。
- 备选「等下次发版一起 bump」被否：规范已进 main，pin 与规范之间的空窗越长，宿主越容易按新规范传参却撞上旧 CLI 的未知参数。

## 任务

- [x] task-1 — `package.json` — `cliVersion` bump 到 v1.6.0，且不动 `requiresCommands` 与三份 manifest 的 `version`
- [x] task-2 — 门与观察点 — `check:requires`/`check:version` 绿，pin 与 #60 规范所需能力逐条对照

## 结果

评级 S：声明字段 bump，取证为 pin 与能力的逐条对照 + 门绿。

- pin 落值：`package.json.cliVersion = v1.6.0`；同文件 `version` 仍 7.0.2、`requiresCommands` 仍 29 条未动（`check:requires` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；`check:version` → `✓ 三处 manifest 版本同源: 7.0.2`）。
- 能力对照（取自 shadow-dev-cli 的 main，非发布产物）：`--body-file` 在命令目录出现 2 次；`PR_PARAMS_REQUIRED` 存在于 `lib/input.mjs` 或 `lib/i18n.mjs`：true；`lib/domains/release.mjs` 调用 `prParams(`：true；CLI `package.json.version = 1.6.0`（与本次 pin 目标一致）。
- **时序观察点（红灯留痕）**：`git tag` 实测 尚无 v1.6.0 —— 因此本 PR **现在不能合**，必须等 tag 与 GitHub Release 落地。这条是决策段硬约束的实测依据，不是推测。
- 未覆盖项：未在本机跑 `workflow plan --release v1.6.0` 验证 release 轨解析（tag 不存在时它按设计应报 `RELEASE_NOT_FOUND`，验证要等发版后）；Actions 三平台矩阵为最终判定处。
