---
{
  "schema": "shadow-dev/v1",
  "name": "20261010-refactor-domain-driven-workflow",
  "type": "refactor",
  "scope": "workflow-governance",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "refactor/20261010-refactor-domain-driven-workflow",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "CLAUDE.md",
    "README.md",
    "knowledge/bug-investigation.md",
    "knowledge/domain-driven-shadow-dev.md",
    "menu.md",
    "norms/domain-model.md",
    "norms/signals.md",
    "norms/tdd-verification.md",
    "norms/verification.md",
    "package.json",
    "rules/behavior.md",
    "rules/iron-laws.md",
    "shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-hotfix/SKILL.md",
    "skills/shadow-dev-knowledge/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md",
    "skills/shadow-dev-review/SKILL.md"
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
    "verifiedCommit": "601fb9dc398b446e5146a1eb0727ca5313e001ec",
    "verifiedAt": "2026-10-09T16:52:11.691Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "0187f0a75ff5fdf9a62c7bd8c3a4b4d8003141d4",
    "planHash": "ee874ef6b71d584a85c1fd655f338c1652f7526a8e5010bde45a6d1c55f73b4c",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[refactor] 工作流从 TDD 驱动转为领域驱动（DDD）——规格载体换成领域模型与不变量",
      "titleRaw": "[refactor] 工作流从 TDD 驱动转为领域驱动（DDD）——规格载体换成领域模型与不变量",
      "supplement": "领域驱动改造：propose 增领域对齐轮、brief 增「## 领域模型」段、apply 验证门改不变量观察点、review 增模型一致性维、tdd-verification.md 改名 verification.md 并清理 14 处引用与 ▶ [TDD] token。完整 brief：shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md",
      "body": "## 动机\n2026-10-09 用户裁决「不要写 TDD 了，太浪费时间了」已经落到 `norms/tdd-verification.md` 的「验证方式裁决」节和 `rules/iron-laws.md` §1（经 #36 进 main），**但执行层技能正文没跟上，仓库现在自相矛盾**。基线 `main@28e6f25`（v6.5.1）逐条核实：\n\n| 位置 | 现行文本 | 与裁决的关系 |\n|------|----------|--------------|\n| `skills/shadow-dev-apply/SKILL.md:55` | **L**：完整 TDD——写失败测试并确认失败 → 最小实现并确认通过 → 重构保持绿色 | **直接冲突** |\n| `skills/shadow-dev-apply/SKILL.md:56` | **M**：绿灯测试——写测试并通过 | **直接冲突**（裁决：M 默认不新建测试文件） |\n| `skills/shadow-dev-hotfix/SKILL.md:74` | L 级写自动化复现测试先红后绿 | **与同文件 59 行自相矛盾**（59 行已写「不强制先红仪式」） |\n| `skills/shadow-dev-hotfix/SKILL.md:101` | 收尾门禁：L 复现测试先红后绿 | 同上 |\n| `rules/behavior.md:30` | L 级 Bug 修复须先写复现测试 | 冲突 |\n| `norms/tdd-verification.md:54,56` + `apply:59` + `hotfix:74` | 非协商进度 token `▶ [TDD] n/N <测试名> red\\|green` | 名分残留 |\n| 文件名与引用 | `norms/tdd-verification.md` 被 9 个文件引用共 14 处（`menu.md`×2、`apply`×2、`hotfix`×3、`propose`/`behavior`/`iron-laws`/`signals`/`bug-investigation`/`README` 各 1） | 名分残留 |\n| `menu.md:10` · `CLAUDE.md:19` · `.codex-plugin/plugin.json:4,16,27`（keywords 含 `tdd`、longDescription「按 brief 执行 TDD」）· `.claude-plugin/plugin.json:3`（仍是过期的「4-phase pipeline (propose → apply → review → ship) + TDD」） | 对外口径 | 名分残留 |\n\n第二层动机更根本：**TDD 撤走后，规格来源不能悬空**。这套基建（deterministic CLI + 三级知识库 + menu 路由 + signals + 分级验证）已经把「测试曾经承担的两件事」提供了更便宜的替代品——规格表达和完成证据。把它们显式交给领域模型与不变量，而不是留给 diff 走查，才守得住唯一不可让的那道门。而领域驱动的构件本就在：`knowledge-cards.md` 有 `domain:` 字段、CLI 按 `lib/domains/` 组织、后端模块即限界上下文，只是流程从没把它当第一等公民。\n\n**非目标：** 不重组 `norms/`、`knowledge/` 目录结构；不改 CLI 命令面与 brief JSON schema（新增正文段 CLI 不解析，零破坏，`requiresCommands` 不扩项）；不动分发轨——`hooks/`、`scripts/install-cli.sh`、`package.json.cliVersion` 三项仍在 main（原 PR #34 的「注销双轨」部分未合入且分支已删，属 `plugin-distribution` 上下文，本 change 不碰不删）；不改任何项目仓 `shadow-docs/`。\n\n**待确认点（记录，不在本 change 处置）：** 上游 #34 关闭后其「单向分发」结论与 main 现状（三件旧轨仍在）之间是否重新排期，由分发上下文决定。\n\n## 引用规范\n- `norms/tdd-verification.md`（本 change 改名 `norms/verification.md`）\n  - 当前结论: 分级制——评级可议，强度与评级匹配不可议；2026-10-09 裁决已把 L 级达成方式改为可追溯 runtime 观察点，本 change 升格为「不变量观察点」并去掉 TDD 名分。\n  - 适用 scope: 全流程\n- `rules/iron-laws.md` §1 / `rules/behavior.md` §4\n  - 当前结论: 铁律已是分级验证口径（L 观察点 / M 冒烟+既有测试绿+走查 / S 结构引用残留扫描）；behavior §4 仍是旧 L 复现测试口径，须对齐。\n  - 适用 scope: rules/\n- `norms/knowledge-cards.md`\n  - 当前结论: 一卡一知识单元；active 卡必须进 menu 路由；新增前按 `domain + keywords + scope` 查重；`verified-depth: runtime` 必须附可追溯观察点；存量卡片不回溯迁移（视为 `code-read`）。\n  - 适用 scope: norms/, knowledge/, menu.md\n- `knowledge/distribution-capability-contract.md` · `knowledge/multi-host-plugin-distribution.md`\n  - 当前结论: 兼容判定用能力名不用版本号；能力缺失只能响亮阻塞不得静默降级；新增宿主＝新增描述符；**禁止改写既有宿主清单语义**。\n  - 适用 scope: 本 change 仅改两份清单的 TDD 措辞与 keywords，不动 hooks/版本/pack 语义\n- `norms/signals.md`\n  - 当前结论: 扇宽由 brief 复杂度评级决定，引用路径为 `norms/tdd-verification.md`（改名同步点之一）。\n  - 适用 scope: norms/signals.md\n- `knowledge/bug-investigation.md`\n  - 当前结论: 同一 Bug 的复现/根因/修复/回归必须单一持续上下文；根因明确后机械验证可并行。\n  - 适用 scope: hotfix 复现环节改造时遵守\n\n## 决策\n- **选型:** 方案 B — 领域驱动作为规格载体，TDD 降级为可选证据手段。propose 在「澄清需求」与「比较方案」之间插入「领域对齐」轮并在 brief 模板加「## 领域模型」段；apply 验证门禁按不变量重写（同时消灭 55/56 行冲突）；review 增第 10 维「模型一致性」；knowledge 查询路由升为 `域 + 技术域` 双键；hotfix 把「复现锁定」改为「被破坏不变量的可复现观察」并消除 74/101 行自相矛盾；`tdd-verification.md` 改名 `verification.md`，14 处引用与 `▶ [TDD]` token 一并清理（改 `▶ [verify]`）；新增 `norms/domain-model.md` 与跨项目卡 `knowledge/domain-driven-shadow-dev.md`；`package.json` + 两份宿主清单版本 bump 6.6.0。\n- **对比方案:**\n  - **方案 A（只清残留、不引入领域层）**：未选。它回答不了「TDD 拿走后规格从哪来」——没有不变量当验收对象，L 级门禁退化为 diff 走查，防假完成的门反而更弱，也没回应诉求本体。\n  - **方案 C（连知识体系按限界上下文重组目录 + CLI 增 `domain` 命令域）**：未选为本轮范围。需 `requiresCommands` 扩项、三仓同步、项目卡片全量迁移，且刚立的能力契约要求消费方先行兼容；留作 B 落地验证后的独立 change。\n  - **保留文件名 `tdd-verification.md`**：未选。名字即规范的一部分，留着会持续把「先红仪式」当默认动作召回；已核实改名代价可控——`scripts/pack.mjs` 整目录拷贝 `norms`、`scripts/check-requires.mjs` 只扫命令键、`test/pack.test.mjs` 只断言目录与 skills 清单，**无程序化文件名引用**，14 处全为文档引用。\n  - **主工作区直接改（不开 worktree）**：未选。本 checkout 被 `shadow-dev workflow link` 直通为活动产物（`workflow status` 的 `linked`/`resolved` 指向它），三宿主 `bind` 从这里复制技能；在 main 工作区逐文件编辑会让中途半成品随时可被重新绑定消费。L 级按 propose 规定走专属 workspace。\n- **执行期修订（apply 阶段发现，非静默跨级）:** `worktree inspect` 建议 `create`（L 级），但 CLI 实现不支持「新建 change 尚未提交 brief」这一常态——`lib/domains/worktree.mjs` 的 `execute` 用 `git worktree add -b <type>/<name> <path> <base>` 从基线派生工作树，且只向**主工作区**的 brief 回写 `branch`/`workflow.worktree`；此时 brief 仍是未跟踪文件，新工作树内不存在它，后续 `task set`/`review`/`commit` 一律 `BRIEF_NOT_FOUND`，人工拷贝则造成两份受管状态分裂。故本 change 改走 **inline 分支**执行，隔离手段换为：主工作区切到功能分支后**不在实现中途执行 `bind execute`**，宿主绑定刷新留到 review 通过后的 release 阶段（`workflow link` 直通本 checkout，中途重绑才会把半成品技能铺给三宿主）。worktree 对新立项 change 的缺口另立 change 在 `shadow-dev-cli` 上下文处置。\n\n- **理由:** 你的基建已经能提供 TDD 原本负责的两件事——规格表达（不变量替代用例）与完成证据（观察点替代绿灯）；把建模写进流程是净增益，同时唯一不可让的门（强度与评级匹配）原样保留，既有测试仍必须绿。\n\n## 任务\n### Phase 1 — 领域层定义\n- [ ] 新增领域驱动规范 — `norms/domain-model.md` — 限界上下文/统一语言/聚合/领域不变量/观察点定义与术语表；brief「## 领域模型」段格式与必填规则（L 必填、M 选填归属域、S 免）；项目 `shadow-docs/domain.md` 上下文地图模板；越界禁止条款（不改他上下文语义、不借建模扩面）\n- [ ] 新增跨项目知识卡 — `knowledge/domain-driven-shadow-dev.md` — 结论：AI 工作流的规格载体是领域模型与不变量，测试降级为证据手段之一；含执行约束、适用边界、验证方式，`domain: workflow-governance`\n\n### Phase 2 — 验证纪律改名与残留清理\n- [ ] 规范改名并去 TDD 名分 — `norms/verification.md`（由 `norms/tdd-verification.md` 改名，原文件删除） — 节名与表格改为「不变量观察点」口径；进度 token `▶ [TDD]` → `▶ [verify]`；保留分级制、「强度与评级匹配不可议」「既有测试必须绿」「收口对账」三条不变\n- [ ] 文档与规则引用清理 — `menu.md`, `CLAUDE.md`, `README.md`, `norms/signals.md`, `knowledge/bug-investigation.md`, `rules/iron-laws.md`, `rules/behavior.md` — 14 处路径与 `menu.md:10` 关键词去 TDD；`menu.md` 路由表加「域」语义说明并为两份新文件加路由；`behavior.md` §4 改不变量口径；`iron-laws` 新增 §7「不要在缺少领域模型的情况下开始 L 级实现」\n- [ ] 宿主清单口径纠偏 — `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json` — description/longDescription 去掉「TDD」、改为领域驱动 + 分级验证口径；keywords `tdd` → `domain-driven`；`.claude-plugin` 过期「4-phase … ship」改为五段式；**不动 `hooks` 字段与任何分发语义**\n\n### Phase 3 — 流程技能改造\n- [ ] propose 增领域对齐轮 — `skills/shadow-dev-propose/SKILL.md` — 步骤 2/3 间插入「领域对齐」；正文模板加「## 领域模型」段；步骤 5 展示结果同步；`评级: X` token 位置与格式保持不变（CLI 正则依赖）\n- [ ] apply 验证门重写 — `skills/shadow-dev-apply/SKILL.md` — §1 载入 brief 领域模型；§5 按不变量组织验证（L：每条不变量一个观察点；M：触及的既有不变量保持成立 + 冒烟 + 既有测试绿；S：结构与引用扫描）；删 55/56 行 TDD 表述；token 改 `▶ [verify]`；frontmatter description 已是「分级验证」，复核一致\n- [ ] review 增模型一致性维 — `skills/shadow-dev-review/SKILL.md` — 新增第 10 维：实现是否引入未登记术语、破坏不变量、越界改动其他上下文；§8 措辞对齐不变量口径\n- [ ] knowledge 双键路由 — `skills/shadow-dev-knowledge/SKILL.md` — 查询条件加限界上下文；输出格式加「所属域/上下游」；项目存在 `shadow-docs/domain.md` 时先读上下文地图\n- [ ] hotfix 快车道对齐 — `skills/shadow-dev-hotfix/SKILL.md` — 「复现锁定」改为「被破坏不变量的可复现观察」，默认产物由 `test/<文件>` 改为复现步骤/观察记录；消除 74/101 行与 59 行的自相矛盾；L 级仍要求真实复现与回归\n\n### Phase 4 — 自证与发版口径\n- [ ] 版本 bump 与能力声明复核 — `package.json` — 6.6.0，与 `.claude-plugin`/`.codex-plugin` 三处对齐（`npm test` 有机检）；`requiresCommands` 不扩项（本 change 不新增命令键）；确认 `pack DIRS` 整目录拷贝下无需为改名增项\n- [ ] 不变量观察点执行与收口 — `shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md` — 真实跑并记录输出：`npm run check:requires`（差集为空）、`npm test`（install-cli + pack 全绿，既有测试保持绿）、`node scripts/pack.mjs` 产物扫描（`norms/verification.md` 在包内、`tdd-verification.md` 不在、8 skills 齐全）、死链与残留 grep 归零（`tdd-verification`、`▶ [TDD]`、`先红`）、拒绝路径观察点 `shadow-dev workflow plan --from .`（能力断言仍通过、指针不动）\n\n## 补充\n领域驱动改造：propose 增领域对齐轮、brief 增「## 领域模型」段、apply 验证门改不变量观察点、review 增模型一致性维、tdd-verification.md 改名 verification.md 并清理 14 处引用与 ▶ [TDD] token。完整 brief：shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md\n\n完整 brief：shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261010-refactor-domain-driven-workflow\",\"type\":\"refactor\",\"scope\":\"workflow-governance\",\"status\":\"draft\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "refactor"
      ]
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "CLAUDE.md",
        "README.md",
        "knowledge/bug-investigation.md",
        "knowledge/domain-driven-shadow-dev.md",
        "menu.md",
        "norms/domain-model.md",
        "norms/signals.md",
        "norms/tdd-verification.md",
        "norms/verification.md",
        "package.json",
        "rules/behavior.md",
        "rules/iron-laws.md",
        "shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-hotfix/SKILL.md",
        "skills/shadow-dev-knowledge/SKILL.md",
        "skills/shadow-dev-propose/SKILL.md",
        "skills/shadow-dev-review/SKILL.md"
      ],
      "message": "refactor(workflow): 工作流转为领域驱动——不变量作验收对象，TDD 残留清零",
      "title": "20261010-refactor-domain-driven-workflow",
      "body": ""
    },
    "commit": {
      "files": [
        "shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md"
      ],
      "message": "docs(shadow): review 结论重钉至最终提交（既有测试 11/11 全绿）"
    }
  },
  "knowledge": {
    "action": "新增",
    "target": "knowledge/domain-driven-shadow-dev.md",
    "reason": "新增跨项目卡「领域模型是工作流的规格载体」；同时原位改名更新 norms/verification.md、新增 norms/domain-model.md、更新 rules/iron-laws.md §1+§7、rules/behavior.md §4、menu.md 双键路由、knowledge/bug-investigation.md 与 norms/signals.md 关联链接、宿主清单口径。既有测试 11/11 全绿（pack 4/4 + install-cli 7/7），4 条不变量各有真实观察点，死链与 ▶ [TDD] 残留归零，拒绝路径 fixture 仍 ARTIFACT_INCOMPATIBLE 且指针不动。norms/knowledge-cards.md 与本仓 shadow-docs/domain.md 因 CLI 无 change amend 能力留待后续 change。"
  }
}
---

# 工作流从 TDD 驱动转为领域驱动（DDD）

## 动机

2026-10-09 用户裁决「不要写 TDD 了，太浪费时间了」已经落到 `norms/tdd-verification.md` 的「验证方式裁决」节和 `rules/iron-laws.md` §1（经 #36 进 main），**但执行层技能正文没跟上，仓库现在自相矛盾**。基线 `main@28e6f25`（v6.5.1）逐条核实：

| 位置 | 现行文本 | 与裁决的关系 |
|------|----------|--------------|
| `skills/shadow-dev-apply/SKILL.md:55` | **L**：完整 TDD——写失败测试并确认失败 → 最小实现并确认通过 → 重构保持绿色 | **直接冲突** |
| `skills/shadow-dev-apply/SKILL.md:56` | **M**：绿灯测试——写测试并通过 | **直接冲突**（裁决：M 默认不新建测试文件） |
| `skills/shadow-dev-hotfix/SKILL.md:74` | L 级写自动化复现测试先红后绿 | **与同文件 59 行自相矛盾**（59 行已写「不强制先红仪式」） |
| `skills/shadow-dev-hotfix/SKILL.md:101` | 收尾门禁：L 复现测试先红后绿 | 同上 |
| `rules/behavior.md:30` | L 级 Bug 修复须先写复现测试 | 冲突 |
| `norms/tdd-verification.md:54,56` + `apply:59` + `hotfix:74` | 非协商进度 token `▶ [TDD] n/N <测试名> red\|green` | 名分残留 |
| 文件名与引用 | `norms/tdd-verification.md` 被 9 个文件引用共 14 处（`menu.md`×2、`apply`×2、`hotfix`×3、`propose`/`behavior`/`iron-laws`/`signals`/`bug-investigation`/`README` 各 1） | 名分残留 |
| `menu.md:10` · `CLAUDE.md:19` · `.codex-plugin/plugin.json:4,16,27`（keywords 含 `tdd`、longDescription「按 brief 执行 TDD」）· `.claude-plugin/plugin.json:3`（仍是过期的「4-phase pipeline (propose → apply → review → ship) + TDD」） | 对外口径 | 名分残留 |

第二层动机更根本：**TDD 撤走后，规格来源不能悬空**。这套基建（deterministic CLI + 三级知识库 + menu 路由 + signals + 分级验证）已经把「测试曾经承担的两件事」提供了更便宜的替代品——规格表达和完成证据。把它们显式交给领域模型与不变量，而不是留给 diff 走查，才守得住唯一不可让的那道门。而领域驱动的构件本就在：`knowledge-cards.md` 有 `domain:` 字段、CLI 按 `lib/domains/` 组织、后端模块即限界上下文，只是流程从没把它当第一等公民。

**非目标：** 不重组 `norms/`、`knowledge/` 目录结构；不改 CLI 命令面与 brief JSON schema（新增正文段 CLI 不解析，零破坏，`requiresCommands` 不扩项）；不动分发轨——`hooks/`、`scripts/install-cli.sh`、`package.json.cliVersion` 三项仍在 main（原 PR #34 的「注销双轨」部分未合入且分支已删，属 `plugin-distribution` 上下文，本 change 不碰不删）；不改任何项目仓 `shadow-docs/`。

**待确认点（记录，不在本 change 处置）：** 上游 #34 关闭后其「单向分发」结论与 main 现状（三件旧轨仍在）之间是否重新排期，由分发上下文决定。

## 复杂度评级

- **评级:** L
- **理由:** **契约变更**——brief 正文新增必备段「## 领域模型」、apply 验证门禁达成方式由「测试」改为「不变量观察点」、进度 token 改名、新增 `norms/domain-model.md` 约束，全部是下游（6 个宿主绑定、三项目、后续每个 change 的 brief）消费的规格；**触及面**——19 个文件、6 个 skills + 3 个 norms + 2 个 rules + menu/README/CLAUDE/两份宿主清单，跨项目共享；**可发现性**——规范文本改坏不会立刻可见，要等下一个真实 change 跑流程才暴露（引用路径不存在、`check:requires` 判红、`brief` 新段把 CLI 解析 `评级: [SML]` 的正则挤掉、宿主读到中间态技能）。
- **期望验证深度:** runtime（可追溯观察点：真实命令 + 真实输出，覆盖拒绝路径与状态不变量）

## 领域模型

- **限界上下文（本变更所属）:** `workflow-governance` — 开发工作流治理。上游 `shadow-dev-cli`（执行层）、`plugin-distribution`（分发轨），以**能力契约**为反腐边界：本上下文不定义安装顺序、不增删命令键、不碰 hooks 与 pack 清单语义。
- **统一语言增量**（写入 `norms/domain-model.md`，术语表唯一真相）:
  - **限界上下文**：一套稳定词汇生效的边界；跨边界协作必须显式声明依赖方向与反腐层。
  - **统一语言**：同一业务词在一个上下文内只有一个含义；新术语未登记即视为模型漂移。
  - **聚合**：必须整体保持一致的概念单元，有唯一聚合根；本工作流的聚合根是 `change brief`、`Knowledge 卡片`、`分发产物`。
  - **领域不变量**：任何时刻都必须成立的断言，**它就是验收对象本身**；每条不变量必须绑定一个可追溯观察点。
  - **观察点**：证明不变量成立的真实证据（命令 + 输出 / CI 链接 / 产物扫描结果），取代「测试通过」作为通用完成口径。
  - **上下文地图**：项目级 `shadow-docs/domain.md` 声明本项目的限界上下文、上下游关系与术语表。
- **聚合与必须成立的不变量:**
  - `change brief`：一个变更唯一 brief；受管状态只由 CLI 写；`评级: X` token 必须保持可被 CLI 正则 `/评级:\**\s*([SML])/` 解析；**新**：L 级 brief 必含「## 领域模型」段且不变量清单非空。
  - `Knowledge 卡片`：active 卡必须出现在 `menu.md` 至少一条路由；`domain + keywords + scope` 三键齐全；`source` 指向存在路径；`verified-depth` 只升不虚报。
  - `规范引用一致性`：skills/norms/rules/文档中引用的规范文件路径必须存在；全仓不得残留 `tdd-verification.md` 引用与 `▶ [TDD]` token（改名后零死链）。
  - `分发产物`：声明与消费同源——`skills 引用 ⊆ requiresCommands ⊆ CLI 命令目录`；8 个 skills 齐全；三处 manifest 版本 == `package.json.version`。
- **领域事件:** propose 确认 → 评级 + 领域模型一并批准；实现期风险变级 → 先修订 brief 再继续；review 模型一致性门失败 → 阻塞，禁止改写 Knowledge 迁就实现。

## 引用规范

- `norms/tdd-verification.md`（本 change 改名 `norms/verification.md`）
  - 当前结论: 分级制——评级可议，强度与评级匹配不可议；2026-10-09 裁决已把 L 级达成方式改为可追溯 runtime 观察点，本 change 升格为「不变量观察点」并去掉 TDD 名分。
  - 适用 scope: 全流程
- `rules/iron-laws.md` §1 / `rules/behavior.md` §4
  - 当前结论: 铁律已是分级验证口径（L 观察点 / M 冒烟+既有测试绿+走查 / S 结构引用残留扫描）；behavior §4 仍是旧 L 复现测试口径，须对齐。
  - 适用 scope: rules/
- `norms/knowledge-cards.md`
  - 当前结论: 一卡一知识单元；active 卡必须进 menu 路由；新增前按 `domain + keywords + scope` 查重；`verified-depth: runtime` 必须附可追溯观察点；存量卡片不回溯迁移（视为 `code-read`）。
  - 适用 scope: norms/, knowledge/, menu.md
- `knowledge/distribution-capability-contract.md` · `knowledge/multi-host-plugin-distribution.md`
  - 当前结论: 兼容判定用能力名不用版本号；能力缺失只能响亮阻塞不得静默降级；新增宿主＝新增描述符；**禁止改写既有宿主清单语义**。
  - 适用 scope: 本 change 仅改两份清单的 TDD 措辞与 keywords，不动 hooks/版本/pack 语义
- `norms/signals.md`
  - 当前结论: 扇宽由 brief 复杂度评级决定，引用路径为 `norms/tdd-verification.md`（改名同步点之一）。
  - 适用 scope: norms/signals.md
- `knowledge/bug-investigation.md`
  - 当前结论: 同一 Bug 的复现/根因/修复/回归必须单一持续上下文；根因明确后机械验证可并行。
  - 适用 scope: hotfix 复现环节改造时遵守

## 决策

- **选型:** 方案 B — 领域驱动作为规格载体，TDD 降级为可选证据手段。propose 在「澄清需求」与「比较方案」之间插入「领域对齐」轮并在 brief 模板加「## 领域模型」段；apply 验证门禁按不变量重写（同时消灭 55/56 行冲突）；review 增第 10 维「模型一致性」；knowledge 查询路由升为 `域 + 技术域` 双键；hotfix 把「复现锁定」改为「被破坏不变量的可复现观察」并消除 74/101 行自相矛盾；`tdd-verification.md` 改名 `verification.md`，14 处引用与 `▶ [TDD]` token 一并清理（改 `▶ [verify]`）；新增 `norms/domain-model.md` 与跨项目卡 `knowledge/domain-driven-shadow-dev.md`；`package.json` + 两份宿主清单版本 bump 6.6.0。
- **对比方案:**
  - **方案 A（只清残留、不引入领域层）**：未选。它回答不了「TDD 拿走后规格从哪来」——没有不变量当验收对象，L 级门禁退化为 diff 走查，防假完成的门反而更弱，也没回应诉求本体。
  - **方案 C（连知识体系按限界上下文重组目录 + CLI 增 `domain` 命令域）**：未选为本轮范围。需 `requiresCommands` 扩项、三仓同步、项目卡片全量迁移，且刚立的能力契约要求消费方先行兼容；留作 B 落地验证后的独立 change。
  - **保留文件名 `tdd-verification.md`**：未选。名字即规范的一部分，留着会持续把「先红仪式」当默认动作召回；已核实改名代价可控——`scripts/pack.mjs` 整目录拷贝 `norms`、`scripts/check-requires.mjs` 只扫命令键、`test/pack.test.mjs` 只断言目录与 skills 清单，**无程序化文件名引用**，14 处全为文档引用。
  - **主工作区直接改（不开 worktree）**：未选。本 checkout 被 `shadow-dev workflow link` 直通为活动产物（`workflow status` 的 `linked`/`resolved` 指向它），三宿主 `bind` 从这里复制技能；在 main 工作区逐文件编辑会让中途半成品随时可被重新绑定消费。L 级按 propose 规定走专属 workspace。
- **执行期修订（apply 阶段发现，非静默跨级）:** `worktree inspect` 建议 `create`（L 级），但 CLI 实现不支持「新建 change 尚未提交 brief」这一常态——`lib/domains/worktree.mjs` 的 `execute` 用 `git worktree add -b <type>/<name> <path> <base>` 从基线派生工作树，且只向**主工作区**的 brief 回写 `branch`/`workflow.worktree`；此时 brief 仍是未跟踪文件，新工作树内不存在它，后续 `task set`/`review`/`commit` 一律 `BRIEF_NOT_FOUND`，人工拷贝则造成两份受管状态分裂。故本 change 改走 **inline 分支**执行，隔离手段换为：主工作区切到功能分支后**不在实现中途执行 `bind execute`**，宿主绑定刷新留到 review 通过后的 release 阶段（`workflow link` 直通本 checkout，中途重绑才会把半成品技能铺给三宿主）。worktree 对新立项 change 的缺口另立 change 在 `shadow-dev-cli` 上下文处置。

- **理由:** 你的基建已经能提供 TDD 原本负责的两件事——规格表达（不变量替代用例）与完成证据（观察点替代绿灯）；把建模写进流程是净增益，同时唯一不可让的门（强度与评级匹配）原样保留，既有测试仍必须绿。

## 任务

### Phase 1 — 领域层定义
- [x] 新增领域驱动规范 — `norms/domain-model.md` — 限界上下文/统一语言/聚合/领域不变量/观察点定义与术语表；brief「## 领域模型」段格式与必填规则（L 必填、M 选填归属域、S 免）；项目 `shadow-docs/domain.md` 上下文地图模板；越界禁止条款（不改他上下文语义、不借建模扩面）
- [x] 新增跨项目知识卡 — `knowledge/domain-driven-shadow-dev.md` — 结论：AI 工作流的规格载体是领域模型与不变量，测试降级为证据手段之一；含执行约束、适用边界、验证方式，`domain: workflow-governance`

### Phase 2 — 验证纪律改名与残留清理
- [x] 规范改名并去 TDD 名分 — `norms/verification.md`（由 `norms/tdd-verification.md` 改名，原文件删除） — 节名与表格改为「不变量观察点」口径；进度 token `▶ [TDD]` → `▶ [verify]`；保留分级制、「强度与评级匹配不可议」「既有测试必须绿」「收口对账」三条不变
- [x] 文档与规则引用清理 — `menu.md`, `CLAUDE.md`, `README.md`, `norms/signals.md`, `knowledge/bug-investigation.md`, `rules/iron-laws.md`, `rules/behavior.md` — 14 处路径与 `menu.md:10` 关键词去 TDD；`menu.md` 路由表加「域」语义说明并为两份新文件加路由；`behavior.md` §4 改不变量口径；`iron-laws` 新增 §7「不要在缺少领域模型的情况下开始 L 级实现」
- [x] 宿主清单口径纠偏 — `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json` — description/longDescription 去掉「TDD」、改为领域驱动 + 分级验证口径；keywords `tdd` → `domain-driven`；`.claude-plugin` 过期「4-phase … ship」改为五段式；**不动 `hooks` 字段与任何分发语义**

### Phase 3 — 流程技能改造
- [x] propose 增领域对齐轮 — `skills/shadow-dev-propose/SKILL.md` — 步骤 2/3 间插入「领域对齐」；正文模板加「## 领域模型」段；步骤 5 展示结果同步；`评级: X` token 位置与格式保持不变（CLI 正则依赖）
- [x] apply 验证门重写 — `skills/shadow-dev-apply/SKILL.md` — §1 载入 brief 领域模型；§5 按不变量组织验证（L：每条不变量一个观察点；M：触及的既有不变量保持成立 + 冒烟 + 既有测试绿；S：结构与引用扫描）；删 55/56 行 TDD 表述；token 改 `▶ [verify]`；frontmatter description 已是「分级验证」，复核一致
- [x] review 增模型一致性维 — `skills/shadow-dev-review/SKILL.md` — 新增第 10 维：实现是否引入未登记术语、破坏不变量、越界改动其他上下文；§8 措辞对齐不变量口径
- [x] knowledge 双键路由 — `skills/shadow-dev-knowledge/SKILL.md` — 查询条件加限界上下文；输出格式加「所属域/上下游」；项目存在 `shadow-docs/domain.md` 时先读上下文地图
- [x] hotfix 快车道对齐 — `skills/shadow-dev-hotfix/SKILL.md` — 「复现锁定」改为「被破坏不变量的可复现观察」，默认产物由 `test/<文件>` 改为复现步骤/观察记录；消除 74/101 行与 59 行的自相矛盾；L 级仍要求真实复现与回归

### Phase 4 — 自证与发版口径
- [x] 版本 bump 与能力声明复核 — `package.json` — 6.6.0，与 `.claude-plugin`/`.codex-plugin` 三处对齐（`npm test` 有机检）；`requiresCommands` 不扩项（本 change 不新增命令键）；确认 `pack DIRS` 整目录拷贝下无需为改名增项
- [x] 不变量观察点执行与收口 — `shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md` — 真实跑并记录输出：`npm run check:requires`（差集为空）、`npm test`（install-cli + pack 全绿，既有测试保持绿）、`node scripts/pack.mjs` 产物扫描（`norms/verification.md` 在包内、`tdd-verification.md` 不在、8 skills 齐全）、死链与残留 grep 归零（`tdd-verification`、`▶ [TDD]`、`先红`）、拒绝路径观察点 `shadow-dev workflow plan --from .`（能力断言仍通过、指针不动）

## 结果

- 实际耗时: ≈25 分钟（00:19–00:45；含 apply 阶段 3 次 node 139 段错误重试与一次 brief 重建）
- 验证: **L 级＝每条不变量一个可追溯观察点**，按「不变量 → 观察点（真实命令 + 真实输出）」对账：

| # | 不变量 | 观察点与真实输出 |
|---|--------|------------------|
| I1 | `change brief`：受管状态只由 CLI 写；`评级: X` 仍可被 CLI 正则提取；L 级 brief 含「## 领域模型」段且清单非空 | `shadow-dev worktree inspect` → `rating=L`（新正文段未挤掉 `/评级:\**\s*([SML])/` 的提取）；`shadow-dev task list` → 12 项可解析、`task-1..task-12` 逐个 `task set` 回写；frontmatter 全程未手改（一次误改导致 JSON `Bad control character`，已按确定性路径 `rm` 未跟踪 brief 目录 + `change create/approve` 重建，重建后 `json.loads` 通过） |
| I2 | `Knowledge 卡片`：active 卡必须进 menu 路由；三键齐全；source 存在；深度不虚报 | 路径存在性扫描脚本 → 46 个 live 文件抽 25 个规范/资产引用、**死链 0**；`menu 路由含 norms/domain-model.md / knowledge/domain-driven-shadow-dev.md / norms/verification.md: True`；卡片八字段齐全且 `source` 指向的 brief 存在 `True`；`verified-depth` 诚实记 `unit`（runtime 证据待 CI，见证据缺口） |
| I3 | `规范引用一致性`：零残留旧文件名与旧 token | `grep -rn "tdd-verification\|▶ \[TDD\]\|⏸ \[TDD" --exclude-dir=.git --exclude-dir=shadow-docs --exclude-dir=dist . | wc -l` → **0**；残留 `TDD` 字样 8 处逐条人工判定均为历史叙述或负面条款（`verification.md` 沿革与裁决引文、`iron-laws` §7「取消 TDD 仪式后规格悬空」、卡片 keywords「TDD 替代」），无一是祈使式要求 |
| I4 | `分发产物`：声明与消费同源；8 skills；三处 manifest 版本一致；能力缺失响亮拒绝且指针不动 | `npm run check:requires` → `declared=29 skills-referenced=21 undeclared=[] cli-catalog=46 missing-in-cli=[] ✓`（propose 新增 `bind execute` 引用仍 ⊆ 声明集）；`node --test test/pack.test.mjs` → **4/4 pass**（含三 manifest 版本对齐机检）；`node scripts/pack.mjs` + `tar -tzf dist/shadow-dev-workflow-v6.6.0.tar.gz` → 包内 `norms/verification.md`、`norms/domain-model.md`、`knowledge/domain-driven-shadow-dev.md` 在列，`tdd-verification.md` **不在**，`SKILL.md` 计数=8，`package.json version=6.6.0`；拒绝路径 fixture（`requiresCommands` 追加 `nonexistent-domain.inspection`，隔离 `SHADOW_WORKFLOW_PREFIX=/private/tmp/sdd-prefix`）→ `workflow plan` `ok:true` 且 `missingCommands=['nonexistent-domain.inspection']`，`workflow execute` → `ARTIFACT_INCOMPATIBLE: artifact 6.6.0 requires commands this CLI 1.5.0 does not provide`，隔离前缀 `ls -A` 为空（**无半成品目录**），探针后 `workflow status` 仍 `current=6.5.1 / previous=6.5.0 / missingCommands=[]`（**指针不动**） |

- **既有测试保持绿：11/11 全绿，缺口已关闭。** `node --test test/pack.test.mjs` → `# tests 4 # pass 4 # fail 0`（沙箱内）；`node --test test/install-cli.test.mjs` → `ok 1..ok 7`、`# tests 7 # pass 7 # fail 0`（越权到有网络的环境运行，95 秒有界窗口内全部收敛；首轮 `npm test` 与 `workflow plan` 各遇一次 node 139，按 SGN-004 重试至收敛）。
  - 更正一处计划错误：原计划把 install-cli 证据缺口指向「CI run 链接」，但**本仓 `.github/workflows/` 只有 `archive-on-issue-close.yml`，没有测试工作流**——本机是唯一取证场所，不存在 CI 替代观察点。该事实已记入下方遗留项。
- **交付**: 待 `issue execute`（需 `GITHUB_TOKEN`，本机 `GITHUB_TOKEN_REQUIRED`）
- 遗留与后续（明确标注未做与原因）:
  - **本仓上下文地图缺失**：`norms/domain-model.md` 的验证方式要求「知识卡 `domain:` 值能在项目上下文地图中找到」，而本仓尚无 `shadow-docs/domain.md`——该不变量在 workflow 仓自身处于**未满足**状态。原因：`shadow-docs/domain.md` 不在本 change 声明文件集内，且 CLI 无 `change amend --files` 能力（命令目录只有 `change create/approve/list`），中途扩面无法合规提交。后续 change 建本仓地图（`workflow-governance` / `plugin-distribution` / `shadow-dev-cli` 三上下文起步）并在项目仓各建一份。
  - **`norms/knowledge-cards.md` 未改**：propose 的知识评估曾把它列为候选（`domain` 升一等路由键），但任务清单未含该文件。约束已由 `norms/domain-model.md`「验证方式」与 `skills/shadow-dev-knowledge`「约束处理」落地，卡片规范本身的字段说明补写另立 change——记为**知识评估与任务清单的一次不一致**，review 已捕获。
  - **信号提案 2 条**（`shadow-docs/signals.md` 同样不在声明文件集内，先记在这里，由后续写回）：① SGN-004 命中 +1（2026-10-10，`workflow plan`、`review plan`、`npm test` 三次 139/挂起，重试至收敛）；② 新候选 negative/weight 2/depth runtime：「编辑 brief **正文**前必须先按 `\n---\n` 切出正文再定位锚点——frontmatter 的 `issuePlan.body` 是正文快照，含同名文本，全局 `replace(...,1)` 会把真换行插进 JSON 字符串造成 `Bad control character`」。
  - **本仓无 CI 测试门**：`.github/workflows/` 只有 `archive-on-issue-close.yml`，`npm test` 与 `npm run check:requires` 全靠本机手动执行——「验证强度与评级匹配」在缺 CI 时依赖执行者自证，是本仓的结构性弱点（属 `plugin-distribution`/`workflow-governance` 交界，另立 change 补 quality-gate 工作流）。
  - **CLI 工具缺口两处**（属 `shadow-dev-cli` 上下文，各自立项）：worktree 流程不覆盖「未提交 brief 的新立项 change」；`change` 域无 amend 文件集能力，导致 review 阶段的信号写回与卡片规范补写都无法合规落地。
- 过程记录（诚实）:
  - 一次自我破坏并已修：用 `str.replace(anchor, …, 1)` 给 brief 正文插「执行期修订」时，锚点命中的是 frontmatter 里 `issuePlan.body` 的同名快照，真换行进入 JSON 字符串 → `Bad control character`。修正方式＝删除本会话新建的未跟踪 brief 目录后 `change create --body-file` 重建，并在脚本里改为「先按 `\n---\n` 切出正文再定位锚点」；后续所有 brief 正文编辑均走该切分。
  - apply 开工前 `worktree inspect` 建议 `create`，但按实现不可执行（未提交的 brief 不在派生工作树内），已在「决策」段记为执行期修订并改走 inline 分支；worktree 对新立项 change 的缺口留给 `shadow-dev-cli` 上下文的后续 change。
  - `issue plan` 的渲染器只取「动机/引用规范/决策/任务」四段，新增的「复杂度评级/领域模型/结果」段不进 GitHub issue——执行层既有行为，本 change 未改，`领域模型` 的可读性依赖 brief 文件本身。

## 知识评估

- **预期影响:** 新增 + 更新
- **候选卡片:** `knowledge/domain-driven-shadow-dev.md`（新增）、`norms/verification.md`（由 `norms/tdd-verification.md` 原位改名并更新结论）、`norms/domain-model.md`（新增规范）、`norms/knowledge-cards.md`（`domain` 字段升为一等路由键，补执行约束）、`knowledge/bug-investigation.md`（关联知识链接改名）
- **理由:** 「规格来自领域模型与不变量、测试降级为证据手段」是跨项目长期有效的执行真相，不是单次变更过程；改名后的验证卡与新增文件必须进 `menu.md` 路由才允许 active，否则 review 的知识门禁判阻塞。`verified-depth` 在 release 写卡时按 Phase 4 真实观察点填写（预期 `unit`/`runtime` 取实至者，附命令与输出摘要，未达到的深度不得虚报）。
