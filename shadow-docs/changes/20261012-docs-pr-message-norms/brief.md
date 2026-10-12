---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-docs-pr-message-norms",
  "type": "docs",
  "scope": "workflow-governance",
  "status": "published",
  "baseBranch": "main",
  "branch": "docs/20261012-docs-pr-message-norms",
  "files": [
    "CLAUDE.md",
    "docs/cli-guide.md",
    "norms/pr-message.md",
    "norms/templates/pr-body.md",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-docs-pr-message-norms/brief.md",
    "skills/shadow-dev-hotfix/SKILL.md",
    "skills/shadow-dev-publish/SKILL.md",
    "skills/shadow-dev-release/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 59,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/59",
    "pullRequest": 60,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/60"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "8db66b2389965e7ec753a86c15489fb3853e19ef",
    "verifiedAt": "2026-10-12T10:16:37.501Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:60",
    "planHash": "9c87904551cf8bd352ea09436a7a2d145614afec65ec065c5499bd615c268d8e",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[docs] PR/commit message 结构规范进 norms 真源，并对齐 release/publish/hotfix 三处调用面",
      "titleRaw": "[docs] PR/commit message 结构规范进 norms 真源，并对齐 release/publish/hotfix 三处调用面",
      "supplement": "",
      "body": "## 动机\nAI 写出的 PR 标题与正文格式长期漂移：同一仓库并存 `[feature] …`、`chore(ci): …` 与裸分支名三种标题；正文要么空、要么只有 `Closes #N` 一行；还自发追加 `Co-authored-by` 署名尾注（该约定在仓库规则、CLI、git 配置里都不存在）。用户 2026-10-12 定稿结构规范，并要求按渐进式落地：规范本体按需加载（`norms/`，不进全局 `rules/`），模板文件住专门目录，宿主模板由真源生成。\n\n## 引用规范\n- `rules/iron-laws.md`\n  - 当前结论: 渐进式加载与验证强度按评级匹配；全局 `rules/` 不塞单项规范\n  - 适用 scope: `norms/`、`skills/`、`scripts/`\n- `norms/verification.md`\n  - 当前结论: M 级 = 冒烟 + 被触及不变量各一个观察点 + 走查\n  - 适用 scope: 本 change 的「结果」段取证\n\n## 决策\n- **选型:** 规范进 `norms/` 而非 `rules/`；模板独立成文件而非嵌在规则文档的围栏块里；调用示例与 CLI 新门同波次改。\n- **对比方案:** ①放 `rules/pr-message.md`（否——用户明确要渐进式，`rules/` 是每轮注入的全局集）；②放 `skills/shadow-dev-release/references/`（否——`bind` 的 `dirHash` 对 skill 子目录抛 `EISDIR`，实测复现）；③在本仓复制一份生成脚本（否——脚本任务归 shadow-dev-cli，插件只出规范与模板）；④把存量 INDEX 红灯留给别的 change（否——`check:knowledge` 是发版四门之一，不修则本 PR 无法绿，且同属 `docs` 类型不算混交）。\n- **明确不做:** `cliVersion` pin 不在本 change 动。`--body-file` 与必填门是新能力，必须等 CLI 侧 v1.6.0 的 tag 与 Release 落地后再走独立 pin bump；提前 bump 会让 `workflow plan` 解析到不存在的 release。\n\n## 任务\n- [ ] task-1 — `norms/pr-message.md,norms/templates/pr-body.md` — 规范与模板落盘（四段全必需、scope 定表、禁署名、可追溯 issue）\n- [ ] task-2 — `skills/shadow-dev-release/SKILL.md,skills/shadow-dev-hotfix/SKILL.md,skills/shadow-dev-publish/SKILL.md,docs/cli-guide.md,CLAUDE.md` — 按需指针与三处调用面对齐新门\n- [ ] task-3 — `shadow-docs/INDEX.md` — 存量台账红灯由 index rebuild 消解\n- [ ] task-4 — 观察点取证 — 发版四门绿 + 宿主模板 `--check` 与真源一致 + 全仓再无缺 `--body` 的 plan 示例\n\n完整 brief：shadow-docs/changes/20261012-docs-pr-message-norms/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261012-docs-pr-message-norms\",\"type\":\"docs\",\"scope\":\"workflow-governance\",\"status\":\"branched\",\"branch\":\"docs/20261012-docs-pr-message-norms\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261012-docs-pr-message-norms/brief.md\",\"cliVersion\":\"1.6.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "docs"
      ]
    },
    "release": {
      "files": [
        "CLAUDE.md",
        "docs/cli-guide.md",
        "norms/pr-message.md",
        "norms/templates/pr-body.md",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-docs-pr-message-norms/brief.md",
        "skills/shadow-dev-hotfix/SKILL.md",
        "skills/shadow-dev-publish/SKILL.md",
        "skills/shadow-dev-release/SKILL.md"
      ],
      "message": "docs(norms): PR/commit message 结构真源进 norms，并对齐 release/publish/hotfix 三处调用面",
      "title": "docs(norms): PR/commit message 结构真源进 norms，并对齐 release/publish/hotfix 三处调用面",
      "body": "## 变更\n- `norms/pr-message.md`（新增）：PR/commit message 结构真源——conventional 标题、8 项 scope 定表（`deploy` 判为动作非落点已剔除）、正文四段且任何 type 不得裁剪、必须可追溯 issue、禁止署名尾注、禁止换行切断 token，并写明 CLI 侧 `PR_PARAMS_REQUIRED` / `BODY_PARAM_CONFLICT` 两个硬门。\n- `norms/templates/pr-body.md`（新增）：模板本体，纯模板不含规则文字；宿主 `.github/PULL_REQUEST_TEMPLATE.md` 由它逐字生成。\n- `skills/shadow-dev-release/SKILL.md`：第 2 步加按需指针，`--message`/`--title`/`--body` 改为显式必填。\n- `skills/shadow-dev-hotfix/SKILL.md`、`skills/shadow-dev-publish/SKILL.md`、`docs/cli-guide.md`：三处调用示例与参数表补 `--title`/`--body-file`，与 CLI 新门同源。\n- `CLAUDE.md`：规范索引行补 PR message 结构的可见性。\n- `shadow-docs/INDEX.md`：`index rebuild` 重建，消解 main 上既有的 5 条台账红灯。\n\n## 影响\n- 行为/触发面变化：写 PR 时结构由 `rules/` 的全局注入改为 `SKILL.md → norms/pr-message.md` 的按需加载；技能里的示例命令必须带正文参数，否则在新 CLI 上被 plan 拒。\n- 明确不受影响的范围：零代码改动，不动 `scripts/` 门的判定集；`requiresCommands` 集合与 `cliVersion` pin 不变（v1.5.0）；`rules/behavior.md`、`rules/iron-laws.md` 未增删；产物清单 `pack.mjs` 的 DIRS 已含 `norms`，新目录 `norms/templates/` 随产物分发，无需改打包。\n- 存量修复面：本 PR 后 `check:knowledge` 从 main 的 fail=5 变 fail=0——门此前就是红的，与本 change 无因果但同属 docs 类型，一并修。\n- 回滚方式：revert 本 PR 即回退规范文件、示例与 INDEX；无跨仓副作用（宿主模板由本仓真源生成，revert 后重跑生成链即回到旧结构）。\n\n## 验证\n- 调用面同源：全仓扫描 `release plan`/`publish plan` 示例行，除 `docs/cli-guide.md:166` 外均带正文参数，核对该行是跨行命令起始行（`--body-file` 在 `:168`），属按行扫描误报。\n- 生成链：`--check` 用 PR #58 分支的 `gen-pr-template.mjs` 原文执行 → `ok: … 与 norms/templates/pr-body.md 一致`，脚本未在插件仓留副本。\n- 死链归零：改写路径式引用后 `check:knowledge` → `ok=11 warn=15 fail=0`，原先「引用尚未落盘的 gen-pr-template.mjs」warn 已消失。\n- 门槛：`check:requires` ✓、`check:brief` 4 份全绿、`check:version` 三处同源 7.0.2。\n- 未覆盖项（明说）：`npm test` 与 `check:smoke` 未在本机跑——发布冒烟需真实 release 轨，且本机 `bash` 命中 WSL 占位程序（同一缺陷已在 CLI 侧实测）；判定交给 Actions 三平台矩阵。另 `cliVersion` pin 仍 v1.5.0，待 CLI v1.6.0 打 tag 后另走独立 change。\n\n## 关联\n- Closes #59\n- brief: shadow-docs/changes/20261012-docs-pr-message-norms/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": "knowledge/multi-host-plugin-distribution.md",
    "reason": "结构规范即真源文档本身，卡片不重复散文；bind 遇 skill 子目录抛 EISDIR 这条约束已写进 norms/pr-message.md 的落位约束条目，暂不另建卡"
  }
}
---
# 20261012-docs-pr-message-norms

## 复杂度评级
- **评级:** M
- **理由:** ①只改规范与技能的指令文本，不改任何执行代码或门判定集；②触及面跨 3 个技能 + 2 个 norms 文件 + 1 份文档 + 台账重建，属可发现性中等的规范性变更；③新建的是宿主模板，不是套件断言文件，故不升 L。
- **期望验证深度:** code-read

## 领域模型

- **限界上下文:** `workflow-governance` — 变更治理、规范真源与宿主模板的分发一致性。上游 `rules/iron-laws.md` 的渐进式加载约定；下游为宿主仓的 `.github/PULL_REQUEST_TEMPLATE.md`。反腐边界：不改 CLI 命令面、不改 `rules/` 全局注入集。
- **统一语言增量:**
  - **结构真源**：PR/commit message 的格式权威只有一处，即 `norms/pr-message.md`；宿主模板是它的生成物，手改即被生成链判红。
  - **按需加载位**：规范放 `norms/`（SKILL.md 指向它）而不是 `rules/`（每轮注入）。
- **被触及既有不变量:**
  - 三处 `release plan` 调用示例必须与 CLI 的 `PR_PARAMS_REQUIRED` 硬门同源（hotfix / publish / release 三个技能）。
  - `check-knowledge` 的引用扫描不得出现指向本仓不存在路径的死链。

## 引用规范
- `rules/iron-laws.md`
  - 当前结论: 渐进式加载与验证强度按评级匹配；全局 `rules/` 不塞单项规范
  - 适用 scope: `norms/`、`skills/`、`scripts/`
- `norms/verification.md`
  - 当前结论: M 级 = 冒烟 + 被触及不变量各一个观察点 + 走查
  - 适用 scope: 本 change 的「结果」段取证

## 动机

AI 写出的 PR 标题与正文格式长期漂移：同一仓库并存 `[feature] …`、`chore(ci): …` 与裸分支名三种标题；正文要么空、要么只有 `Closes #N` 一行；还自发追加 `Co-authored-by` 署名尾注（该约定在仓库规则、CLI、git 配置里都不存在）。用户 2026-10-12 定稿结构规范，并要求按渐进式落地：规范本体按需加载（`norms/`，不进全局 `rules/`），模板文件住专门目录，宿主模板由真源生成。

## 覆盖范围

- `norms/pr-message.md`（新增）：结构真源。conventional 标题 + 8 项 scope 定表（`deploy` 判为动作不是落点，已剔除）、正文固定四段且**任何 type 都不得裁剪**、必须可追溯到一个 issue、禁止署名尾注、禁止换行切断 token，并写明 CLI 侧 `PR_PARAMS_REQUIRED` / `BODY_PARAM_CONFLICT` 两个硬门。
- `norms/templates/pr-body.md`（新增）：模板本体，纯模板不含规则文字；宿主 `.github/PULL_REQUEST_TEMPLATE.md` 由它逐字生成。
- `skills/shadow-dev-release/SKILL.md`：第 2 步加按需指针，并把 `--message`/`--title`/`--body` 改为显式必填。
- `skills/shadow-dev-hotfix/SKILL.md`、`skills/shadow-dev-publish/SKILL.md`：两处 `release plan` 示例补 `--title`/`--body-file`，与新门同源。
- `docs/cli-guide.md`：`release plan`/`publish plan` 参数表与端到端示例补必填说明与 `--body-file`。
- `CLAUDE.md`：规范索引行补上 PR message 结构的可见性。
- `shadow-docs/INDEX.md`：**存量红灯修复**——main 上 `check:knowledge` 本就有 5 条 fail（v7.0.0/v7.0.1 台账行仍是 published 且路径未含 archive、v7.0.2 为幽灵条目），由 `shadow-dev index rebuild` 重建消解。

## 决策

- **选型:** 规范进 `norms/` 而非 `rules/`；模板独立成文件而非嵌在规则文档的围栏块里；调用示例与 CLI 新门同波次改。
- **对比方案:** ①放 `rules/pr-message.md`（否——用户明确要渐进式，`rules/` 是每轮注入的全局集）；②放 `skills/shadow-dev-release/references/`（否——`bind` 的 `dirHash` 对 skill 子目录抛 `EISDIR`，实测复现）；③在本仓复制一份生成脚本（否——脚本任务归 shadow-dev-cli，插件只出规范与模板）；④把存量 INDEX 红灯留给别的 change（否——`check:knowledge` 是发版四门之一，不修则本 PR 无法绿，且同属 `docs` 类型不算混交）。
- **明确不做:** `cliVersion` pin 不在本 change 动。`--body-file` 与必填门是新能力，必须等 CLI 侧 v1.6.0 的 tag 与 Release 落地后再走独立 pin bump；提前 bump 会让 `workflow plan` 解析到不存在的 release。

## 任务

- [x] task-1 — `norms/pr-message.md,norms/templates/pr-body.md` — 规范与模板落盘（四段全必需、scope 定表、禁署名、可追溯 issue）
- [x] task-2 — `skills/shadow-dev-release/SKILL.md,skills/shadow-dev-hotfix/SKILL.md,skills/shadow-dev-publish/SKILL.md,docs/cli-guide.md,CLAUDE.md` — 按需指针与三处调用面对齐新门
- [x] task-3 — `shadow-docs/INDEX.md` — 存量台账红灯由 index rebuild 消解
- [x] task-4 — 观察点取证 — 发版四门绿 + 宿主模板 `--check` 与真源一致 + 全仓再无缺 `--body` 的 plan 示例

## 结果

评级 M。取证 = 冒烟 + 被触及不变量各一个观察点 + 走查；四门只作门槛。

- **观察点 A（调用面与新门同源）**：扫描 `skills|docs|norms|rules` 全部 `release plan`/`publish plan` 示例行 → 除 `docs/cli-guide.md:166` 外均带正文参数；核对该行是跨行命令的起始行（`--body-file` 落在 `:168`），属扫描脚本的按行误报，非缺参。三处技能示例（release / hotfix / publish）已各带 `--title` + `--body-file`。
- **观察点 B（真源→宿主生成链）**：以 PR #58 分支里的 `gen-pr-template.mjs` 执行 `--template norms/templates/pr-body.md --check --out D:/works/x.wuh.site/.github/PULL_REQUEST_TEMPLATE.md` → `ok: … 与 norms/templates/pr-body.md 一致`（exit 0）。脚本本体不在本仓，按分工属 shadow-dev-cli，故从该分支取原文执行，未在插件仓留副本。
- **观察点 C（死链归零）**：改写 `norms/pr-message.md` 的路径式引用后复跑 `check:knowledge` → `ok=11 warn=15 fail=0`，且 warn 集里不再出现「引用了尚未落盘的 …gen-pr-template.mjs」（此前 16 warn 含该条）。
- **观察点 D（存量台账红灯消解）**：`index rebuild plan/execute` 后 INDEX 的 v7.0.0/v7.0.1 行变为 `✅ 完成` 且路径含 `changes/archive/`，v7.0.2 幽灵条目消失；`check:knowledge` 从 main 上的 `fail=5` 变 `fail=0`。
- **门槛**：`check:requires` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`（declared=29 / referenced=23 / missing-in-cli=0）；`check:brief` → 4 份在途 brief 全绿；`check:version` → 三处 manifest 同源 7.0.2。
- **未验证项（明说）**：`npm test` 与 `check:smoke` 未在本机跑——发布冒烟需走真实 release 轨且本机 `bash` 命中 WSL 占位程序（已在 CLI 侧实测同一缺陷）；该判定交给 PR 的 Actions 三平台矩阵。
- **明确缺口**：`cliVersion` pin 仍为 v1.5.0，待 CLI v1.6.0 打 tag 后另走独立 change 对齐。
