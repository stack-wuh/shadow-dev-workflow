---
{
  "schema": "shadow-dev/v1",
  "name": "20261011-refactor-kill-tdd-verification",
  "type": "refactor",
  "scope": "workflow-governance",
  "status": "committed",
  "baseBranch": "main",
  "branch": "refactor/20261011-refactor-kill-tdd-verification",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".github/workflows/publish-release.yml",
    ".github/workflows/quality-gate.yml",
    "CLAUDE.md",
    "README.md",
    "knowledge/contract-probe.md",
    "knowledge/domain-driven-shadow-dev.md",
    "menu.md",
    "norms/knowledge-cards.md",
    "norms/verification.md",
    "package.json",
    "rules/behavior.md",
    "rules/iron-laws.md",
    "scripts/check-knowledge.mjs",
    "shadow-docs/changes/20261011-refactor-kill-tdd-verification/brief.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-hotfix/SKILL.md",
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
    "verifiedCommit": "b39dd059e8f7db144a7bcaee4e30005b7cecdd13",
    "verifiedAt": "2026-10-11T09:25:55.351Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "45311e0cf20f0edae622d414ab9536f63f36eeb4",
    "planHash": "8b7f7757c7623a6cf1236e6705b51e419adb6b13cfb7bc59b5a02c1feb73be72",
    "updatedAt": null,
    "lastError": null,
    "commit": {
      "files": [
        "shadow-docs/changes/20261011-refactor-kill-tdd-verification/brief.md"
      ],
      "message": "docs(shadow): 重算 PR 前 planHash"
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        ".github/workflows/publish-release.yml",
        ".github/workflows/quality-gate.yml",
        "CLAUDE.md",
        "README.md",
        "knowledge/contract-probe.md",
        "knowledge/domain-driven-shadow-dev.md",
        "menu.md",
        "norms/knowledge-cards.md",
        "norms/verification.md",
        "package.json",
        "rules/behavior.md",
        "rules/iron-laws.md",
        "shadow-docs/changes/20261011-refactor-kill-tdd-verification/brief.md",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-hotfix/SKILL.md",
        "skills/shadow-dev-propose/SKILL.md",
        "skills/shadow-dev-review/SKILL.md"
      ],
      "message": "refactor(norms): 彻底去 TDD——验收对象统一为不变量，既有套件降格为契约探针",
      "title": "20261011-refactor-kill-tdd-verification",
      "body": ""
    }
  },
  "knowledge": {
    "action": "新增",
    "target": "knowledge/contract-probe.md",
    "reason": "新增「契约探针与观察点的分工」卡（探针绿不构成完成证据、红必须归因、进 CI 须指名不变量、新机检走 scripts/ 而非测试文件，含环境噪声四形态与处置顺序）；原位更新 domain-driven-shadow-dev（测试降格为探针、禁止以探针绿代替观察点）、norms/verification.md（M/L 达成方式与契约探针三则、报数单位）、norms/knowledge-cards.md（unit 重定义为可重复机器探针）、menu.md、README、CLAUDE、rules/iron-laws.md §1/§2、rules/behavior.md §4/§7/§9、四个 skills；并把已废除的旧门槛措辞纳入两条 CI 流水的 --forbid 集合。证据：全仓旧措辞 0 命中、拒绝路径实测门抓到卡片自引用并退出码 1（修正后复绿）、check:version/requires:strict/knowledge 三门全绿、探针 pack 4/4 + install-cli 7/7、产物 v6.9.0 含新卡与改名后规范、YAML 可解析。"
  }
}
---

# 彻底去 TDD：验证对象统一为不变量，测试降级为可选契约探针

## 动机

2026-10-09 的裁决只砍掉了「先红仪式」，20261010 的领域驱动改造把验收对象改成了不变量——但**规范文本里 TDD 的骨架还在**，并且正在按旧惯性指挥执行者。用户 2026-10-11 明确裁定：「给我去掉所有的 TDD，我现在已经完全干掉 TDD 转向 DDD 了。」

本轮实测就是这条旧惯性的代价：为了「108 条用例全绿」这个并不服务于验收的目标，在一个已经改成不变量验收的流程里烧掉约 30 分钟——而真正证明四条不变量的是 7 步端到端真实命令输出（不到 1 分钟）。更糟的是取证本身不可靠：本机 node 139 段错误风暴会把 `spawnSync` 打成 `null` 状态，全量套件在越权（有网）环境下静默挂死、在沙箱内 27 条 23 秒跑完，`tty` 会话又会让 `runTty` 继承父 stdin 永久阻塞——**四种表现完全同形：无输出**。把「套件全绿」当门槛，等于把验收权交给一台机器的抖动。

`origin/main`（v6.8.0）上仍活着的测试义务，逐条：

| 位置 | 现行措辞 | 性质 |
|---|---|---|
| `norms/verification.md:29` | M 级＝「冒烟命令 + **既有测试保持绿** + 走查；触及既有契约时更新既有断言（属维护，不算新增测试）」 | 门槛仍挂在测试上 |
| `norms/verification.md:32` | 「不为新 change 默认新建测试文件。需要长期钉住某条不变量时才写…」 | 仍在用「写测试」描述机检手段 |
| `norms/verification.md:33` | 「**既有测试必须保持绿色**——取消 TDD 不等于取消跑测试」 | 一刀切绿门槛 |
| `norms/verification.md:35` | 「过度验证同样阻塞：S 级写测试、为凑覆盖率补断言、M 级新建测试文件」 | 反面表述仍在强化测试中心 |
| `norms/verification.md:42` | 开工报数「**测试总数 N**」 | 进度纪律以测试为单位 |
| `norms/verification.md:53` · `rules/iron-laws.md:16` · `rules/behavior.md:51` · `skills/shadow-dev-review/SKILL.md:17` | 「运行 Lint + 类型检查 + **相关测试**」 | 完成声明的证据口径 |
| `rules/behavior.md:30` | 「重构前后**既有测试必须通过**」 | 门槛 |
| `skills/shadow-dev-apply/SKILL.md:58` | M 级「…+ **既有测试保持绿** + 走查」 | apply 执行门 |
| `skills/shadow-dev-apply/SKILL.md:61` | 「不为『凑证据』新建测试：确需长期钉住某条不变量才写…」 | 措辞 |
| `skills/shadow-dev-hotfix/SKILL.md:59,74` | 「（必要时 `test/<文件>`）」、「既有自动化测试能覆盖就复用它，不为快修临时造测试」 | 快修仍以测试为默认手段 |
| `norms/knowledge-cards.md:60` | 深度 `unit` 定义＝「**自动化测试**通过」 | 深度阶梯本身以测试为单位 |

**目标形态（一句话）**：验收对象只有不变量；证据只有观察点；`npm test` 之类的既有套件降格为「契约探针」——它是否运行不再是门槛，**它红了必须能解释、绿了不能代替观察点**。

**非目标：** 不删除既有测试文件与 CI 里对它们的执行（它们是本仓产物契约与安装器的最便宜机检，属探针；删除等于自毁证据，违反 `rules/behavior.md` §6「不要删你不懂的东西」）；不改 `quality-gate.yml` 的门构成，只改**失败语义的表述**（从「必须绿」到「必须解释」）；不动 CLI 命令面与 `requiresCommands`。

## 复杂度评级

- **评级:** L
- **理由:** **契约变更**——所有后续 change 的验收口径与完成声明的证据定义被改写，`verified-depth` 的语义随之调整（存量卡片依赖它）；**触及面**——`norms/verification.md`、`norms/knowledge-cards.md`、`rules/iron-laws.md`、`rules/behavior.md`、4 个 skills、`menu.md`、`README.md`、`CLAUDE.md`、1 张跨项目卡，全部是跨项目共享规范；**可发现性**——规范文本改坏要等下一个真实 change 才暴露（比如门把「探针绿」误当观察点，或某人据新措辞把回归当环境噪声放过去）。
- **期望验证深度:** runtime（本轮可全量本机自证：文本门 + 一致性门 + 产物探针，拒绝路径为「旧措辞残留必须判红」）

## 领域模型

- **限界上下文:** `workflow-governance` — 开发工作流治理。上游 `execution-layer`（CLI，经能力契约），下游各项目 `shadow-docs/`。**反腐边界**：不改 pack 集合、hooks、宿主清单结构语义与 CLI 命令键。
- **统一语言增量:**
  - **契约探针 contract probe**：可重复执行的机器断言（既有套件、`scripts/check-*.mjs`、产物扫描）。它的绿只是信号，不构成完成证据；它的红必须归因为「真实回归」或「环境噪声」并写入 brief。
  - **观察点 observation point**（既有术语，语义收紧）：证明**某一条具体不变量**成立的真实证据。探针只有在能指到它覆盖的不变量时，才可充当该不变量的观察点。
  - **完成证据**＝不变量 × 观察点的对账表；不再是「套件全绿」。
- **聚合与不变量:**
  - `验证语义`：I1 每条 L 级不变量有观察点或有明确证据缺口；I2 探针绿**不得**单独作为完成声明；I3 探针红必须归因，未归因视为未验证；I4 强度与评级匹配仍不可议（唯一不让的门，措辞从测试改为观察点，语义不变）。
  - `规范引用一致性`：I5 全仓不得残留「既有测试必须保持绿」「测试总数 N」「运行…相关测试」这类以测试为门槛/单位的表述（新 `--forbid` 集合）；I6 active 卡与路由仍一致。
  - `知识深度`：I7 `unit` 定义改为「可重复机器探针通过」，枚举名不变（存量卡片不回溯迁移，按 `norms/knowledge-cards.md` 既有条款处理）。
- **领域事件:** 用户裁定（2026-10-11）→ 门槛语义变更落入规范；执行者据新规范拒绝以「套件绿」冒充「已验证」。

## 引用规范

- `norms/domain-model.md`
  - 当前结论: 不变量是验收对象、观察点是证据；只取四件概念工具，不为建模而建模。
  - 适用 scope: 全部改动
- `norms/verification.md`（本 change 的主改对象）
  - 当前结论: 分级制，强度与评级匹配不可议；L 级＝每条不变量一个可追溯观察点或 CI 链接。
  - 适用 scope: 门槛措辞与报数单位
- `norms/knowledge-cards.md`
  - 当前结论: `verified-depth ∈ code-read|unit|runtime|field`；runtime 须附可追溯观察点；存量卡片不回溯迁移。
  - 适用 scope: I7 定义调整（不改枚举名，避免全量迁移）
- `knowledge/domain-driven-shadow-dev.md`
  - 当前结论: 规格载体是领域模型与不变量，测试是证据手段之一。
  - 适用 scope: 结论强化为「测试文件不新增；既有套件降格为契约探针」
- `rules/behavior.md` §6 / §3
  - 当前结论: 不要删不懂的东西；不要碰没坏的代码。
  - 适用 scope: 决定保留测试文件与 CI 执行，仅改语义表述
- `knowledge/release-artifact-pipeline.md` · `knowledge/distribution-capability-contract.md`
  - 当前结论: 机器门禁止半绿、判红轮子不许同时打 ✓；能力缺失只能响亮阻塞。
  - 适用 scope: 新 `--forbid` 残留门必须由 `scripts/check-knowledge.mjs` 判红，不得只提示
- `scripts/check-knowledge.mjs`（本仓门）
  - 当前结论: 支持 `--forbid 'a,b'` 残留判定，非零退出。
  - 适用 scope: I5 的执法方式——把旧门槛措辞纳入 CI forbid 集合

## 决策

- **选型:** A. **保留证据资产，废除门槛语义**，并把旧措辞变成机器禁项。
  1. `norms/verification.md`：M 行改为「冒烟命令 + 被触及不变量的观察点 + 走查」；「既有测试必须保持绿色」替换为**契约探针三则**（探针是否运行不是门槛；探针绿不构成完成证据；探针红必须归因写入 brief，未归因＝未验证）；删除「不为新 change 新建测试文件」的测试中心表述，改为「机检需求一律写成 `scripts/` 下可重复探针，且必须指明它钉哪条不变量，否则不进 CI」；报数单位「测试总数 N」→「探针与命令总数 N」；完成声明证据口径「相关测试」→「与本次不变量相关的探针/真实命令」。
  2. `rules/iron-laws.md`：§1/§2 措辞同步；§1 的「一刀切强制测试同样违规」并入 I3 表述。
  3. `rules/behavior.md`：§4 去掉「重构前后既有测试必须通过」，改为「重构前后被触及不变量的观察点必须一致成立」；§7/§9 的「相关测试」「跳过测试」改探针口径。
  4. 4 个 skills：apply §5（M 行 + 那段「不为凑证据新建测试」）、review §1/§8、hotfix 59/74 行、propose 模板的「期望验证深度」注释与取证叙述——统一到探针/观察点词汇表。
  5. `norms/knowledge-cards.md`：`unit` 定义改为「可重复机器探针通过（命令、断言脚本或既有套件，不特指测试框架）」，枚举名保留。
  6. **执法**：把旧门槛措辞纳入 CI 的 forbid 集合——`quality-gate.yml` 与 `publish-release.yml` 的 `--forbid` 追加「既有测试保持绿」「测试总数」两项，从此这些措辞一出现就判红。
  7. `menu.md` 验证策略关键词补「契约探针 观察点 归因」，README/CLAUDE 的机器门表把 `npm test` 标注为「产物与安装器契约探针（红必须归因）」。
- **对比方案:**
  - **B. 连测试文件与 CI 里的 `npm test` 一起删**：未选。`test/pack.test.mjs` 断言的是**产物契约**（清单齐全、三 manifest 版本对齐、开发产物不入包），`test/install-cli.test.mjs` 断言安装器与 hook 包装行为——它们是分发上下文的不变量探针，不是业务 TDD。删掉等于自毁最便宜的一层证据，且违反「不要删你不懂的东西」。若你明确要求删除，我按破坏性操作单独确认后执行。
  - **C. 只改文字、不加 forbid 门**：未选。本轮已经证明「写了但不执法的规范会被执行者自己漏掉」（同一夜我漏登记两次 `task set`、漏声明两个 manifest，都被机器门当场抓到）。
  - **D. 把深度枚举 `unit` 改名（如 `probe`）**：未选。存量卡片与 `norms/signals.md` 共用这套枚举，改名要全量迁移，而「存量卡片不回溯迁移」正是既有规范；改定义不动名字即可。
- **理由:** 你要的不是「没有测试文件」，而是**别再拿测试当验收**。所以门槛语义清零、证据资产留下、旧措辞变成机器禁项——三件事一起做，缺一条就会退回原状。

## 任务

### Phase 1 — 门槛语义清零
- [x] 验证规范改写 — `norms/verification.md` — M 行去「既有测试保持绿」；插入「契约探针三则」替换原测试中心两行；报数单位改「探针与命令总数 N」；完成声明证据口径改探针/真实命令；「过度验证」条改写
- [x] 铁律与行为准则对齐 — `rules/iron-laws.md`, `rules/behavior.md` — §1/§2 措辞、§4「重构前后不变量观察点一致」替代「既有测试必须通过」、§7/§9 测试口径改探针口径
- [x] 四个技能同步 — `skills/shadow-dev-apply/SKILL.md`, `skills/shadow-dev-review/SKILL.md`, `skills/shadow-dev-hotfix/SKILL.md`, `skills/shadow-dev-propose/SKILL.md` — apply §5 与「不为凑证据新建测试」段；review §1/§8；hotfix 59/74；propose 模板取证与深度注释
### Phase 2 — 定义与执法
- [x] 深度定义调整 — `norms/knowledge-cards.md` — `unit` 重定义为可重复机器探针通过；枚举名不变并写明「存量卡片不回溯迁移」仍适用
- [x] 措辞禁项进门 — `scripts/check-knowledge.mjs`, `.github/workflows/quality-gate.yml`, `.github/workflows/publish-release.yml` — 确认 `--forbid` 生效路径，CI forbid 集合追加「既有测试保持绿,测试总数」；新增一条拒绝路径证据
- [x] 知识卡与路由口径 — `knowledge/domain-driven-shadow-dev.md`, `menu.md`, `README.md`, `CLAUDE.md` — 卡内「测试降级为证据手段之一」改写为「机检以契约探针存在，绿不构成完成证据」；菜单关键词补契约探针/归因；机器门表标注探针语义
### Phase 3 — 收口
- [x] 版本与取证 — `package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `shadow-docs/changes/20261011-refactor-kill-tdd-verification/brief.md` — `bump-version.mjs 6.9.0`（三处同源）；`npm run check:version` / `check:requires:strict` / `check:knowledge --forbid '<旧门槛措辞>'` 全绿；拒绝路径：临时把一句旧措辞写回 `norms/verification.md` → forbid 判红后回滚；`npm test` 作为产物探针跑一遍并记录（红则归因）

## 结果

- 实际耗时: ≈25 分钟（对照：上一条 CLI change 为「套件全绿」烧掉约 30 分钟却没有多证明任何东西——这正是本次裁定的实证成本）
- 验证: **L 级＝每条不变量一个观察点**，全部真实命令输出：

| # | 不变量 | 观察点 |
|---|--------|--------|
| I1/I3/I4 强度口径 | M/L 达成方式已改为观察点，探针绿不等于完成 | `norms/verification.md`「不变量与观察点」表 M 行现文：`冒烟命令 + 每条被触及不变量一个观察点 + 走查`；新增「契约探针三则」节（绿不是证据 / 红必须归因 / 进 CI 须指名不变量） |
| I2 探针不得代替观察点 | 三处执行文本同步收口 | `skills/shadow-dev-apply/SKILL.md` §5 引言现为「既有套件与 `scripts/check-*.mjs` 都只是契约探针——绿不是完成证据，红必须归因」；`shadow-dev-review` 第 8 维新增「以套件全绿代替观察点即退回」 |
| I5 旧措辞零残留（**执法**） | 全仓扫描：`grep -rn '既有测试保持绿\|既有测试必须\|测试总数 N\|相关测试'`（排除 `.git`/`shadow-docs`/`dist`/`.github`）→ **命中 0 处** |
| I5 拒绝路径 | 门抓到我自己：卡片初稿逐字引用了禁项串，`--forbid '既有测试保持绿,测试总数,相关测试'` → `[fail] 残留 token「既有测试保持绿」出现在: knowledge/contract-probe.md`、**退出码 1**；改为「禁项字符串只存在于 `.github/workflows/*.yml`」后复测 → `摘要: fail=0`、**退出码 0** |
| I6 引用与路由一致 | `node scripts/check-knowledge.mjs` → `摘要: ok=11 warn=4 fail=0`；新卡 `knowledge/contract-probe.md: domain「workflow-governance」∈ 地图值域`；52 文件零死链、孤儿规范 0、技能 8 个 frontmatter 一致 |
| I7 深度定义 | `norms/knowledge-cards.md` 的 `unit` 现为「可重复机器探针通过（既有套件、`scripts/check-*.mjs`、产物扫描皆算，不特指测试框架）」；枚举名不变，存量卡片不需迁移（warn 4 条即豁免项，未掩盖） |
| 其余三门 | `check:version` → `✓ 三处 manifest 版本同源: 6.9.0（3 个文件）`（`bump-version.mjs 6.9.0` 写入三处）；`check:requires:strict` → `declared=29 skills-referenced=21 undeclared=[] cli-catalog=46 catalog=resolved strict=on ✓`；两份 workflow YAML `ruby -ryaml` 可解析 |
| 产物探针（按新规：跑但不当门槛） | `node --test test/pack.test.mjs` → `# tests 4 # pass 4 # fail 0`；`node --test test/install-cli.test.mjs` → `# tests 7 # pass 7 # fail 0`（沙箱内）；`node scripts/pack.mjs` → `shadow-dev-workflow-v6.9.0.tar.gz`，新卡与 `norms/verification.md` 均在包内、`skills=8` |

- 交付: 待 push / PR（base＝main）

## 知识评估

- **预期影响:** 新增 + 更新（已落）
- **候选卡片:** `knowledge/contract-probe.md`（**新增**：契约探针 vs 观察点的分工、红必须归因、环境噪声四形态与处置顺序、取证成本即信号）、`knowledge/domain-driven-shadow-dev.md`（原位更新：测试降格为探针、禁止以探针绿代替观察点，追加 source 与 verified-scope）、`norms/verification.md`（主改）、`norms/knowledge-cards.md`（`unit` 重定义）、`menu.md`（验证策略路由补契约探针/归因/假绿关键词并挂新卡）、`README.md` · `CLAUDE.md`（门=探针口径）
- **理由:** 「套件绿不是完成证据、红必须归因、新机检写成 `scripts/` 命令而非测试文件」是可跨项目复用的执行真相（任何带既有套件的仓库都会遇到「绿了但没证明什么」），独立成卡；「测试降格」是对既有 `domain-driven-shadow-dev.md` 结论的加强，按「能更新不新增」原位处理。**`verified-depth` 如实记 `runtime`**：拒绝路径与全部门禁都在本机真实命令下复现（含门抓到卡片自引用那次判红）。

## 知识评估

- **预期影响:** 更新 + 新增
- **候选卡片:** `knowledge/domain-driven-shadow-dev.md`（原位更新结论与执行约束：门槛清零、探针三则、追加 source）、`norms/verification.md`（主改对象）、`norms/knowledge-cards.md`（`unit` 定义）、新增 `knowledge/contract-probe.md`（跨项目事实：**契约探针 vs 观察点**的分工与「绿不构成完成证据、红必须归因」纪律）
- **理由:** 探针/观察点的分工是跨项目可复用的执行真相（任何有既有套件的仓库都会遇到「套件绿了但没证明什么」），值得独立成卡；而「测试不再是门槛」是对既有 `domain-driven-shadow-dev.md` 结论的**加强**，按「能更新不新增」原位处理。`verified-depth` 依 Phase 3 实测填写，未达到的深度不虚报。
