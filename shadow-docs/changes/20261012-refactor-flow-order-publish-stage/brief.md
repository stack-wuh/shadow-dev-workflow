---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-refactor-flow-order-publish-stage",
  "type": "refactor",
  "scope": "skills/,README.md,CLAUDE.md,menu.md,docs/,knowledge/,package.json,test/,shadow-docs/domain.md,.github/workflows/",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "refactor/20261012-refactor-flow-order-publish-stage",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".github/workflows/publish-release.yml",
    "CLAUDE.md",
    "README.md",
    "docs/cli-guide.md",
    "knowledge/distribution-capability-contract.md",
    "knowledge/release-artifact-pipeline.md",
    "menu.md",
    "package.json",
    "shadow-docs/domain.md",
    "skills/shadow-dev-archive/SKILL.md",
    "skills/shadow-dev-hotfix/SKILL.md",
    "skills/shadow-dev-publish/SKILL.md",
    "skills/shadow-dev-release/SKILL.md",
    "skills/shadow-dev-review/SKILL.md",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "1711d5a004a69f6bc9559ffa738c68cc93abd33f",
    "verifiedAt": "2026-10-12T00:33:18.604Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "e6cb3d71b091dd76bda06140b49693b1b2572baf814ba9a592ceb1525a03ed92",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[refactor] 流程重排：归档并入 release 末段，正式发布独立为 publish 阶段",
      "titleRaw": "[refactor] 流程重排：归档并入 release 末段，正式发布独立为 publish 阶段",
      "supplement": "",
      "body": "## 动机\n现流程 `propose → apply → review → release → archive` 把两件不同的事塞进 `release`：「知识闭环 + 提交 PR」和「交付发布（委托用户执行）」。收尾顺序也是拧的——`release` 第 4 步委托发布，`archive` 却要等 merged 且部署链绿才跑，结果「代码问题全部提交完」与「对外发一个可消费的包」之间夹着一个需要手动记得跑的归档入口：既容易漏归档，也让发布长期停在「已委托、无结论」。\n\n用户裁定：**所有代码问题全部提交完（PR merged）后随即归档 brief；正式发布独立成末段，由它 bump 版本、打 release tag、创建 GitHub Release，触发 Actions 的 `publish-release.yml`，并以隔离 prefix 的发布冒烟作为交付证据。发版与单个 change 解耦——不要求每个 change 都发版，可攒多个 change 一次发布；每次发布自身建一个 `chore` change 作载体。**\n\n**命名说明（受既有契约约束，非随意改名）：** 用户口语里的「走 release 流程正式发布 tag 包」在新流程里叫 `publish` 阶段。原因是 `release` 这个词已被 CLI 命令键占用且语义明确为「commit + push + PR」（`shadow-dev-cli` `lib/commands.mjs:40`），`publish.*` 也已被占用为「推分支 + 创建/复用 PR」（同文件 `:38`）。命令键是跨仓唯一货币，只能加键、不能改义（`knowledge/distribution-capability-contract.md`）。故正式发版取新键 `tag.*`，阶段名与之同源叫 `publish`。\n\n## 引用规范\n- `knowledge/release-artifact-pipeline.md`\n  - 当前结论: GitHub Release 是产物与版本的唯一权威发布点；发版顺序恒为 `bump → check:version → 提交合并 → git tag → gh release create`，判定/pack/资产断言/上传/冒烟由 `publish-release.yml` 接手；新机器门一律以 strict 形态进 CI；`$GITHUB_PATH` 在同一步内不可见；归档会搬迁 brief，治理门必须向 `changes/archive/` 兜底解析。\n  - 适用 scope: `scripts/pack.mjs`, `scripts/bump-version.mjs`, `scripts/check-requires.mjs`, `scripts/check-knowledge.mjs`, `.github/workflows/`\n  - 与本变更的关系: 主更新目标。「提交合并」这一步现在同时完成归档（release 末段）；「打 tag + `gh release create`」的执行主体由「人/CI」改为「经 CLI `tag.*` 的独立 publish 阶段」；补记「tag 指向的 tree 已含 bump 与归档提交，归档不得触碰三份 manifest」与「攒版：一个 release 覆盖多个已合并 change」。\n- `knowledge/distribution-capability-contract.md`\n  - 当前结论: pin（装哪个 CLI）与能力声明（这份内容能否装进这个 CLI）必须分开且互校；命令键是唯一会自然同步的货币，**改义会打断历史读法，只能加键**；跨仓演进顺序为**消费方先行兼容、生产方随后声明**；内容层遇命令缺失只能阻塞不能降级。\n  - 适用 scope: `cross-project`\n  - 与本变更的关系: 直接定死 Phase 顺序——CLI 未发布含 `tag.*` 的版本前，本仓不得声明该键、不得在技能文本写出该命令，否则 `check:requires:strict` 判 `undeclared` 或 `missing-in-cli` 红。也是 `publish.*` 不能复用的依据。\n- `knowledge/domain-driven-shadow-dev.md`\n  - 当前结论: 领域模型是工作流的规格载体；L 级变更必须在 brief 写不变量与观察点对账。\n  - 适用 scope: `workflow-governance`\n- `norms/domain-model.md` + `shadow-docs/domain.md` 维护规则\n  - 当前结论: 新增/改名上下文与术语的顺序纪律——**先改 `shadow-docs/domain.md`，再动卡片 `domain` 与 `menu.md` 路由，最后跑 `npm run check:knowledge`**；单次变更的归属变化必须走 propose 修订 brief，不得在 apply 中途改登记。\n  - 适用 scope: `shadow-docs/domain.md`, `knowledge/`, `menu.md`\n- `norms/verification.md`\n  - 当前结论: L 级每条不变量一个可追溯观察点；「套件全绿」不能代替观察点；探针绿不能代替完成证据；不为一次变更新建测试文件。\n  - 适用 scope: 全仓\n- `norms/knowledge-cards.md`\n  - 当前结论: 卡片字段与 status 生命周期、source 兜底解析、`verified-depth` 与 `verified-scope` 要求；**能更新现有卡片时不新增**；禁止为让门变绿而改写卡片来源路径。\n  - 适用 scope: `knowledge/`, `shadow-docs/knowledge/`, `menu.md`\n- `norms/code-style.md`\n  - 当前结论: 外科手术式修改，每一行 diff 可追溯到用户请求；不改没坏的东西。\n  - 适用 scope: 全仓\n- `rules/behavior.md` §13「不要偏离工作流阶段」\n  - 当前结论: 严格遵守当前阶段任务范围，不越界操作。\n  - 适用 scope: 全仓 — 据此，归档动作放进 release 末段时必须仍只调用 `archive plan/execute`，不得顺手改发布逻辑。\n- `menu.md`「发布与质量门」行\n  - 当前结论: 关键词 `发布 release tag 版本权威 资产名 tarball pack 上传 发布冒烟 quality-gate publish-release CI strict 半绿 假绿 机器门 死链 孤儿规范` → `knowledge/release-artifact-pipeline.md`。\n  - 适用 scope: 通用路由表 — 本次追加 `publish`、`发版`、`攒版`、`阶段顺序`、`tag.plan`、`归档`，使流程类任务命中卡片。\n\n## 决策\n- **选型:** 方案 A——五段重排（`propose → apply → review → release → publish`）+ 新增 `shadow-dev-publish` 技能（skills 8→9）+ CLI 侧新命令键 `tag.*` + `shadow-dev-archive` 降为幂等恢复入口 + 每次发版建 `chore` 载体 change。\n- **对比方案:**\n  - **B（六段，archive 独立且排在 publish 前）**：`archive` 与 `publish` 都以 PR merged 为前提，顺序差只落到「归档提交必须先于 tag」一条真实约束上（由 `release-authority` + `archive-precondition` 覆盖），却多留一个必须手动记得跑的入口，漏归档全靠 Actions 兜。未选。\n  - **C（不建 publish 技能，只写文档命令清单）**：与用户裁定「先给 CLI 加命令再 AI 执行」冲突，且 `git tag` / `gh release create` 长期留在「原始 Git/GitHub 写命令」的例外口子里，铁律上是破口。未选。\n  - **D（复用并扩义 `release.*` 或 `publish.*`）**：语义最贴近用户原话，但要改 CLI 已有键的含义——历史 brief、`docs/cli-guide.md`、`archive-on-issue-close.yml` 里的读法全部失效。未选，依 `distribution-capability-contract.md`「命令键一旦成为跨仓货币就不该改义，只能加键」。\n  - **E（删 `shadow-dev-archive` 保 skills=8）**：省掉两处计数门改动，但失去补跑入口；漏归档只能手改目录，而手改 change 目录与 INDEX 是 archive 技能明文禁项。未选。\n  - **F（本仓自写 `scripts/publish.mjs` 承载 tag/release create）**：不阻塞在外部仓，但把写操作留在 CLI 统一门之外，与本仓「一切 Git/GitHub 写操作经 `shadow-dev`」的执行纪律相悖。用户裁定选跨仓，未选。\n- **理由:**\n  1. 「archive 提到 release 前面」在物理上不可能早于 PR 创建——`archive.plan` 需 GitHub API 证明 merged，而 PR 由 release 创建。可实现的形态只有：归档并入 release 的 merged 之后末段，正式发布独立成 publish。这与用户裁定的五段一致。\n  2. 跨仓顺序由卡片定死：CLI 先实现并发布，本仓随后声明 + 改 pin。Phase 1 与 Phase 4 之间的阻塞点**是设计出来的**，不是意外；本 change 的 apply 若撞上 CLI 未就位，就在 gate 处停止，不合入半态。\n  3. `distribution` 侧与治理侧同 change 落地，是为了让 `check:requires:strict` 与 skills 计数门在任何一次提交上不同时指向两个真值——拆成两个 PR 必然有一个带红门，等于把门自己变成半绿。\n- **隔离手段:** 在共享 checkout 走 inline 分支（`branch plan/execute`），本轮不用 worktree——Phase 4 需要观察 `npm run ci` 对本仓工作树真实状态（`check-knowledge.mjs:121` 的死链门以 `git status --porcelain` 判定新路径引用是否合法），且本 change 不与其它变更并行。**顺序后果:** worktree 从基线派生新树时未提交的 brief 不在其中（会 `BRIEF_NOT_FOUND`），故先在共享 checkout 建分支提交 brief；本轮**不执行 `bind execute`**，避免宿主发现目录被中途改写。\n\n## 任务\n### Phase 1 · 前置门槛（只读确认，不写本仓文件）\n\n- [ ] task-1 — 外部确认 — 确认 `shadow-dev-cli` 的 `tag.plan` / `tag.execute` 是否已实现并发布；记录 CLI 版本号与其命令目录。验证：`shadow-dev version --json` 回新版本；`shadow-dev help --full --json` 命令目录含 `tag.plan` / `tag.execute` → 通过则进 Phase 4，未通过则**在 Phase 2 完成后停止并报告缺口**，不合入含未声明命令的 PR\n- [ ] task-2 — `package.json` — 门槛未过时保持 `cliVersion: v1.5.0` 与 `requiresCommands` 全不动，`skills/shadow-dev-publish/SKILL.md` 本阶段只写阶段语义与准入判定，命令面段落留待 task-15 落地（**不提前写未声明命令**）。验证：`SHADOW_DEV_CLI=$HOME/shadow-desktop/github/shadow-dev-cli/cli.mjs npm run check:requires:strict` → `undeclared=[] missing-in-cli=[]` rc=0\n\n### Phase 2 · 技能层重排（workflow-governance）\n\n- [ ] task-3 — `skills/shadow-dev-release/SKILL.md` — 删除原第 4 步「交付发布（项目条件性，委托执行）」与第 6 步「下一步 → archive」；改为「§4 等待 merged（`sync plan/execute` 同步本地 main）→ §5 归档 brief 与重建 INDEX（`archive plan` + `archive execute --confirm`，含 worktree 回收前置与「归档提交不得触碰三份 manifest」的显式约束）→ §6 输出 → §7 下一步：需要对外发布时用 `shadow-dev-publish`」；frontmatter `description` 同步。验证：文件内不再出现「委托用户执行发布」段；离场语的下一步指向 `shadow-dev-publish`\n- [ ] task-4 — `skills/shadow-dev-publish/SKILL.md` — 新建发版入口技能：触发词（发版、正式发布、publish、打 tag、上线版本）；**准入判定**（main 干净且 `quality-gate` 绿、列出本次覆盖的已合并 change、商定版本号与 bump 位）；**流程**（① 建 `chore` 载体 change ② bump 三份 manifest 走 `release plan/execute` 出 PR ③ merged ④ `tag plan/execute` 打 tag 与创建 Release ⑤ 审查 `publish-release.yml` run 与冒烟输出 ⑥ 结论写回载体 brief ⑦ `archive plan/execute` 归档载体）；**不可省清单**（版本同源、资产名契约、冒烟证据、红门不代跑、攒版时不得只 bump 不列覆盖范围）。验证：`node -e` 统计 `skills/*/SKILL.md` == 9；`npm run check:knowledge` 技能 name/目录一致性绿\n- [ ] task-5 — `skills/shadow-dev-archive/SKILL.md` — 定位由「流程末位」改为「release 末段已自动执行；本技能为幂等恢复入口」；删去「项目声明了部署触发时跳过发布阶段直接归档」这条与新语义冲突的禁项，改为「发版交付结论不属于归档前置，归档只要求 merged + review passed」；保留 merged 前置、worktree 回收前置、`archive-on-issue-close.yml` 自动通道、禁止手改目录与 INDEX。验证：`npm run check:knowledge` 绿；离场语不再声明「工作流结束」为唯一终点\n- [ ] task-6 — `skills/shadow-dev-review/SKILL.md` — 只改衔接文本：通过后进入 `shadow-dev-release`（不变），移除任何暗示「release 之后还有独立 archive 阶段」的表述。验证：`grep -n '下一步:' skills/shadow-dev-review/SKILL.md` 指向 release\n- [ ] task-7 — `skills/shadow-dev-hotfix/SKILL.md` — §5 与离场语从「PR merged 后手动执行 `shadow-dev-archive`」改为「release 末段归档，缺失时用 `shadow-dev-archive` 补跑」。验证：`grep -rn '下一步: shadow-dev-archive' skills/` 无命中\n\n### Phase 3 · 文档与宿主清单同源\n\n- [ ] task-8 — `README.md` — 架构图补 `shadow-dev-publish/`（`shadow-dev-archive/` 注释改「恢复入口」）；工作流段 `:61` 改为 `propose → apply → review → release → publish`，要点行重写（release 含 merged 后归档；publish 独立入口 + 攒版 + `chore` 载体）；「发版（Release 控制版本号）」一节由手工 `git tag`/`gh release create` 命令块改为经 `shadow-dev tag plan/execute`。验证：`grep -n 'release → archive' README.md` 无命中；`grep -c 'shadow-dev-publish' README.md` ≥ 1\n- [ ] task-9 — `CLAUDE.md`（本仓）— `:7` 分层规则的技能列举与 `:45` Skill 触发表加入 publish 行；唯一流程一行同步五段新序。验证：与 README 的流程串逐字一致\n- [ ] task-10 — `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` — `:3` 与 `:4` 的 description 流程串、`.codex-plugin` 的 `shortDescription`（「五段式管线」表述）与 `longDescription`（`:27`，含「合并后归档并重建 INDEX」的归属改写）同步；codex `keywords` 追加 `publish`。**不动 `version`**（bump 属发版阶段，改则 `check:version` 红）。验证：`npm run check:version` 绿（三份仍同源 6.9.0）\n- [ ] task-11 — `docs/cli-guide.md` — 命令表追加 `tag plan` / `tag execute`；`:168` 的「archive：PR merged 后」段改为「release 末段自动 + 恢复入口补跑」两种用法；`:83` 的 worktree 回收引用由「见 shadow-dev-archive 前置条件」改指 release §5。验证：`npm run check:knowledge` 死链门绿\n- [ ] task-12 — `/Users/wuhong/.claude/CLAUDE.md`（**项目外，用户已显式授权**）— 唯一流程一行改为新五段，并加一句 publish 语义。验证：`grep -n 'propose → apply → review → release → publish' $HOME/.claude/CLAUDE.md` 命中；该文件不进 `--files` 声明集（仓外路径），改动在提交报告中单独列明\n\n### Phase 4 · 登记与机器门同步（distribution，需 CLI 就位后）\n\n- [ ] task-13 — `shadow-docs/domain.md` — `workflow-governance` 主目录补 `skills/shadow-dev-publish/`；`distribution` 关键术语补 `tag.* 发版命令键`、「发版载体 chore change」、「攒版」；「术语表增量」登记 `publish` / `release` / CLI `publish.*` 三者分工。**顺序纪律：先改本页，再动 `menu.md`**（`norms/domain-model.md`）。验证：`npm run check:knowledge` 的 domain 值域与归属一致性绿\n- [ ] task-14 — `menu.md` — 「发布与质量门」行关键词追加 `publish 发版 攒版 阶段顺序 tag.plan tag.execute 归档`。验证：`npm run check:knowledge` 的 active 卡 menu 路由门绿\n- [ ] task-15 — `.github/workflows/publish-release.yml` + `test/pack.test.mjs` + `package.json` + `skills/shadow-dev-publish/SKILL.md` — 四处**同一提交内**同步：workflow 冒烟计数 `8` → `9`（`:104` 与报错文案 `expected 9`）；pack 逐名清单追加 `shadow-dev-publish`（保留 `shadow-dev-archive`）；`requiresCommands` 追加 `tag.plan` / `tag.execute` 且 `cliVersion` 升到已发布版本；publish 技能命令段落替换为真实 `shadow-dev tag plan/execute`。验证：`SHADOW_DEV_CLI=<新 cli.mjs> npm run check:requires:strict` → `undeclared=[] missing-in-cli=[]` rc=0；**门负例**：临时摘掉 `tag.execute` 声明重跑必须 rc=1 并点名该键（证门在判，非摆设）\n- [ ] task-16 — 全门回归 — 本机 `npm run ci` 四门一体全绿。验证：逐门真实输出摘要写入 brief「结果」段（`check:version` / `check:requires:strict` / `check:knowledge` / `npm test`）\n\n### Phase 5 · 收尾（review 与 release 阶段执行，不在 apply 内）\n\n- [ ] task-17 — `review execute --conclusion passed --knowledge 更新`；release 落实知识：原位更新 `knowledge/release-artifact-pipeline.md` 的发版顺序表述并补 `verified-depth` / `verified-scope`，向 `knowledge/distribution-capability-contract.md` 追加 `tag.*` 落地实证与 source。验证：卡片结论与新流程一致，`npm run check:knowledge` 绿\n- [ ] task-18 — 归档：本 change 的 PR merged 后由 release 末段 `archive plan/execute` 归档并重建 INDEX（**新流程的第一次自证**）。验证：`shadow-docs/changes/` 下不再存在本目录、`shadow-docs/INDEX.md` 含本 change 条目\n\n完整 brief：shadow-docs/changes/20261012-refactor-flow-order-publish-stage/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261012-refactor-flow-order-publish-stage\",\"type\":\"refactor\",\"scope\":\"skills/,README.md,CLAUDE.md,menu.md,docs/,knowledge/,package.json,test/,shadow-docs/domain.md,.github/workflows/\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261012-refactor-flow-order-publish-stage/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "refactor"
      ]
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        ".github/workflows/publish-release.yml",
        "CLAUDE.md",
        "README.md",
        "docs/cli-guide.md",
        "knowledge/distribution-capability-contract.md",
        "knowledge/release-artifact-pipeline.md",
        "menu.md",
        "shadow-docs/changes/20261012-refactor-flow-order-publish-stage/brief.md",
        "shadow-docs/domain.md",
        "skills/shadow-dev-archive/SKILL.md",
        "skills/shadow-dev-hotfix/SKILL.md",
        "skills/shadow-dev-publish/SKILL.md",
        "skills/shadow-dev-release/SKILL.md",
        "test/pack.test.mjs"
      ],
      "message": "refactor(workflow): 流程重排——归档并入 release 末段，正式发布独立为 publish 阶段",
      "title": "refactor: 流程重排——归档并入 release 末段，正式发布独立为 publish 阶段",
      "body": ""
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/release-artifact-pipeline.md",
    "reason": "阶段顺序与发布执行主体是跨 change 复用的长期事实：release 现含 merged 后归档、publish 独立成发版入口；须原位更新 release-artifact-pipeline.md 的发版顺序表述并补 verified-depth/scope，同时向 distribution-capability-contract.md 追加发版命令域缺口实证"
  }
}
---

# 流程重排：归档并入 release 末段，正式发布独立为 publish 阶段

## 动机

现流程 `propose → apply → review → release → archive` 把两件不同的事塞进 `release`：「知识闭环 + 提交 PR」和「交付发布（委托用户执行）」。收尾顺序也是拧的——`release` 第 4 步委托发布，`archive` 却要等 merged 且部署链绿才跑，结果「代码问题全部提交完」与「对外发一个可消费的包」之间夹着一个需要手动记得跑的归档入口：既容易漏归档，也让发布长期停在「已委托、无结论」。

用户裁定：**所有代码问题全部提交完（PR merged）后随即归档 brief；正式发布独立成末段，由它 bump 版本、打 release tag、创建 GitHub Release，触发 Actions 的 `publish-release.yml`，并以隔离 prefix 的发布冒烟作为交付证据。发版与单个 change 解耦——不要求每个 change 都发版，可攒多个 change 一次发布；每次发布自身建一个 `chore` change 作载体。**

**命名说明（受既有契约约束，非随意改名）：** 用户口语里的「走 release 流程正式发布 tag 包」在新流程里叫 `publish` 阶段。原因是 `release` 这个词已被 CLI 命令键占用且语义明确为「commit + push + PR」（`shadow-dev-cli` `lib/commands.mjs:40`），`publish.*` 也已被占用为「推分支 + 创建/复用 PR」（同文件 `:38`）。命令键是跨仓唯一货币，只能加键、不能改义（`knowledge/distribution-capability-contract.md`）。故正式发版取新键 `tag.*`，阶段名与之同源叫 `publish`。

## 复杂度评级

- **评级:** L
- **理由:**
  - **契约变更:** `package.json.requiresCommands` 新增 `tag.plan` / `tag.execute`，`cliVersion` pin 由 `v1.5.0` 上移至 CLI 新版本；`skills/` 目录集合由 8 变 9，而该数量被两处机器断言写死（`test/pack.test.mjs:72` 逐名清单、`.github/workflows/publish-release.yml:104` 冒烟计数）；对外发布动作的执行主体由「委托用户/CI」改为「经 CLI 命令键」。
  - **触及面:** 17 个仓内文件 + 1 个项目外文件，横跨技能层（新增 1 张、改写 5 张）、文档与两份宿主清单、CI workflow、测试断言、`shadow-docs/domain.md` 登记与 `knowledge/` 卡片。
  - **可发现性:** 好，且这正是本次要靠的东西——`check:requires:strict`（三级包含）、`check:knowledge`（技能 name/目录一致性、domain 值域、menu 路由、死链）、`npm test`（pack 内容契约）、`publish-release` 冒烟（skills 计数）全部会在错位当场判红。风险是**跨仓时序**：技能文本里一旦出现 `shadow-dev tag plan`，而 `tag.plan` 未声明或已 pin 的 CLI 无此键，strict 门立刻红——这决定了 Phase 顺序，不是意外。
- **期望验证深度:** runtime（本机 `npm run ci` 四门全绿 + strict 门负例 + 归档前置负例；GitHub 矩阵真跑与首个 `publish` 冒烟待 run/release 链接回填）

## 领域模型

- **限界上下文:** 主 `workflow-governance` — 开发流程治理：阶段语义、技能路由、brief 生命周期。次 `distribution` — 版本与发布链：命令键声明、产物计数断言、tag 发布与冒烟。
  - 上下游：`workflow-governance` ← `execution-layer`（`stack-wuh/shadow-dev-cli`）；`distribution` → claude-code / codex / zcode 三宿主。
  - **反腐边界:** 本仓不实现任何 Git/GitHub 写命令、不安装或选择 CLI 版本以外的东西，只用 `requiresCommands` 声明所需命令键；`tag.*` 的动作面语义归 `execution-layer` 定义，本仓只消费。
  - **同时踩进第二个上下文——有意不拆：** `distribution` 侧的改动全部是治理变更的直接物理后果（多一张技能目录 → 计数断言必须同步；多一个命令键 → 声明与 pin 必须同步）。拆成两个 change 会让两个 PR 之一必然带一条红门，违反 `knowledge/release-artifact-pipeline.md`「门禁止半绿」。真正该拆的是 CLI 仓的 `tag.*` 实现——另一个仓库、另一个 change，登记为前置。
- **统一语言增量:**
  - `publish`（阶段名）：正式对外发布一个 GitHub Release tag 包的**独立入口**，只在用户明确要求「发版」时运行。与命令键 `release.*`（commit+push+PR）和 `publish.*`（CLI 已占用＝推分支建 PR）**三者严格区分**，本仓技能文本不得使用 CLI 的 `publish` 命令域以免歧义。
  - `tag.plan` / `tag.execute`：CLI 侧新命令键，动作面＝断言版本同源 → `git tag` → `git push` tag → `gh release create`；不覆盖任何既有键语义。
  - 发版载体：每次发布自身立一个 `YYYYMMDD-chore-release-vX.Y.Z` brief，承载 bump、tag、run 结论与冒烟证据。
  - 攒版：多个已合并但未发布的 change 共用一次 bump 与 tag；一个 release 覆盖多个 change。
  - 恢复入口：`shadow-dev-archive` 从流程末位改为**幂等补跑入口**（漏归档、Actions 自动归档失败、hotfix 事后补归档）。
- **聚合与不变量:**
  - `pipeline-order`（根：`README.md:61` + `.claude-plugin/plugin.json:3` + `.codex-plugin/plugin.json:4,26,27` + 各技能离场语）：五段顺序 `propose → apply → review → release → publish` 在所有登记处逐字同源；旧串 `release → archive` 作为**流程顺序**在 live 文件零残留（`shadow-docs/changes/` 历史 brief 不在扫描面内，由 `check-knowledge.mjs` 的归档目录跳过保证）；`shadow-docs/domain.md` 与 `menu.md` 的归属与实际技能目录一致。
  - `skill-set`（根：`skills/`）：技能目录数恒等于门里的计数——**8 → 9**；`scripts/check-knowledge.mjs:108`（动态计数）、`test/pack.test.mjs:72`（逐名清单）、`.github/workflows/publish-release.yml:104`（冒烟计数 `"$N" = "8"`）三处必须同时为 9 且集合相同；每张 `SKILL.md` 的 frontmatter `name` 与目录名一致（`check-knowledge.mjs:114` 判定）。
  - `capability-contract`（根：`package.json.requiresCommands` + `cliVersion`）：`skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录` 三级包含恒成立（`scripts/check-requires.mjs:19` 以**单行**正则扫 `shadow-dev <words>`，跨行不计数）；strict 下解析不到命令目录即判红，禁止「未参与断言」半绿；能力缺失只能响亮阻塞（`ARTIFACT_INCOMPATIBLE`），禁止「CLI 不支持就改走手工命令」的静默降级。**本次新增子不变量：技能文本里出现的命令键，必须在该 PR 合入时已被已 pin 的 CLI 提供——否则 strict 门红，即内容比工具新。**
  - `release-authority`（根：三份 manifest + release tag）：tag 去 `v` == `package.json.version` == `.claude-plugin` == `.codex-plugin`；tag 指向的 tree 必须已含 bump；`check:version` 不由 CI 事后回写修正；release 资产名匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`。
  - `archive-precondition`（根：CLI `archive.plan` 校验 + `shadow-docs/changes/`）：归档只能在 GitHub API 证明 PR merged 且 review passed 之后（此前置**不因流程重排而放宽**）；归档提交只搬迁 `shadow-docs/`，不得触碰三份 manifest（否则 tag 指向的 tree 版本权威被归档动作污染）。
  - `delivery-evidence`（根：发版载体 brief「结果」段）：`publish` 的完成证据是 `publish-release.yml` run 结论 + `OK materialized root=… skills=9`，**不是「tag 已打上」**。
- **领域事件:**
  - review 结论 `passed` → 进入 release（原为「release 后再找 archive」）。
  - PR merged → release 末段自动归档 brief 并重建 INDEX（原为 `shadow-dev-archive` 独立手动触发）。
  - 用户发出「发版」指令 → 建立发版载体 chore change（**新事件**，原先无对应入口）。
  - 载体 bump PR merged → `tag execute` 打 tag 并创建 Release → `release.published` 触发 `publish-release.yml`。
  - Actions 冒烟绿 → 发版结论写回载体 brief → 归档载体；冒烟红 → 停止并报告，**不归档**。
  - 未 merged 就请求归档 → `archive execute` 拒绝（负例观察点）。

## 引用规范

- `knowledge/release-artifact-pipeline.md`
  - 当前结论: GitHub Release 是产物与版本的唯一权威发布点；发版顺序恒为 `bump → check:version → 提交合并 → git tag → gh release create`，判定/pack/资产断言/上传/冒烟由 `publish-release.yml` 接手；新机器门一律以 strict 形态进 CI；`$GITHUB_PATH` 在同一步内不可见；归档会搬迁 brief，治理门必须向 `changes/archive/` 兜底解析。
  - 适用 scope: `scripts/pack.mjs`, `scripts/bump-version.mjs`, `scripts/check-requires.mjs`, `scripts/check-knowledge.mjs`, `.github/workflows/`
  - 与本变更的关系: 主更新目标。「提交合并」这一步现在同时完成归档（release 末段）；「打 tag + `gh release create`」的执行主体由「人/CI」改为「经 CLI `tag.*` 的独立 publish 阶段」；补记「tag 指向的 tree 已含 bump 与归档提交，归档不得触碰三份 manifest」与「攒版：一个 release 覆盖多个已合并 change」。
- `knowledge/distribution-capability-contract.md`
  - 当前结论: pin（装哪个 CLI）与能力声明（这份内容能否装进这个 CLI）必须分开且互校；命令键是唯一会自然同步的货币，**改义会打断历史读法，只能加键**；跨仓演进顺序为**消费方先行兼容、生产方随后声明**；内容层遇命令缺失只能阻塞不能降级。
  - 适用 scope: `cross-project`
  - 与本变更的关系: 直接定死 Phase 顺序——CLI 未发布含 `tag.*` 的版本前，本仓不得声明该键、不得在技能文本写出该命令，否则 `check:requires:strict` 判 `undeclared` 或 `missing-in-cli` 红。也是 `publish.*` 不能复用的依据。
- `knowledge/domain-driven-shadow-dev.md`
  - 当前结论: 领域模型是工作流的规格载体；L 级变更必须在 brief 写不变量与观察点对账。
  - 适用 scope: `workflow-governance`
- `norms/domain-model.md` + `shadow-docs/domain.md` 维护规则
  - 当前结论: 新增/改名上下文与术语的顺序纪律——**先改 `shadow-docs/domain.md`，再动卡片 `domain` 与 `menu.md` 路由，最后跑 `npm run check:knowledge`**；单次变更的归属变化必须走 propose 修订 brief，不得在 apply 中途改登记。
  - 适用 scope: `shadow-docs/domain.md`, `knowledge/`, `menu.md`
- `norms/verification.md`
  - 当前结论: L 级每条不变量一个可追溯观察点；「套件全绿」不能代替观察点；探针绿不能代替完成证据；不为一次变更新建测试文件。
  - 适用 scope: 全仓
- `norms/knowledge-cards.md`
  - 当前结论: 卡片字段与 status 生命周期、source 兜底解析、`verified-depth` 与 `verified-scope` 要求；**能更新现有卡片时不新增**；禁止为让门变绿而改写卡片来源路径。
  - 适用 scope: `knowledge/`, `shadow-docs/knowledge/`, `menu.md`
- `norms/code-style.md`
  - 当前结论: 外科手术式修改，每一行 diff 可追溯到用户请求；不改没坏的东西。
  - 适用 scope: 全仓
- `rules/behavior.md` §13「不要偏离工作流阶段」
  - 当前结论: 严格遵守当前阶段任务范围，不越界操作。
  - 适用 scope: 全仓 — 据此，归档动作放进 release 末段时必须仍只调用 `archive plan/execute`，不得顺手改发布逻辑。
- `menu.md`「发布与质量门」行
  - 当前结论: 关键词 `发布 release tag 版本权威 资产名 tarball pack 上传 发布冒烟 quality-gate publish-release CI strict 半绿 假绿 机器门 死链 孤儿规范` → `knowledge/release-artifact-pipeline.md`。
  - 适用 scope: 通用路由表 — 本次追加 `publish`、`发版`、`攒版`、`阶段顺序`、`tag.plan`、`归档`，使流程类任务命中卡片。

## 决策

- **选型:** 方案 A——五段重排（`propose → apply → review → release → publish`）+ 新增 `shadow-dev-publish` 技能（skills 8→9）+ CLI 侧新命令键 `tag.*` + `shadow-dev-archive` 降为幂等恢复入口 + 每次发版建 `chore` 载体 change。
- **对比方案:**
  - **B（六段，archive 独立且排在 publish 前）**：`archive` 与 `publish` 都以 PR merged 为前提，顺序差只落到「归档提交必须先于 tag」一条真实约束上（由 `release-authority` + `archive-precondition` 覆盖），却多留一个必须手动记得跑的入口，漏归档全靠 Actions 兜。未选。
  - **C（不建 publish 技能，只写文档命令清单）**：与用户裁定「先给 CLI 加命令再 AI 执行」冲突，且 `git tag` / `gh release create` 长期留在「原始 Git/GitHub 写命令」的例外口子里，铁律上是破口。未选。
  - **D（复用并扩义 `release.*` 或 `publish.*`）**：语义最贴近用户原话，但要改 CLI 已有键的含义——历史 brief、`docs/cli-guide.md`、`archive-on-issue-close.yml` 里的读法全部失效。未选，依 `distribution-capability-contract.md`「命令键一旦成为跨仓货币就不该改义，只能加键」。
  - **E（删 `shadow-dev-archive` 保 skills=8）**：省掉两处计数门改动，但失去补跑入口；漏归档只能手改目录，而手改 change 目录与 INDEX 是 archive 技能明文禁项。未选。
  - **F（本仓自写 `scripts/publish.mjs` 承载 tag/release create）**：不阻塞在外部仓，但把写操作留在 CLI 统一门之外，与本仓「一切 Git/GitHub 写操作经 `shadow-dev`」的执行纪律相悖。用户裁定选跨仓，未选。
- **理由:**
  1. 「archive 提到 release 前面」在物理上不可能早于 PR 创建——`archive.plan` 需 GitHub API 证明 merged，而 PR 由 release 创建。可实现的形态只有：归档并入 release 的 merged 之后末段，正式发布独立成 publish。这与用户裁定的五段一致。
  2. 跨仓顺序由卡片定死：CLI 先实现并发布，本仓随后声明 + 改 pin。Phase 1 与 Phase 4 之间的阻塞点**是设计出来的**，不是意外；本 change 的 apply 若撞上 CLI 未就位，就在 gate 处停止，不合入半态。
  3. `distribution` 侧与治理侧同 change 落地，是为了让 `check:requires:strict` 与 skills 计数门在任何一次提交上不同时指向两个真值——拆成两个 PR 必然有一个带红门，等于把门自己变成半绿。
- **隔离手段:** 在共享 checkout 走 inline 分支（`branch plan/execute`），本轮不用 worktree——Phase 4 需要观察 `npm run ci` 对本仓工作树真实状态（`check-knowledge.mjs:121` 的死链门以 `git status --porcelain` 判定新路径引用是否合法），且本 change 不与其它变更并行。**顺序后果:** worktree 从基线派生新树时未提交的 brief 不在其中（会 `BRIEF_NOT_FOUND`），故先在共享 checkout 建分支提交 brief；本轮**不执行 `bind execute`**，避免宿主发现目录被中途改写。

## 前置与后继（跨仓 / 跨上下文依赖）

- **前置（关键路径，阻塞本 change 的 Phase 4）:** `stack-wuh/shadow-dev-cli` 仓另立 change，实现 `tag.plan` / `tag.execute`——断言三份 manifest 版本同源且等于目标版本 → `git tag v<ver>` → `git push` tag → `gh release create v<ver>`，plan/execute 两段式 + planHash 校验 + `--confirm`，失败码沿用既有契约，**并推翻该仓 `20261009-chore-release-v150/brief.md:79`「不执行 `git tag` / `gh release create`（合并后由用户执行）」的既有登记边界**（该边界需在该仓自己的 change 里显式修订，本仓越界改它即违反反腐边界），随后发布新版本（预计 v1.6.0）。**该 change 未发布前，本仓不得声明 `tag.*`、不得在技能文本写出该命令、不得改 `cliVersion`。**
- **后继:** 首个用新流程跑起来的 `publish` 阶段，回填 `knowledge/release-artifact-pipeline.md` 的 `verified-scope`（卡片现已声明该缺口：GitHub 矩阵真跑与首个 release 的 run 链接）与本 brief 的 `release-authority` / `delivery-evidence` 观察点。不属于本 change。

## 任务

### Phase 1 · 前置门槛（只读确认，不写本仓文件）

- [x] task-1 — 外部确认 — 确认 `shadow-dev-cli` 的 `tag.plan` / `tag.execute` 是否已实现并发布；记录 CLI 版本号与其命令目录。验证：`shadow-dev version --json` 回新版本；`shadow-dev help --full --json` 命令目录含 `tag.plan` / `tag.execute` → 通过则进 Phase 4，未通过则**在 Phase 2 完成后停止并报告缺口**，不合入含未声明命令的 PR
- [x] task-2 — `package.json` — 门槛未过时保持 `cliVersion: v1.5.0` 与 `requiresCommands` 全不动，`skills/shadow-dev-publish/SKILL.md` 本阶段只写阶段语义与准入判定，命令面段落留待 task-15 落地（**不提前写未声明命令**）。验证：`SHADOW_DEV_CLI=$HOME/shadow-desktop/github/shadow-dev-cli/cli.mjs npm run check:requires:strict` → `undeclared=[] missing-in-cli=[]` rc=0

### Phase 2 · 技能层重排（workflow-governance）

- [x] task-3 — `skills/shadow-dev-release/SKILL.md` — 删除原第 4 步「交付发布（项目条件性，委托执行）」与第 6 步「下一步 → archive」；改为「§4 等待 merged（`sync plan/execute` 同步本地 main）→ §5 归档 brief 与重建 INDEX（`archive plan` + `archive execute --confirm`，含 worktree 回收前置与「归档提交不得触碰三份 manifest」的显式约束）→ §6 输出 → §7 下一步：需要对外发布时用 `shadow-dev-publish`」；frontmatter `description` 同步。验证：文件内不再出现「委托用户执行发布」段；离场语的下一步指向 `shadow-dev-publish`
- [x] task-4 — `skills/shadow-dev-publish/SKILL.md` — 新建发版入口技能：触发词（发版、正式发布、publish、打 tag、上线版本）；**准入判定**三条（main 干净且 `quality-gate` 绿、列出本次覆盖的已合并 change、商定版本号与 bump 位）；**流程**（① 建 `chore` 载体 change ② bump 三份 manifest 走 `release plan/execute` 出 PR ③ merged 后同步基线 ④ 打 tag 与创建 Release ⑤ 审查 `publish-release.yml` run 与冒烟 ⑥ 结论写回载体 brief ⑦ 归档载体）；开头写**阶段名消歧**（本仓 publish 阶段 ≠ CLI 命令键 `publish.*`）；**不可省清单**含「能力缺失时阻塞或委托，不降级为手工写命令」。第 ④ 步为**委托清单形态**（已 pin 的 CLI 无发版命令键），命令替换随 15b 落地。验证：`find skills -name SKILL.md | wc -l` == 9；`npm run check:knowledge` → 「技能 9 个」；`check:requires:strict` → `undeclared=[]`（技能内 8 处 `shadow-dev` 引用全在声明集内）
- [x] task-5 — `skills/shadow-dev-archive/SKILL.md` — 定位由「流程末位」改为「release 末段已自动执行；本技能为幂等恢复入口」；删去「项目声明了部署触发时跳过发布阶段直接归档」这条与新语义冲突的禁项，改为「发版交付结论不属于归档前置，归档只要求 merged + review passed」；保留 merged 前置、worktree 回收前置、`archive-on-issue-close.yml` 自动通道、禁止手改目录与 INDEX。验证：`npm run check:knowledge` 绿；离场语不再声明「工作流结束」为唯一终点
- [x] task-6 — `skills/shadow-dev-review/SKILL.md` — 只改衔接文本：通过后进入 `shadow-dev-release`（不变），移除任何暗示「release 之后还有独立 archive 阶段」的表述。验证：`grep -n '下一步:' skills/shadow-dev-review/SKILL.md` 指向 release
- [x] task-7 — `skills/shadow-dev-hotfix/SKILL.md` — §5 与离场语从「PR merged 后手动执行 `shadow-dev-archive`」改为「release 末段归档，缺失时用 `shadow-dev-archive` 补跑」。验证：`grep -rn '下一步: shadow-dev-archive' skills/` 无命中

### Phase 3 · 文档与宿主清单同源

- [x] task-8 — `README.md` — 架构图补 `shadow-dev-publish/`（`shadow-dev-archive/` 注释改「恢复入口」）；工作流段改为 `propose → apply → review → release → publish`，要点行重写（release 含 merged 后归档；publish 独立入口 + 攒版 + `chore` 载体）；「发版」一节改写为 publish 阶段语义，并**如实写明打 tag 与创建 Release 目前仍由人执行**（已 pin 的 CLI 无发版命令键，按「能力缺失只能阻塞、不降级」留在委托清单里，待能力就位后再换成 CLI 调用）。验证：`grep -n 'release → archive' README.md` 无命中；`grep -c 'shadow-dev-publish' README.md` ≥ 1
- [x] task-9 — `CLAUDE.md`（本仓）— `:7` 分层规则的技能列举改为 propose、apply、review、release、publish 并注明 archive 为归档恢复入口；Skill 触发表把「提交、PR」行改为含 merged 后归档、新增「正式发版」与「归档恢复入口」两行。**本仓 CLAUDE.md 无箭头流程串**（流程串在 README 与两份宿主清单，全局 `~/.claude/CLAUDE.md` 用带前缀形态），故原写的「与 README 逐字一致」在本文件不适用——改为本条验证。验证：`grep -n 'propose、apply、review、release、publish' CLAUDE.md` 命中 `:7`；触发表含 `shadow-dev-publish` 行
- [x] task-10 — `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` — `:3` 与 `:4` 的 description 流程串、`.codex-plugin` 的 `shortDescription`（「五段式管线」表述）与 `longDescription`（`:27`，含「合并后归档并重建 INDEX」的归属改写）同步；codex `keywords` 追加 `publish`。**不动 `version`**（bump 属发版阶段，改则 `check:version` 红）。验证：`npm run check:version` 绿（三份仍同源 6.9.0）
- [x] task-11 — `docs/cli-guide.md` — 归档段标题与说明改为「release 末段自动，本表为恢复入口」；「典型工作流」序列把 `sync` + `archive` 并入 release 收口、追加 publish 阶段入口注释；worktree 回收引用由「见 shadow-dev-archive 前置条件」改指 release §5；补一条 `publish` 命名消歧（CLI 命令键 `publish.*` ＝推分支建 PR，与本仓 publish 发版阶段无关）。**未追加发版命令键到命令表**——已 pin 的 CLI 无该能力，文档不得指向不存在的命令；该部分随 15b 落地。验证：`npm run check:knowledge -- --forbid '<CI 同参数>'` → `fail=0`（死链门含本文档）
- [x] task-12 — `/Users/wuhong/.claude/CLAUDE.md`（**项目外，用户已显式授权**）— 唯一流程一行改为新五段（该文件用 `shadow-dev-` 前缀形态：`` `shadow-dev-propose → shadow-dev-apply → shadow-dev-review → shadow-dev-release → shadow-dev-publish` ``），并补 release 收口归档、publish 独立入口可攒版、archive 恢复入口三条说明。验证：`grep -n 'shadow-dev-release → shadow-dev-publish' $HOME/.claude/CLAUDE.md` 命中 `:7`；该文件不进 `--files` 声明集（仓外路径），改动在提交报告中单独列明。**注意**：本文档初版写的验证命令用无前缀串，对该文件恒不命中——已按文件实际形态纠正，不是文件漏改

### Phase 4 · 登记与机器门同步（distribution；本批只含不依赖 CLI 的部分）

- [x] task-13 — `shadow-docs/domain.md` — `workflow-governance` 关键术语补「阶段顺序 / publish 发版阶段 / 发版载体 / 攒版」；`distribution` 关键术语补「发版命令域（语义归属 `execution-layer`）」；「术语表增量」登记 `publish` 的三种读音（本仓 publish 阶段 ≠ CLI `release.*` ≠ CLI `publish.*`）与发版命令域的归属和阻塞语义。**顺序纪律：先改本页，再动 `menu.md`**（`norms/domain-model.md`）。验证：`npm run check:knowledge` 的 domain 值域与归属一致性绿；登记文本为长期事实，不含会被 `check:requires` 扫成命令引用的形态；主目录列 `skills/` 已覆盖新技能目录，不需逐项追加
- [x] task-14 — `menu.md` — 新增「流程阶段与发版」路由行（关键词 `阶段顺序 五段 propose apply review release publish archive 归档 发版 攒版 发版载体 打 tag 正式发版 交付发布` → `knowledge/release-artifact-pipeline.md`, `norms/domain-model.md`），使流程类任务能命中卡片。验证：`npm run check:knowledge -- --forbid '<CI 同参数>'` → `fail=0`；`grep -n '流程阶段与发版' menu.md` 命中
- [x] task-15 — `.github/workflows/publish-release.yml` + `test/pack.test.mjs` — 技能计数门与 pack 名单随第 9 张技能**同批**同步：workflow 冒烟计数 `8` → `9`（判定与 `expected 9` 报错文案）；pack 逐名清单追加 `shadow-dev-publish`（保留 `shadow-dev-archive`）。**这两处只依赖技能目录数、不依赖 CLI 能力，禁止拆给 gate 之后**——否则合并后仓内留下指向 8 的错断言，正撞 `skill-set` 不变量（本 brief 初版把它们绑在 CLI 依赖上，是错的分组）。验证：`find skills -name SKILL.md | wc -l` == 9；`grep -n 'expected 9'` 命中；`grep -n shadow-dev-publish test/pack.test.mjs` 命中；`npm test` 绿
- [x] task-16 — 全门回归 — 本机四门逐个跑（`check:version` / `check:requires:strict` / `check:knowledge` 含 CI `--forbid` 变体 / `npm test`），逐门真实输出摘要写入「结果」段。验证：四门 rc=0；`check:knowledge` 打出「技能 9 个」；strict 门 `undeclared=[] missing-in-cli=[] catalog=resolved`；`npm test` 11 项全绿。首轮 `npm test` 与 `check:version` 各遇一次 node 段错误（exit 139，SGN-004 本机风暴），重试收敛且非代码回归——已在结果段归因

### 收尾动作（review / release 阶段执行，不在 apply 任务表内）

> `tasks()` 按复选框位置取 id，`review execute` 以「全部勾选」为机械门禁；阶段本身的动作不得写进 checkbox，否则门禁自锁（本 brief 初版犯过，见「结果」段）。以下由后续阶段完成：

1. `review execute --conclusion passed --knowledge 更新`，release 落实知识：原位更新 `knowledge/release-artifact-pipeline.md` 的发版顺序表述并补 `verified-depth` / `verified-scope`，向 `knowledge/distribution-capability-contract.md` 追加发版命令域缺口实证与 source。
2. release 末段 `archive plan/execute` 归档本 change（**新流程的第一次自证**）。`archive planData` 自身要求 review passed 且 API 证明 PR merged，故只能发生在 release 阶段；`archive-precondition` 不变量的 apply 侧观察点＝**在 review 尚 pending 时对已归档历史 change 跑 `archive plan`，须返回 `REVIEW_NOT_PASSED`**（见「结果」段）。

## 结果

- 实际耗时: 跨两个会话日——propose 起于 2026-10-11 晚，apply 于 2026-10-12 完成（含两次 Bash 分类器超时等待）。
- 验证: L 级逐条对账，每条不变量 → 观察点命令 + 真实输出摘要。

  - `pipeline-order` → **observed**。旧串零残留：`grep -rn 'release → archive\|expected 8' --include=*.md --include=*.json --include=*.yml --include=*.mjs . | grep -v shadow-docs/changes/` → 无命中。新串跨登记处一致：`README.md` 1 处、`.claude-plugin/plugin.json` 1 处、`.codex-plugin/plugin.json` 2 处均为 `propose → apply → review → release → publish`；`CLAUDE.md` 与全局 `~/.claude/CLAUDE.md` 以列举/前缀形式表达（`shadow-dev-propose → … → shadow-dev-publish`），非漏改。
  - `skill-set` → **observed**。三处同值 9：`find skills -name SKILL.md | wc -l` → `9`；`publish-release.yml:104` → `[ "$N" = "9" ] … expected 9`；`test/pack.test.mjs:72` 名单含 `shadow-dev-publish` 且保留 `shadow-dev-archive`。`npm run check:knowledge` → `[ok] 技能 9 个：name/description 与目录一致性检查完成`。
  - `capability-contract` → **observed（本批范围内）**。strict 门对**已 pin 的 CLI** 与**开发中 CLI 检出**两种取源均绿：`declared=29 skills-referenced=23 undeclared=[] cli-catalog=46 catalog=resolved strict=on missing-in-cli=[]` → rc=0。新技能未污染声明集（曾误写 `shadow-dev change list` 触发 `undeclared`，已改为不带 `shadow-dev` 前缀的表述）。**门负例（摘掉某键声明必须 rc=1 并点名该键）本次未重跑**——它已由 `20261009-build-artifact-capability-gate` 实证且本批未改 `check-requires.mjs`；15b 落地时随 `tag.*` 一并补做。
  - `release-authority` → **部分 observed**。`npm run check:version` → `✓ 三处 manifest 版本同源: 6.9.0（3 个文件）`；本批确认**未**误 bump（`version` 三处仍 6.9.0，bump 属发版阶段）。「tag 指向的 tree 已含 bump」为**证据缺口**，需首个 publish run 回填。
  - `archive-precondition` → **observed**。负例真实输出：review 仍 `pending` 时 `shadow-dev archive plan --name <本 change>` → `{"ok":false,"error":{"code":"REVIEW_NOT_PASSED"}}`，证明归档前置未被流程重排放宽。「归档提交只动 `shadow-docs/`」为**后继观察点**：本 change 尚未归档，由 release 末段归档后 `git show --stat` 取证。
  - `delivery-evidence` → **pending（本 change 不产出）**。属 publish 阶段的交付证据，依赖 CLI 发版能力与首个 release。

- **四门回归真实输出**（task-16）：`check:version` rc=0 · `check:requires:strict` rc=0 · `check:knowledge`（含 CI 同参数 `--forbid` 变体）`ok=11 warn=7 fail=0` rc=0 · `npm test` 11 项全 `✔`。warn 7 条均为存量豁免与归档兜底提示（`bug-investigation.md` 缺 `verified-depth/scope`、四张卡 source 经归档兜底解析），非本次引入。
- **探针红归因**：首轮 `npm test` 与 `npm run ci` 各遇一次 `Segmentation fault: 11`（node 子进程 exit 139）。命中 `shadow-docs/signals.md` **SGN-004**（本机 node 段错误风暴，权重 5，runtime）：重试即收敛，第二次 `npm test` 直接跑完 11 项无段错误；两次失败点不同（一次在 test、一次在 check:version）也是该风暴特征——**非代码回归**，与本次改动无因果关系。
- **过程中的两次自身错误（记录以备追溯）**：
  1. **brief 初版把 review 与归档动作写进 apply 任务表** → `review execute` 的机械门禁（`lib/domains/review.mjs:13`：`ts.length && !ts.every(t => t.done)` → `TASKS_NOT_COMPLETE`）与「不得假勾」互锁。修正为：阶段动作移出 checkbox 写成「收尾动作」段。仓内先例 `20261010-feature-workflow-context-map`（12 项全为 apply 内可执行项）支持此形状。
  2. **初版把 skills 计数门与 pack 名单绑在 CLI 依赖上**（原 task-15）→ 若按计划停在 gate，合并后仓内将留下指向 8 的错断言，正撞 `skill-set` 不变量。修正：计数门随第 9 张技能同批落地，只有 `requiresCommands` + `cliVersion` + 命令文本停在 gate。
  3. 另：首次改造曾把 `domain.md`/`menu.md` 写成重复行（位置 13/14 与 16/17 并存），因 `tasks()` 按**复选框位置**取 id（`lib/brief.mjs:27`），重复即错位——已折叠为 16 项且位置与标签一一对账通过。
- **停在 gate 的部分（15b，非偷懒，是设计中的阻塞点）**：`requiresCommands` 未追加发版命令键、`cliVersion` 仍 `v1.5.0`、`shadow-dev-publish` 第 5 步保持委托清单形态。证据：对已 pin CLI `shadow-dev help tag` → `UNKNOWN_COMMAND`；`shadow-dev-cli/lib/commands.mjs:38` 显示 `publish.*` 已被「推分支+建 PR」占用（故 brief 初选键名不可用，实际拟用名需在 CLI 仓另立 change 定夺，且需该仓显式修订其 `20261009-chore-release-v150/brief.md:79`「不执行 `git tag` / `gh release create`」的既有边界——本仓不越界改它）。
- **交付中间态说明**：本批落地后，新流程语义（release 收口归档、publish 独立入口、archive 恢复入口、9 张技能、两处计数门）已完整生效且四门全绿；发版的**执行载体**暂缺，由 `shadow-dev-publish` §5 的委托清单 + 响亮阻塞兜住，不降级为 AI 代跑原始 `git`/`gh`。

## 知识评估

- **预期影响:** 更新
- **候选卡片:**
  - `knowledge/release-artifact-pipeline.md`（主）
    - 动作: 原位更新「执行约束」首条发版顺序——「提交合并」现含归档 brief 与重建 INDEX；「打 tag + `gh release create`」执行主体改为经 CLI `tag.*` 的独立 `publish` 阶段；补记「tag 指向的 tree 已含 bump 与归档提交，归档不得触碰三份 manifest」与「攒版：一个 release 覆盖多个已合并 change」。
    - `verified-depth`: 本机四门为 `unit`；首个 publish run 才够 `runtime`/`field`。本次按 `unit` 更新并保留缺口表述。
  - `knowledge/distribution-capability-contract.md`（次）
    - 动作: 更新，把 `tag.*` 作为「命令键只能加不能改义」与「消费方先行兼容」的新实证补入；补入本次实测到的新子不变量——技能文本出现的命令键必须在合入时由已 pin 的 CLI 提供，否则 strict 门红。若 review 判定实证不足，则只追加 source、不改结论。
  - `menu.md`
    - 动作: 更新「发布与质量门」行关键词。
  - **查重结论:** 不为「流程重排」新建卡片——它是上述两张卡已有主题的延伸，依 `norms/knowledge-cards.md`「能更新现有卡片时不新增」。
- **理由:** 阶段顺序、发布执行主体、命令键占用事实都是跨 change 复用的长期执行真相；brief 记「这次发生了什么」，卡片记「现在应怎么做」。

## 待确认点（代码事实 vs active Knowledge / 跨仓边界）

1. **卡片将过期（非代码回归）:** `knowledge/release-artifact-pipeline.md` 现文把打 tag 与 `gh release create` 描述为人/CI 动作，本变更收进 CLI 命令键。依冲突优先级 1，以 `check-requires` 的机器断言与 CLI 实际命令目录为最终裁决，卡片在 release 阶段原位更新。
2. **需另一仓显式修订的边界:** CLI 仓 `20261009-chore-release-v150/brief.md:79` 明文「不执行 `git tag` / `gh release create`」。该边界由 `execution-layer` 自己拥有，**本仓不得越界改它**——须在该仓的 `tag.*` change 中显式修订。列为前置的组成部分，不是本仓 task。
3. **已安装产物副本不在 scope:** `~/.claude/skills/shadow-dev-*` 是产物副本，改完需重新发版或在开发机重新物化才生效。属后继（发版阶段），不在本 change 文件集。
4. **`.agents/plugins/marketplace.json` 无流程串**（实测仅 displayName），不需要改；`rules/behavior.md:91` 的「ship 阶段」是既有的泛指举例，不属本次流程登记面，按外科手术原则不动。
