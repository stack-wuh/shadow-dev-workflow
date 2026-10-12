---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-build-gate-reproducibility",
  "type": "build",
  "scope": "scripts/,test/,shadow-docs/signals.md,package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json",
  "status": "archived",
  "baseBranch": "main",
  "branch": "build/20261012-build-gate-reproducibility",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "scripts/check-knowledge.mjs",
    "scripts/resolve-bash.mjs",
    "shadow-docs/signals.md",
    "test/install-cli.test.mjs",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 50,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/50"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "d5d35eb9d110b644295d87785a1f5fef63e964e3",
    "verifiedAt": "2026-10-12T03:27:50.410Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:50",
    "planHash": "809eb661fe4bad763e162f54e8e685ee3fdb1ed86dcfc1f628db37750a40480a",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "scripts/check-knowledge.mjs",
        "scripts/resolve-bash.mjs",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-build-gate-reproducibility/brief.md",
        "shadow-docs/signals.md",
        "test/install-cli.test.mjs",
        "test/pack.test.mjs"
      ],
      "message": "build(gates): 质量门本机可复现 + 变更台账一致性门（v6.10.0）",
      "title": "build(gates): 质量门本机可复现 + 变更台账一致性门",
      "body": ""
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/contract-probe.md",
    "reason": "原位追加实证：「本机与 CI 结论分裂」属门自身缺陷而非可长期容忍的环境噪声，处置顺序是先固化成断言（ignored 过滤、可信 bash）再考虑登记信号；并把「进 CI 的探针必须指名不变量」在本仓多落一道——变更台账一致性（INDEX 条目集合 == 已跟踪 changes 目录集合）。补 verified-depth runtime 与本 change 为 source。"
  }
}
---

# 质量门本机可复现 + 变更台账一致性门

## 动机

20261012 复盘实测出三类结构性缺陷，全部指向同一件事：**门在 CI 上绿、在作者本机红，而门自己看不见台账漂移**。

1. **本机四门只有两门能跑绿。** `npm run check:knowledge` → `摘要: ok=10 warn=7 fail=1`，唯一 `[fail]` 是 `死链 .zcode/plans/plan-sess_*.md → scripts/shadow-dev.mjs`——`.zcode/` 在 `.gitignore` 第 3 行，`scripts/check-knowledge.mjs:130-134` 的 `walk()` 用 `readdirSync` 无过滤，把被 ignore 的本地会话产物读进引用扫描。同一缺陷在 `20261010-feature-workflow-context-map` brief 里已记为「门应跳过 ignored 路径」，至今未修，于是本机每次预检必红。
2. **`npm test` 在 Windows 上不是失败而是跑错解释器。** `test/pack.test.mjs:27`、`test/install-cli.test.mjs:33/133/143` 直接 `spawnSync('bash')`；本机 `Get-Command bash` 首命中 `C:\Windows\system32\bash.exe`（WSL 桩，未装子系统），解包步回 `rc=1` 并吐出 WSL 安装提示，症状与 pack 内容契约失败同形。讽刺的是 `hooks/hooks.codex.json` 的 `commandWindows` 早就写了「优先 `%ProgramFiles%\Git\bin\bash.exe`」的解析逻辑——同一台机器上 hook 找得到、测试找不到。`shadow-docs/signals.md` 的 SGN-010 已在 2026-10-10 退役，这个新形态没有登记，下一个执行者会当代码回归排查。
3. **变更台账没有门。** `scripts/check-knowledge.mjs` 全文不含 `INDEX`：没有任何断言覆盖「INDEX 条目集合 == `changes/` 与 `changes/archive/` 目录集合」，也没有覆盖「live 条目的状态列 == 对应 brief 的 `status`」。实证后果就是本次复盘抓到的 `20261012-refactor-flow-order-publish-stage` 已 merged 却不在 INDEX 里；而 #49 恰恰把「归档并入 release 末段」立成新流程，其第一次自证的证据（台账一致性）当时无法被机器判定。

目标：让四门在**干净 CI 与脏工作树的本机上结论一致**；让测试在缺可信 bash 时**响亮失败并给出归因**而不是漂成内容断言失败；把**台账一致性**固化成第五道机检。

**非目标：** 不改 CLI 命令面与 `requiresCommands`（本 change 零新命令键）；不动 hooks 自举逻辑与 `install-cli.sh` 语义；不改三份 manifest 除版本号外的任何字段；不处置 P1-3 的文档口径矛盾（`README` 手工发版命令、`或 CI 全绿` 逃逸口、`pack` 技能名单 7/9）——那是另一个 change。

## 复杂度评级

- **评级:** L
- **理由:** 契约变更——新增一道机检会改变所有后续 change 的验收面（CI 语义），且 `scripts/` 属 release tarball 内容，产物契约随版本 bump；触及面——三道门的实现本体（`check-knowledge.mjs`、`pack.test.mjs`、`install-cli.test.mjs`）+ 三份 manifest；可发现性——改坏立刻在 CI 与本机同时可见。按 `norms/verification.md` 三要素落 L。
- **期望验证深度:** runtime（每条不变量本机真实命令 + 真实输出，含拒绝路径；CI run 链接作交叉印证）

## 领域模型

- **限界上下文:** `workflow-governance` — 开发流程治理与质量门禁语义（`shadow-docs/domain.md` 登记的主目录含 `scripts/check-knowledge.mjs`、`shadow-docs/changes/`）。上游 `execution-layer`（本 change 不消费其新能力）；下游 各项目 `shadow-docs/`。反腐边界：不改 CLI 命令键语义、不在本仓实现发版动作。
- **同时踩进第二个上下文——有意不拆:** `distribution` 侧只动三份 manifest 的版本号，因为 `scripts/check-knowledge.mjs` 与新增 `scripts/resolve-bash.mjs` 都在 tarball 内容集内，依 `knowledge/release-artifact-pipeline.md`「版本 bump 必须与它触及的三处 manifest 同批」，拆开会留下一条红门。
- **统一语言增量:** 登记 **「可信 bash」**（本仓唯一含义：能真实执行 `tar`/脚本的 bash 实现，即 Git Bash 或 unix 原生 bash；明确排除 Windows 上 `System32\bash.exe` 与 `WindowsApps\bash.exe` 两个 WSL 入口桩）；登记 **「变更台账」**＝`shadow-docs/INDEX.md`，与 `shadow-docs/changes/` 目录集合一一对应，由 `buildIndex` 生成、由新门断言。
- **聚合与不变量:**
  - `质量门（gate）`：**I1 门的环境不变性**——被 ignore 的路径不参与任何断言，同一 commit 在本机脏工作树与干净 checkout 上结论一致；**I2 台账一致性**——INDEX 条目集合等于「git 已跟踪的 live 目录 ∪ archived 目录」，live 条目状态列等于该 brief 的 `status`，archived 条目状态恒为 `✅ 完成`；未跟踪的在途 brief 不参与断言（否则 apply 中途会把在建目录误判成台账漂移）；**I4 产物内容契约**——新脚本进 tarball 且三处 manifest 版本同源。
  - `测试装配（test harness）`：**I3 可移植性与响亮失败**——测试不得把 WSL 入口桩当可信 bash；解析不到可信 bash 时以指名原因失败（`SHADOW_DEV_BASH` 覆盖优先），禁止漂成 pack 内容断言失败。
- **领域事件:** 新门合入 main 后，「已 merged 但 brief 滞留 live 目录」与「INDEX 漏条目」从「靠人记得」变为「CI 判红」；本机 `npm run ci` 恢复可复现，brief 里的「本机四门全绿」重新成为合法观察点。

## 引用规范

- `knowledge/contract-probe.md`
  - 当前结论: 探针绿不构成完成证据；**探针红必须归因**（真实回归 / 环境噪声），未归因即未验证；进 CI 的探针必须指名它钉哪条不变量，指不出就不进；新机检写成 `scripts/` 下的可重复命令而非测试文件。
  - 适用 scope: `scripts/check-knowledge.mjs`（新断言＝INDEX 一致性）、`test/*.test.mjs`（bash 解析属装配而非内容断言）
  - 与本变更的关系: I1/I3 的两条红灯今天都是「环境噪声」形态；本 change 的处置不是再登记一条信号，而是把噪声根因固化成机器断言（ignore 过滤、可信 bash），符合该卡「取证成本高的坑要么进门要么进信号库」的取向。
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: 版本权威是 GitHub Release tag，三处 manifest 与 tag 同源由 `check:version` 判定；pack 内容集含 `scripts/`；新门一律以 strict 形态进 CI；`quality-gate.yml` 覆盖 push main 与全部 PR。
  - 适用 scope: `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、产物扫描观察点
- `norms/verification.md`
  - 当前结论: L 级每条不变量一个可追溯观察点，必须覆盖拒绝路径与状态不变量；本机取不到证据须写明缺口与替代观察点（CI run 链接）。
  - 适用 scope: 本 change 的「结果」段形状
- `norms/domain-model.md` + `shadow-docs/domain.md` 维护规则
  - 当前结论: 新增术语/归属变化先改地图再动卡片与路由；单次变更归属变化须走 propose 修订 brief。
  - 适用 scope: `shadow-docs/domain.md`（本次不新增上下文，仅在 brief 登记术语增量，卡片与路由不动）
- `norms/knowledge-cards.md`
  - 当前结论: 能更新现有卡片时不新增；存量卡片不因门的变化回溯迁移。
  - 适用 scope: 知识评估段
- `rules/iron-laws.md` §1 / §6 / §7
  - 当前结论: 验证强度与评级匹配不可议；一切 brief/INDEX/Git 写操作经 CLI，禁止手改 INDEX；L 级必含非空不变量清单。
  - 适用 scope: 全 change 执行方式（归档、INDEX、提交均走 `shadow-dev`）

## 决策

- **选型:** 方案 A —— **git 枚举 + INDEX 一致性断言 + 可信 bash 解析器**，三处各自最小改动：
  1. `scripts/check-knowledge.mjs`：引用扫描的文件集合改由 `git ls-files --cached --others --exclude-standard -z` 给出（tracked + 未跟踪但未 ignore），git 不可用时退回现有 `walk()` 并在摘要里打 `[warn] 枚举退回 readdir，ignored 路径未过滤`。
  2. `scripts/check-knowledge.mjs`：新增 INDEX 台账断言（已跟踪目录集合、live 状态列、archived 标记三查），并把它挂进现有 `--forbid` 之外的常规检查集，摘要行输出 `INDEX 条目 N / 目录 M`；`N != M` 即判红并逐条点名差集。
  3. 新增 `scripts/resolve-bash.mjs`：`SHADOW_DEV_BASH` → 存在的 Git Bash（`%ProgramFiles%\Git\bin\bash.exe`、`%LOCALAPPDATA%\Programs\Git\...`、`where bash` 去桩）→ unix 下 `bash`；返回 `null` 时调用方必须抛指名原因的错。`test/pack.test.mjs` 与 `test/install-cli.test.mjs` 改用它，不再裸写 `spawnSync('bash')`。
  4. `shadow-docs/signals.md` 登记新 SGN（Windows bash 命中 WSL 桩 → `npm test` 红，非代码回归），并注明由 `scripts/resolve-bash.mjs` 退役条件。
- **对比方案:**
  - B 只登记信号、不改门：未选。复盘已证明同一坑连续两轮复发且每次烧排查时间；依 `contract-probe.md`「进 CI 的探针必须指名不变量」，能机检的不应留成口头纪律。
  - C 把 INDEX 一致性做成 CLI `archive`/`change create` 的内置校验：未选。那属 `execution-layer` 的能力面（跨仓边界），本仓不得越界；且断言放本仓可由 CI 判定，零命令键扩面。
  - D 测试里对 Windows 直接 skip：未选。skip 等于「半绿」，正是 `check:requires --strict` 立项时要消灭的形态。
- **理由:** 三处改动都落在「门自身缺陷」这一条主题上，一个 change 内可被同一条 CI 流水同时证明；`requiresCommands` 与 `cliVersion` 全不动，跨仓时序风险为零（依 `distribution-capability-contract.md`：不声明未提供的能力，也不改既有键义）。

## 任务

### Phase 1 · 门的环境不变性（I1）

- [x] task-1 — `scripts/check-knowledge.mjs` — 引用扫描的文件集合改为 git 枚举（tracked + `--others --exclude-standard`），保留对 `shadow-docs/changes/` live 目录的现有守卫语义；git 不可用时退回 `walk()` 并打 warn。验证：本机 `npm run check:knowledge` → `fail=0`；负例：新建未跟踪且**未被 ignore** 的 md 写入死链 → 仍判红并点名该文件；同一路径放进 `.zcode/` → 不参与断言。
- [x] task-2 — `scripts/check-knowledge.mjs` — 摘要行补 `enumeration=git|readdir` 使降级可见，与 `check:requires` 的 `catalog=resolved|unresolved` 同构（禁止静默降级）。验证：无 git 环境模拟（临时 `PATH` 去 git 或 `SHADOW_DEV_NO_GIT=1`）→ 摘要出现 `enumeration=readdir` + warn。

### Phase 2 · 变更台账门（I2）

- [x] task-3 — `scripts/check-knowledge.mjs` — 新增 INDEX 断言：`shadow-docs/INDEX.md` 条目路径集合 == 由 `git ls-files` 枚举的 `changes/` live 目录 ∪ `changes/archive/` 目录（未跟踪的在途 brief 不列入）；live 条目状态列 == 该 brief `status`；archived 条目状态列 == `✅ 完成`。验证：当前仓库判绿且摘要形如 `INDEX 条目 N == 目录 N`。
- [x] task-4 — `scripts/check-knowledge.mjs` — 拒绝路径自证：临时删 INDEX 一行 → 门 rc=1 并点名缺失目录；临时把某 live 条目状态改成 `✅ 完成` → rc=1 点名状态与 brief 不符；恢复后复绿。验证：两次 rc 与点名文案写入 brief「结果」段。

### Phase 3 · 可信 bash 与测试可移植性（I3）

- [x] task-5 — `scripts/resolve-bash.mjs` — 实现解析器：`SHADOW_DEV_BASH` 优先；Windows 依次试 `%ProgramFiles%\Git\bin\bash.exe`、`%ProgramFiles(x86)%`、`%LOCALAPPDATA%\Programs\Git\bin\bash.exe`、`where bash` 结果中排除 `system32` 与 `WindowsApps` 的首个命中；posix 下回退 `bash`。导出解析来源供诊断输出。验证：本机返回 `C:\Program Files\Git\bin\bash.exe` 且来源标注为 git 目录。
- [x] task-6 — `test/pack.test.mjs`, `test/install-cli.test.mjs` — 两处 `spawnSync('bash', …)` 换用解析器；解析为 `null` 时抛错文案必须指名「可信 bash 未找到（Windows 需 Git Bash）」并列出尝试路径，禁止漂成解包/安装断言失败。验证：本机 `npm test` 首次全绿；负例 `SHADOW_DEV_BASH=D:\nope\bash.exe` → 失败文案含解析归因而非 `tar` 报错。
- [x] task-7 — `shadow-docs/signals.md` — 登记新 SGN（命中即先查 bash 来源，权重与退役条件写明由 `scripts/resolve-bash.mjs` 承担），并复核 SGN-010 的退役文案不再掩盖新形态。验证：`npm run check:knowledge` 绿（active 路由/死链）。

### Phase 4 · 产物与自证

- [x] task-8 — `package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` — `node scripts/bump-version.mjs 6.10.0` 三处同源 bump；`requiresCommands` 与 `cliVersion` 逐字不动。验证：`npm run check:version` 绿；`git diff` 确认 `requiresCommands`/`cliVersion` 无改动。
- [x] task-9 — 全门回归 — 本机 `npm run ci` 四门一体全绿 + `node scripts/pack.mjs` 产物扫描（`scripts/check-knowledge.mjs`、`scripts/resolve-bash.mjs` 在包内、skills=9）。验证：逐门真实输出摘要写进「结果」段，作为 I1–I4 的观察点载体。

### Phase 5 · 收尾（review 与 release 阶段执行，不在 apply 内）

- 收尾动作（非 apply 任务）：`review execute --conclusion passed`；知识评估按「更新 `knowledge/contract-probe.md`」落实；PR merged 后由 release 末段 `archive plan/execute` 归档并重建 INDEX——**本 change 同时是新增 INDEX 门的第一次自证**。

## 结果

- 实际耗时: ≈55 分钟（含 PowerShell/UTF-8 踩坑与一次文件锁 EPERM 重试）
- 环境: Windows 11 + node 24.9.0 + Git Bash——就是复盘里「四门只有两门能跑绿」的那台机器
- 验证: L 级逐条对账，全部为本机真实命令 + 真实输出；`quality-gate` run 链接作交叉印证（合并后回填）

| # | 不变量 | 观察点与真实输出 |
|---|--------|------------------|
| I1 `门的环境不变性` | 被 ignore 的路径不参与断言；同一 commit 本机与干净 checkout 结论一致 | 修复前基线（commit `afdee48`）：`npm run check:knowledge` → `摘要: ok=10 warn=7 fail=1`，`[fail] 死链 .zcode/plans/plan-sess_*.md`。修复后：`摘要: ok=12 warn=11 fail=0` + `[ok] 引用扫描 55 个文件、路径断言 零死链、enumeration=git`。退化可见性：`SHADOW_DEV_NO_GIT=1` → `[warn] git 不可用：文件枚举退回 readdir…（可用 SHADOW_DEV_NO_GIT=1 复现该退化）`、`enumeration=readdir`，且 `.zcode/` 的 3 条死链当场复现——证明消失来自 git 枚举，不是判定被削弱 |
| I2 `台账一致性` | INDEX 条目集合 == 已跟踪 changes 目录集合；live 状态列 == brief.status；archived 行 == `✅ 完成` | 绿路 `[ok] 变更台账 INDEX 条目 24 / 已跟踪变更目录 24（在途 2、已归档 22）`。三条拒绝路径各跑一遍再 `git checkout --` 恢复：① 删 `20261012-refactor-flow-order-publish-stage` 行 → `[fail] 台账缺条目 …（已归档目录已进 git，INDEX 未登记；用 shadow-dev index rebuild plan/execute 补）`；② 在途条目状态改 `✅ 完成` → `[fail] 台账条目 20261010-build-quality-gate 状态列为「✅ 完成」，brief.status 为「committed」（INDEX 与 brief 分裂）`；③ 条目名加尾缀 → `[fail] 台账幽灵条目 …TYPED → …（INDEX 有行但磁盘上没有对应 brief.md；路径写错或目录已被移动）`，`摘要: fail=2` |
| I3 `可移植性与响亮失败` | 测试不得吃 WSL 入口桩；解析不到时失败必须指名归因 | 正向 `resolveBash()` → `{"path":"C:\Program Files\Git\bin\bash.exe","source":"git-bin"}`；`npm test` → `ℹ tests 11 ℹ pass 11 ℹ fail 0`（本机首次全绿，修复前 pack 与 install-cli 各挂一项）。桩与无效路径一律 `null`：`C:\Windows\system32\bash.exe`、`…\WindowsApps\bash.exe`、`D:\nope\bash.exe`。负例实跑 `SHADOW_DEV_BASH=C:\Windows\system32\bash.exe node --test test/pack.test.mjs` → `Error: 可信 bash 未找到：…这不是代码回归——System32\bash.exe 与 WindowsApps\bash.exe 是 WSL 入口桩…其中 SHADOW_DEV_BASH=C:\Windows\system32\bash.exe 已被判定无效`，不再漂成 `pack 解包失败 rc=1` |
| I4 `产物内容契约` | 新脚本进 tarball；三处 manifest 同源；能力面零扩项 | `npm run check:version` → `✓ 三处 manifest 版本同源: 6.10.0（3 个文件）`。产物探针：`entries=71`、`in-pkg scripts/check-knowledge.mjs = true`、`in-pkg scripts/resolve-bash.mjs = true`、`skills=9`、`github-excluded = true`，探针后 `dist` 已删除（不留未跟踪产物）。能力面 `npm run check:requires:strict` → `declared=29 skills-referenced=23 undeclared=[] cli-catalog=46 catalog=resolved strict=on missing-in-cli=[]`；`git diff -- package.json` 只有 `version` 一行，`cliVersion` 与 `requiresCommands` 逐字未动 |
| 全门 | 本机四门一体可复现 | `npm run ci` → rc=0（版本 ✓ / requires:strict ✓ / 知识治理 `fail=0` / 测试 11/11）；CI 同款禁项组合 `npm run check:knowledge -- --forbid 'tdd-verification,▶ [TDD],既有测试保持绿,测试总数,相关测试'` → `摘要: ok=12 warn=11 fail=0` |

- 过程记录（诚实，含三次自身返工）:
  1. PowerShell 5.1 按 ANSI 解 UTF-8 brief，中文 mojibake 让 `ConvertFrom-Json` 抛错，第一次归档什么都没写就失败。改 `[IO.File]::ReadAllText(…,UTF8)` 并换 Node 驱动 CLI 之后，还加了一道逐字校验：`knowledge.reason` 回写前后不一致就 `git checkout` 回滚——4 个补归档的 brief 全部保真（184/485/404/184 字符一字不差）。取证顺序是「先证明门不毁数据，再让门动数据」。
  2. `SHADOW_DEV_BASH` 首版实现成「偏好」（无效则顺延下一候选），与 `knowledge/distribution-capability-contract.md` 的「不能静默降级」冲突；写探针跑 `stub-env` 才发现它仍返回 System32 路径，改为显式变量即权威：指向桩或不存在一律判不可用。
  3. 台账门首版把「幽灵条目」按 `git ls-files` 判定，会把「先 `index rebuild execute` 写台账、后 `release` 提交 brief」这一合法在途顺序判红——而这正是本 change 自己要走的路径。改为按磁盘存在性判定，未提交的在途条目降为 warn。
  4. 一次 `task set` 撞 Windows 原子改名 `EPERM`（瞬时文件锁），重试即收敛——SGN-004 同族环境噪声，非代码问题。
5. **新门的第一条反例是自己造出来的**：`index rebuild execute` 先把在途条目写成 `branched`，随后的 `release execute` 又把 brief 推到 `published`——按 task-3 原文的「状态列严格相等」执法，**每个在途 change 的 release 提交都必然判红**，台账门会变成自毁装置。根因是 INDEX 属派生视图、只有 CLI 的 index rebuild/archive 会重写，而 brief.status 每一步都在前进。处置（见下方范围修订）：在途滞后降为 `[warn]`，非法状态值与「已跟踪目录缺条目」「幽灵条目」「归档行不为 ✅ 完成」保持 `[fail]`——今天复盘抓到的那条漂移（已 merged 却不在台账）仍然判红。
6. 附带教训：调试时对 `shadow-docs/INDEX.md` 用 `git checkout --` 恢复，把 CLI 刚写下的在途条目一并抹掉（该行的 `尚未进 git` warn 随之消失，才暴露）。台账由 CLI 独占写入，验证负例应改在副本上跑或紧随其后重跑 `index rebuild`。

- 范围修订（实现期发现，非静默扩面）:
  1. **文件集追加 `shadow-docs/INDEX.md`**：新增台账门要求「每个已跟踪 change 目录在 INDEX 有行」，本 change 自己的行必须由 `index rebuild` 落盘并随代码同批提交，否则 CI 判红。原 `change create --files` 未列该文件。
  2. **task-3 的「live 状态列 == brief.status」降为 warn**（另加生命周期枚举判红）：理由见过程记录 5——严格相等与派生视图的刷新时机冲突，会把在途 change 一律判红。执法强度不变的部分：缺条目、幽灵条目、归档行错误、非法状态值仍判红。
- 交付: 分支 `build/20261012-build-gate-reproducibility`；PR 与 review 结论见 frontmatter（release 后回填）

## 遗留与后续

1. **「PR 已 merged 但 brief 滞留 live」仍无硬门**：合并状态是 GitHub 事实，离线判不了。硬断言要用 API，且被上游缺陷卡住（见「待确认点 1」）。本 change 先把「台账与磁盘分裂」这一半变成 CI 判红，另一半登记为后继。
2. **两个 10-10 的 brief 仍无法归档**（`20261010-build-quality-gate`、`20261010-refactor-domain-driven-workflow`）：brief 的 `github.pullRequest` 从未回填，叠加 CLI main 的 list 载荷 `merged=null` 缺陷；该修复在 CLI 仓 main 上但未发布。
3. **`archive-on-issue-close.yml` 空跑**（见「待确认点 2」）：文档承诺的 issue-close 自动归档通道没有对应触发器，另立 change。
4. **本 change 是新增台账门的第一次实跑对象**：`index rebuild plan/execute` 在 release 前把在途条目写进 INDEX，再由 release 同批提交；若 CI 上不成立，说明门自身口径还要修。

## 知识评估

- **预期影响:** 更新
- **候选卡片:** `knowledge/contract-probe.md`
  - 动作: 原位追加实证——「本机与 CI 结论分裂」属门自身缺陷而非可长期容忍的环境噪声；处置顺序是**先固化成断言（ignore 过滤、可信 bash），再考虑登记信号**。补 `verified-depth: runtime` 与本 change source。
  - 查重结论: 不为「INDEX 台账门」新建卡片——它是 `contract-probe.md`「进 CI 的探针必须指名不变量」与 `release-artifact-pipeline.md`「新门以 strict 形态进 CI」已有主题的延伸，依 `norms/knowledge-cards.md`「能更新现有卡片时不新增」。
- **理由:** 台账一致性与门的环境不变性是跨 change 复用的长期执行真相；brief 记「这次发生了什么」，卡片记「现在应怎么做」。

## 待确认点

1. **上游 CLI 缺陷（不在本 change 处置）:** 两个 10-10 的 brief 无法归档，根因在 `shadow-dev-cli` main 的分支回查回填把 GitHub **list** 载荷当单条载荷用——list 里 `merged` 为 `null`（只有 `merged_at` 有值），`archive` 的 `if (!x.merged)` 因此判 `PR_NOT_MERGED`（实测：`gh api pulls?head=…` → `{"merged":null,"merged_at":"2026-10-10T09:32:00Z"}`；`gh api pulls/42` → `{"merged":true}`）。该修复属 `execution-layer` 上下文，须在该仓自己的 change 里做，本仓不越界。
2. **`archive-on-issue-close.yml` 的自动通道今天为空跑:** 该 workflow 只声明 `workflow_dispatch` / `repository_dispatch`，没有 `on: issues`，而 README 与 `shadow-dev-archive` 技能都写「issue close 时 webhook 自动 dispatch」。实测 `gh run list --workflow archive-on-issue-close.yml` → 零条记录，且 10-11 关闭的 issue #46 没触发任何归档。属 `distribution`/`workflow-governance` 的文档-实现矛盾，列为后继 change。
3. **本机基线依赖:** I1/I3 的「本机 npm run ci 全绿」观察点只在 Windows + Git Bash 的真实机器上可证；CI 矩阵绿是交叉印证而非替代，两者结论必须一致才算门成立。
