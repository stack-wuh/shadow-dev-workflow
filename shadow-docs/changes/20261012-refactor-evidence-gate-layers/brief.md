---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-refactor-evidence-gate-layers",
  "type": "refactor",
  "scope": "norms,rules,scripts,skills,knowledge",
  "status": "published",
  "baseBranch": "main",
  "branch": "refactor/20261012-refactor-evidence-gate-layers",
  "files": [
    ".github/workflows/quality-gate.yml",
    "knowledge/contract-probe.md",
    "knowledge/domain-driven-shadow-dev.md",
    "menu.md",
    "norms/domain-model.md",
    "norms/verification.md",
    "package.json",
    "rules/iron-laws.md",
    "scripts/check-brief.mjs",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-refactor-evidence-gate-layers/brief.md",
    "shadow-docs/domain.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md",
    "skills/shadow-dev-review/SKILL.md",
    "test/brief-gate.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 51,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/51"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "16e4e74e78d358976b5142cd1f3705abea7d1725",
    "verifiedAt": "2026-10-12T04:38:17.945Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:51",
    "planHash": "f4c5cb13623e9ce1e4cd5b164092dbfb3d39638a4b017410718be1e2a97ac41d",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".github/workflows/quality-gate.yml",
        "knowledge/contract-probe.md",
        "knowledge/domain-driven-shadow-dev.md",
        "menu.md",
        "norms/domain-model.md",
        "norms/verification.md",
        "package.json",
        "rules/iron-laws.md",
        "scripts/check-brief.mjs",
        "shadow-docs/changes/20261012-refactor-evidence-gate-layers/brief.md",
        "shadow-docs/domain.md",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-propose/SKILL.md",
        "skills/shadow-dev-review/SKILL.md",
        "test/brief-gate.test.mjs"
      ],
      "message": "refactor(workflow): 证据门分层——不变量作规格、探针作门槛、断言优先限 L 级取证策略",
      "title": "[refactor] 证据门分层：不变量作规格、探针作门槛、断言优先作 L 级取证策略",
      "body": "复盘裁决：2026-10-11 一刀切取消测试门槛时，误把唯一不由执行者解释的裁判一起砍了。本变更把职责拆成三层——规格层（brief 领域模型段的 INV-n 不变量与结果段对账表，由新增 scripts/check-brief.mjs 机器判定）、门槛层（guard 探针必须绿；regression 探针在该仓 CI 实测耗时 ≤ 60s 时必须绿）、取证层（先写失败断言降格为 L 级可选取证策略 assert-first，四条触发判据）。先红记录、6 类拒绝路径观察点与 regression 红灯归因见 brief「结果」段。"
    },
    "commit": {
      "files": [
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-refactor-evidence-gate-layers/brief.md"
      ],
      "message": "docs(shadow): 登记在途 change 进变更台账并补 brief 半状态留痕（CI 台账门归因修复）"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/contract-probe.md",
    "reason": "\"分层门槛（guard必须绿·regression按60s实测成本）与断言优先四条判据属长期有效事实；本仓实测的夹具半读教训必须沉淀为第四则\""
  }
}
---

# 证据门分层：不变量作规格、探针作门槛、断言优先作 L 级取证策略

## 动机
2026-10-11 的「完全干掉 TDD」把三件可分的事一起砍了：①先写失败测试的仪式（该砍）②凑覆盖率与为一次变更新建测试（该砍）③既有套件绿作为合并前置（**不该砍，被误砍**）。复盘实证：

- 砍掉 ③ 后，本工作流**只剩自证**——观察点表由执行者自己写、自己核对，没有「红」这种不由 AI 解释的裁判。今天 `shadow-dev-cli` PR #54 一边宣布「套件绿不是门槛」，一边又新写 2 条回归断言才敢发；唯一 fail（bash 命中 WSL 桩）被「归因为环境噪声」放行。制度说别写、直觉说必须写，说明 ③ 仍承重。
- 规范文本已宣布门槛废除，`.github/workflows/quality-gate.yml` 最后一步仍是 `npm test` 且是 blocker——**文档一套、机器另一套**，外部宿主迟早拿这个打架。
- `scripts/` 下没有任何脚本检查 L 级 brief 的「## 领域模型」段与观察点对账：`rules/iron-laws.md` §7 全靠 review 散文自觉执行。**DDD 侧唯一的门是散文。**
- 同一条 norm 自相矛盾：`norms/verification.md`「契约探针三则」第 1 条说绿不构成完成证据，L 级行与 §1 又写「或 CI 全绿链接」——逃逸口与本仓复盘 P1-3 同源。

裁决（2026-10-12 用户确认）：结合使用。规格层单源不变（不变量是唯一验收对象），门槛层恢复机器判定，TDD 的红→绿降格为**由复杂度判据触发的可选取证策略**。

## 复杂度评级
- **评级:** L
- **理由:** ①**契约变更**——改写合并放行的判据本身（`verification.md`、`iron-laws.md` §1/§7、新增 CI 门），并新增公开名词与 brief 格式约束，所有后续 change 的取证口径随之改变；②**触及面**——碰 `scripts/` 新机器门 + CI 工作流 + 三个执行层技能 + 两张知识卡，是本仓对外的分发入口；③**可发现性**——门写错会让后续每个 change 集体判红或集体放行，要到下一次 CI 才炸。
- **期望验证深度:** runtime
- **取证策略:** assert-first（本 change 自证：为 `check-brief.mjs` 先写失败断言再实现，断言留在既有套件 `node --test`，指名 INV-1/INV-2/INV-6）

## 领域模型

- **限界上下文:** `workflow-governance` — 开发流程治理：规范、技能、知识路由、brief 生命周期与质量门禁语义。上游 `execution-layer`（CLI 提供 deterministic 命令）；下游各项目 `shadow-docs/` 与三宿主绑定。反腐边界：本上下文不规定 CLI 内部实现与代码风格，也不改 `shadow-dev-cli` 一行代码。
- **统一语言增量:**
  - **门槛层 gate**：合并放行的机器判定，二值、不由执行者解释。
  - **guard 探针**：指名某条不变量的可重复机检命令（`scripts/check-*.mjs`）。
  - **regression 探针**：既有自动化套件（`npm test`）。
  - **断言优先 assert-first**：L 级满足触发判据时，先写失败断言再实现；断言留在既有套件并指名其不变量。这是唯一保留的旧 TDD 形态，且是**选项不是默认**。
  - **取证策略 evidence-strategy**：`assert-first | observation`，propose 时随评级一并批准。
  - **`INV-n` 编号**：brief「聚合与不变量」清单的机器可引用标识，对账表的行键。
- **聚合与不变量:**
  - `INV-1 brief-contract`：L 级 brief 必含「## 领域模型」段且不变量清单非空且每条带 `INV-n`；违规时 `scripts/check-brief.mjs` 必须判红并定位到文件与条目。
  - `INV-2 reconciliation-closure`：每条声明的 `INV-n` 必须在 brief「## 结果」段出现观察点行，或显式标注「证据缺口」；未闭合即判红。
  - `INV-3 gate-not-void`：放行判据＝观察点闭合 ∧ guard 探针绿 ∧ regression 探针在「CI 实测成本 ≤ 60s」的仓里绿；任一缺失只能由 brief 显式记为证据缺口，不得静默免除。
  - `INV-4 assert-first-bounded`：仅 L 级且 `取证策略: assert-first` 允许新建/追加套件断言，且 brief 须指名其钉住的 `INV-n`；S/M 级新建 `test/*.mjs` 判红——防仪式复辟。
  - `INV-5 no-green-substitution`：规范文本不得以套件绿代替观察点，也不得把 CI 绿灯链接列为 L 级观察点的合法替代（禁项命中判红并定位 文件:行号）。
  - `INV-6 no-retroactive-red`：门的作用域是在途与新 brief；`shadow-docs/changes/archive/` 与卡片 `source` 块永不追溯判红（历史路径内嵌被禁字样会让引用它做来源的卡集体判红，本仓 CI run 38129218771 实证）。
  - `INV-7 single-context`：本 change 只改 `workflow-governance`；`execution-layer` 的仓内口径由后继 change 落 `shadow-dev-cli`，不在本仓顺手改。
- **领域事件:** propose 确认时取证策略定稿（此后升/降级须先修订 brief）；`check-brief` 判红时 release 阻塞且指针不动；review passed 时知识影响终判并进 release 末段归档。

## 引用规范
- `knowledge/contract-probe.md`
  - 当前结论: 观察点与契约探针分工；绿不是完成证据、红必须归因、新增机检走 `scripts/`。
  - 适用 scope: `norms/verification.md`、`scripts/`、`test/`、`.github/workflows/`
- `knowledge/domain-driven-shadow-dev.md`
  - 当前结论: 领域模型与不变量是规格载体，不是测试；撤掉旧仪式不等于撤掉规格。
  - 适用 scope: `norms/domain-model.md`、`norms/verification.md`、propose/apply/review
- `norms/domain-model.md`
  - 当前结论: 「## 领域模型」段格式与按评级必填规则；不变量必须可观察。
  - 适用 scope: brief 正文、propose 领域对齐轮

## 决策
- **选型:** 分层合并——规格层（不变量＋对账表，唯一验收对象）／门槛层（guard＋regression 二值机器判定）／取证策略层（L 级可选 assert-first，其余 observation）。新增 `scripts/check-brief.mjs` 把规格层从散文变成门。
- **对比方案:**
  - 全量回退旧制度（恢复默认先红与套件门槛）：否——仪式成本是真实痛点的来源，且回归测试无法表达「指针不动 / 无半成品 / 旧路径不可回退」这类时序状态断言，那恰是 DDD 侧更强的地方。
  - 维持现状（纯 DDD＋散文门槛）：否——留下三个可当场证伪的矛盾（文档废门、CI 守门；§1 与探针三则互相矛盾；§7 无机器判定），AI 代理会拿最省事的绿冒充完成。
  - 只补文字口径不加门：否——没有 `INV-n` 对账的机器判定，下次会话仍靠自觉，矛盾会以新措辞重新长出来。
- **理由:** 把「绿不是完成证据」（认识论，保留）与「绿不是合并门槛」（操作，撤销）拆成两句写。按仓分口径而非一刀切：本仓是「规范即产品」、runtime 面薄，regression 成本低但断言面窄；`shadow-dev-cli` 是真代码＋既有套件在阈值内，必须保留绿门槛——该差异用「CI 实测成本 ≤ 60s」这一条判据统一表达，不引入「按仓库类型豁免」的第二套语言。

## 任务
### Phase 1 口径与格式（规格层）
- [x] 改写 `norms/verification.md`：拆「完成证据 / 合并门槛」；探针分层 guard｜regression 与 60s 成本判据；删除 L 级以 CI 绿灯链接充当观察点的写法，改为「证据缺口＋CI run 作补充」；新增「取证策略」节与 assert-first 触发判据；沿革追加 2026-10-12 裁决 — `norms/verification.md`
- [x] 铁律随改：§1 放行判据三条化并保留强度与评级匹配不可议；§7 加 `INV-n` 编号与对账闭合要求 — `rules/iron-laws.md`
- [x] `norms/domain-model.md`：不变量清单格式改为 `- \`INV-n 聚合\`：断言`；新增「取证策略」必填（L 级）与「结果」段对账表格式 — `norms/domain-model.md`
### Phase 2 机器门（门槛层）
- [x] 先写失败断言（assert-first 自证）：`check-brief` 的判红/判绿与拒绝路径断言，指名 INV-1/INV-2/INV-6 — `test/brief-gate.test.mjs`
- [x] 实现 `scripts/check-brief.mjs`：git 枚举在途 brief → 领域模型段存在性、不变量清单非空与编号合法、对账闭合、取证策略取值、S/M 级新建套件断言判红；判红只读盘不改盘、退出码非零 — `scripts/check-brief.mjs`
- [x] 接入本机门：`check:brief` 脚本，并进 `ci` 串 — `package.json`
- [x] 接入 CI：新增「brief 契约门」step；`--forbid` 追加被废除的替代措辞 — `.github/workflows/quality-gate.yml`
- [x] 存量兜底：对全部在途 brief 实跑，确认历史 brief 不被追溯判红（INV-6），必要时把旧 brief 的缺失记为「 grandfathered」白名单并在门输出里点名 — `scripts/check-brief.mjs`
### Phase 3 执行层与知识
- [x] propose 的 brief 模板加 `INV-n` 编号、`取证策略` 行与对账表骨架；领域对齐轮第 3 问补「该不变量可否用套件断言机检」以驱动策略选择 — `skills/shadow-dev-propose/SKILL.md`
- [x] apply 口径：放行判据三条；进度线不变量粒度改 `▶ [inv] n/N INV-x`；仅 `取证策略: assert-first` 时先写失败断言 — `skills/shadow-dev-apply/SKILL.md`
- [x] review 口径：对账以 `check-brief.mjs` 输出为准；退回条件补「实际取证与批准的策略不符」 — `skills/shadow-dev-review/SKILL.md`
- [x] 更新两张卡（含 #50 欠的登记未落地项）：`contract-probe.md` 改分层门槛与 assert-first 边界；`domain-driven-shadow-dev.md` 改 `INV-n` 与机器门 — `knowledge/contract-probe.md`
- [x] 术语登记与路由随检：`shadow-docs/domain.md` 关键术语补 门槛层｜guard｜regression｜断言优先｜取证策略；确认 `menu.md` 路由仍覆盖两张 active 卡 — `shadow-docs/domain.md`
- [x] 四门本机全绿 + `check-brief` 自身断言绿后收口，交 review — `shadow-docs/changes/20261012-refactor-evidence-gate-layers/brief.md`

## 结果
- 实际耗时: 约 35 分钟（口径分析 1 轮；门与夹具 4 轮返工——模板字符串转义 2 次、夹具格式 1 次、码位格式 1 次；规范与技能改写 3 轮；门禁实跑 5 道）
- 验证: **L 级 · 取证策略 assert-first · 三条放行判据**逐条对账

| 不变量 | 观察点 |
|---|---|
| `INV-1 brief-contract` | 观察点（拒绝路径）：夹具 L 级缺段 → 门输出 `✗ MISSING_DOMAIN_MODEL shadow-docs/changes/20261012-refactor-x/brief.md` 且 rc=1；条目缺编号 → `BAD_INV_FORMAT`；编号重复 → `DUPLICATE_INV`。观察点（正例）：`npm run check:brief` → `[.] …/20261012-refactor-evidence-gate-layers/brief.md 评级=L status=branched 不变量=7`，`fail=0` |
| `INV-2 reconciliation-closure` | 观察点（拒绝路径）：夹具 `status=published` 且「结果」段为空 → `✗ UNRECONCILED INV-1` 与 `✗ UNRECONCILED INV-2`，rc=1。观察点（正例）：同夹具补两行（一行写「观察点」、一行写「证据缺口」）→ rc=0；阶段边界另测 `status=branched` 不追对账 → rc=0 |
| `INV-3 gate-not-void` | 观察点（三条放行判据实跑）：`npm run check:version` rc=0 · `npm run check:requires:strict` rc=0 · `npm run check:brief` rc=0 · `npm run check:knowledge -- --forbid <集合>` rc=0 · `npm test` → `ℹ tests 20 / pass 20 / fail 0` rc=0。**regression 红灯归因**：node_repl 子进程通道下 `npm test` 出 2 红（`test/install-cli.test.mjs` 与 `test/pack.test.mjs` 文件级加载失败，报「可信 bash 未找到」，只探到 `System32\bash.exe` 与 `WindowsApps\bash.exe` 两个 WSL 入口桩）；同一工作副本在 `exec_command` 通道下 20/20 绿 rc=0 → 判定为通道 PATH 差异导致的**环境噪声，非本次改动回归**。按本变更新增纪律：噪声归因不解除门槛，故另记**证据缺口**＝该通道不可复现 regression，补充观察点为 PR 的 quality-gate CI run（Linux runner，bash 真实可用） |
| `INV-4 assert-first-bounded` | 观察点：`ASSERT_FIRST_NEEDS_L`（S 级 + `files: [test/newone.test.mjs]` → rc=1）、`BAD_EVIDENCE_STRATEGY`（取值 `red-green` → rc=1）、`ASSERT_FIRST_NEEDS_STRATEGY`（L 级含套件文件但策略非 assert-first → rc=1）三条断言绿。**先红记录**：门实现前 `node --test test/brief-gate.test.mjs` 全红 `exit=1 Cannot find module 'scripts/check-brief.mjs'`，实现后 9/9 绿——assert-first 顺序在本变更自身跑通 |
| `INV-5 no-green-substitution` | 观察点：`norms/verification.md` L 级行的 CI 链接替代写法与 `rules/iron-laws.md` §1 的「或 CI 全绿」已删，两处改为「证据缺口＋补充观察点」；`.github/workflows/quality-gate.yml` 的 `--forbid` 追加该被废除措辞后，`npm run check:knowledge` **首次 rc=1**：`[fail] 残留 token 出现在 knowledge/contract-probe.md:12`——门当场抓到执行者自己在新卡正文里逐字复现了禁项；改写为不逐字复现后 rc=0 |
| `INV-6 no-retroactive-red` | 观察点：夹具在 `changes/archive/` 放一份不合规 brief → 门 rc=0 且输出不含该名字（断言 `doesNotMatch`）；真实仓 `npm run check:brief` → 2 份生效前在途 brief 以 `[!] GRANDFATHERED …` 点名、`warn=2 fail=0`，其 status 由 JSON frontmatter 正确读为 `committed`（豁免是显式留痕，不是静默跳过） |
| `INV-7 single-context` | 观察点：`git diff --stat` 改动面全在 `workflow-governance` scope（`norms/`、`rules/`、`skills/`、`knowledge/`、`scripts/`、`test/`、`.github/`、`package.json`、`menu.md`、`shadow-docs/domain.md`），`shadow-dev-cli` 仓零改动；跨上下文部分登记为下方遗留第 2 条 |
| 门的自我防线 | 观察点（本变更最大的一次真实返工）：真实 brief 的 frontmatter 是 `shadow-dev/v1` **JSON**，初版门按 YAML 行匹配解析 → **9 条断言全绿而门在真实仓静默半读**（status 读成默认 `draft`、files 读成空集）。修正为 JSON 解析 + 夹具与真实序列化路径同构 + 新增 `BAD_FRONTMATTER` 判红断言。教训写入 `knowledge/contract-probe.md`「夹具必须与真实产物同构」 |

- 半状态留痕（本仓 CLI 1.5.0 实测）：`release execute` 走完 commit（`2822036`）与 push 后，在 PR 段以 `GITHUB_TOKEN_REQUIRED` exit=3 中断——凭证检查发生在写操作之后，留下「已推送无 PR」。据此改用 `publish plan/execute` 补 PR，凭证由本机 `gh auth token` 注入子进程环境、不落盘不回显。这正是 `shadow-dev-cli` PR #54「凭证前置」要根治的形态，已在该仓登记。
- 台账偏差：CI 6/6 判红实证——在途 brief 进 git 后必须由 `index rebuild` 登记台账条目（#50 新增的变更台账一致性门），本机因当时目录仍未跟踪而漏检。同 `menu.md` 处理方式：手工把 `shadow-docs/INDEX.md` 补入 files 并跑门。
- 偏差记录：`menu.md` 未在立项 `--files` 内（路由关键词与硬规则 8 须随门更新）。CLI 1.5.0 无 `change amend`（其能力声明仍待后继发版），故手工把 `menu.md` 补入 frontmatter `files` 并在此留痕，不改 status/checkpoint 等由 CLI 持有的字段。

## 遗留与后续

1. **制度名正名未完成（另立 docs change）**：SDD 才是制度名，而 `knowledge/domain-driven-shadow-dev.md` 与 `norms/domain-model.md` 的文件名仍主张「领域驱动」。本 change 只在正文与 keywords 更正——机制改动与改名混在一次会让 review 无法分辨是机制错还是链接错；改名牵动 `menu.md` 路由、卡片互链与 `source` 历史路径，须单独走并跑死链扫描。
2. **`shadow-dev-cli` 仓口径落地（跨上下文后继）**：按「CI 实测耗时 ≤ 60s」恢复 regression 绿门槛，并处理其测试通道下 `bash` 命中 WSL 桩的问题（当前 PR #54 有 1 条 fail 属此类）。
3. **工具环境债**：node_repl 子进程通道无可用 bash 解析，应按 `knowledge/contract-probe.md` 的处置顺序显式给 `SHADOW_DEV_BASH`；不在本 change 顺手修。
4. `GRANDFATHERED` 名单须在两份历史 brief 归档后删除（只减不增）。

## 知识评估
- **预期影响:** 更新
- **候选卡片:** `knowledge/contract-probe.md`、`knowledge/domain-driven-shadow-dev.md`
- **理由:** 分工结论从「探针不是门槛」改为「探针分层且 regression 在低成本仓仍是门槛」，并新增唯一保留的断言优先形态；不新建卡——两张 existing 卡已持有该 scope，新建会造成同一不变量两处定义。跨仓 `execution-layer` 口径登记为后继 change（INV-7）。
