---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-fix-release-smoke-field-contract",
  "type": "fix",
  "scope": "distribution,scripts,ci",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "fix/20261012-fix-release-smoke-field-contract",
  "files": [
    ".github/workflows/publish-release.yml",
    "CLAUDE.md",
    "README.md",
    "knowledge/release-artifact-pipeline.md",
    "package.json",
    "scripts/check-release-smoke.mjs",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-fix-release-smoke-field-contract/brief.md",
    "shadow-docs/domain.md",
    "test/release-smoke.test.mjs"
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
    "verifiedCommit": "9ce4f855cbe611a8576109cad47ec9a0f9935f8d",
    "verifiedAt": "2026-10-12T06:44:49.560Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "6c86ae8401cd7adb5b8ae7d09e23dfe96ec34da0424c8d432cb99400b913a069",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".github/workflows/publish-release.yml",
        "CLAUDE.md",
        "README.md",
        "knowledge/release-artifact-pipeline.md",
        "package.json",
        "scripts/check-release-smoke.mjs",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-fix-release-smoke-field-contract/brief.md",
        "shadow-docs/domain.md",
        "test/release-smoke.test.mjs"
      ],
      "message": "fix(release-chain): 冒烟改读 execute 的 version 并新增发布冒烟契约门（六门一体）",
      "title": "[fix] 发布冒烟读错字段：把发版链断言变成本机可复现门",
      "body": "v7.0.0 的 publish-release run 38212369929 判红（completed/failure），日志 OK execute current=undefined → x materialized artifact missing norms/verification.md。读 CLI 源码定案：workflow execute 返回 action/version/prefix/previous，current 只属 workflow status，而冒烟读了 execute 的 current 又把 ROOT 手拼成 prefix/$CUR/shadow-dev-workflow（CLI 布局是 prefix/shadow-dev-workflow-<ver>），另加 skills 数写死 9。该冒烟自 #50 引入后从未执行过（6.10.0 未发版），第一次上链即炸——断言只写在 yml 里就是这种结局。 · 修复：冒烟改读 version、ROOT 由布局派生、加 CURRENT 指针一致性断言、skills 期望值改 find skills 实测；新增 scripts/check-release-smoke.mjs 作第六门（静态字段契约白名单 + 离线 --from 本地资产物化），进 npm run ci 与 npm test。 · 另记 execution-layer 缺陷两条：workflow plan --from 把路径 resolve 回反斜杠交给 bash -c tar（Windows 物化全废），以及 release/publish 缺 --body-file 导致含元字符的正文被 cmd 截断。Windows 上物化腿显式 deferred 留痕，CI（Linux）跑实断言。 · 验证：npm run ci 在权威通道退出码 0，六门 fail=0，npm test 27/27；新门 7 条断言含先红记录（修复前真实 yml 判红）。 · 交付事实：v7.0.0 产物已发布（资产名与版本权威两条成立），链绿须由下一次 release.published 承接，故本 change 不合入前不写已交付。"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/release-artifact-pipeline.md",
    "reason": "字段契约、冒烟可本机复现与Windows物化缺陷是发布链的长期事实，已由该卡持有并更新"
  }
}
---

# 发布冒烟读错字段：把发版链断言变成本机可复现门

## 动机
v7.0.0 发布后 \`publish-release\` run **38212369929 completed/failure**，三条交付证据里冒烟不成立。日志实证：

\`\`\`
OK plan version=7.0.0 missing=null
OK execute current=undefined
x materialized artifact missing norms/verification.md
\`\`\`

根因（读 CLI 源码定案）：`workflow execute` 的返回是 `{action:'install', version, prefix, previous}`——**没有 `current` 字段**（`current` 只存在于 `workflow status`/`rollback`/`unlink`）。`publish-release.yml` 的冒烟步骤取 `d.data.current` → 空串 → 且把 ROOT 拼成 `prefix/$CUR/shadow-dev-workflow`，而 CLI 的物化布局是 `prefix/shadow-dev-workflow-<ver>`。两处皆错，`test -f` 必然判红。冒烟步骤属 #50 新增，而 6.10.0 从未发版——**这段脚本在有真实 Release 之前从未被执行过**，第一次上链就炸。这正是「门只能在下一次发版时才暴露自己坏了」的形态，也是 #50 复盘主题（质量门本机可复现）的未竟部分。

skills 数还硬编码成 `9`：新增技能时冒烟会假红，删技能时反而假绿。

## 复杂度评级
- **评级:** L
- **理由:** ①**契约变更**——修改对外交付入口的验收断言语义（冒烟判据本身）；②**触及面**——碰 `.github/workflows/publish-release.yml`、新增 `scripts/` 门、`package.json` 的 `ci` 串、发布链知识卡；③**可发现性**——改坏了不在 PR 里可见，要等下一次真实发版才炸，属最难发现的一类。
- **期望验证深度:** runtime
- **取证策略:** assert-first（不变量是「脚本读取的字段名与物化路径形状」，属可构造输入的静态断言；观察点取证需真发版，成本远高于写断言）

## 领域模型

- **限界上下文:** `distribution` — 产物打包、多宿主分发、版本与发布链。上游 `execution-layer`（CLI 提供 workflow 域命令）；下游三宿主与消费侧安装。反腐边界：本上下文不实现 CLI 的 workflow 域，只断言我们消费的**返回契约**与**布局形状**。
- **统一语言增量:**
  - **离线冒烟（offline smoke）**：用 `--from` 指向本地 `dist` 资产、在隔离 prefix 里复现发布冒烟全部断言的本机可重复命令，不依赖 GitHub Release 存在。
  - **字段契约（payload contract）**：`publish-release.yml` 读取的 `d.data.<key>` 集合，必须是被 pin CLI 实际返回的键。
- **聚合与不变量:**
  - `INV-1 payload-contract`：冒烟步骤只能读 `workflow execute` 真实返回的键（`version`），读 `current` 即判红；`scripts/check-release-smoke.mjs` 必须能指出该违规出现在哪一行。
  - `INV-2 materialized-layout`：断言用的 ROOT 必须由 CLI 布局派生（`<prefix>/shadow-dev-workflow-<version>` 或 `workflow status` 的 `resolved`），不得手拼嵌套目录；错误形状必须被判红。
  - `INV-3 no-hardcoded-skill-count`：skills 期望值必须来自 `skills/` 目录实测，禁止在 yml 里写死数字；期望值与实际值不一致才判红。
  - `INV-4 offline-reproducible`：冒烟全部断言必须能在本机不联网、不依赖 Release 的情况下复现（`--from` 本地资产），并且已接入 `npm run ci` 成为常开门。
  - `INV-5 chain-red-not-delivered`：发布链判红时不得写「已交付」也不得归档载体；v7.0.0 当前状态必须被记为「产物已发布、交付证据未闭合」。
- **领域事件:** `check-release-smoke` 判红时 release 阻塞且指针不动；下一次 `release.published` 链绿时 v7.0.1 才算交付闭合；载体 brief `20261012-chore-release-v7.0.0` 的回填必须引用这两条 run。

## 引用规范
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: 版本权威＝release tag；资产名匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\\.tar\\.gz$`；隔离 prefix 冒烟须见 `OK materialized root=… skills=N`
  - 适用 scope: bump、tag、Release、发布链与冒烟
- `knowledge/contract-probe.md`
  - 当前结论: 三条放行判据；探针必须可反查；夹具与真实产物同构
  - 适用 scope: `norms/verification.md`、`scripts/`、`test/`、CI

## 决策
- **选型:** 双管——① 修 `publish-release.yml` 冒烟（读 `version`、ROOT 由布局派生、skills 期望值动态取自 `skills/`）；② 新增 `scripts/check-release-smoke.mjs`，把同一段断言在离线 `--from` 路径上跑一遍并静态校验 yml 的字段读取，接入 `npm run ci`。
- **对比方案:** 只改 yml（否——冒烟仍只有真发版才执行，同类错误下次照炸）；改 CLI 让它返回 `current`（否——那是消费侧猜字段，等于把契约错误制度化，且发版能力属 `execution-layer`，不在本仓改）；用 `gh run rerun` 验证（否——重跑取的是事件 SHA 上的旧 workflow 文件，永远验不到修复）。
- **理由:** 把「发版时才发现门是坏的」转成「提交前就红」，与 #50 建立的可复现性是同一条纪律的延伸。静态字段对账 + 离线物化两条腿：前者防字段名漂移，后者防路径形状漂移。

## 任务
### Phase 1
- [x] 先写失败断言：`check-release-smoke` 对「读 current」「手拼 prefix/$CUR/...」「硬编码 skills 数」三种输入各判红 — `test/release-smoke.test.mjs`
- [x] 实现 `scripts/check-release-smoke.mjs`：静态解析 `publish-release.yml` 的 `d.data.<key>` 白名单与 ROOT 派生式，并以 `workflow execute --from dist 资产 --prefix 临时目录` 离线物化后断言 `norms/verification.md` 存在、`skills` 数与仓库实测一致 — `scripts/check-release-smoke.mjs`
- [x] 修 `publish-release.yml` 冒烟步骤：`version` 字段、`<prefix>/shadow-dev-workflow-<ver>` 布局、skills 期望值动态取 `skills/` 目录数 — `.github/workflows/publish-release.yml`
- [x] 接入常开门：`check:smoke` 脚本并进 `ci` 串 — `package.json`
### Phase 2
- [x] 更新发布链卡：字段契约、离线冒烟、链红即未交付的处置 — `knowledge/release-artifact-pipeline.md`
- [x] 登记术语「离线冒烟 / 字段契约」并回填 v7.0.0 载体的链红事实 — `shadow-docs/domain.md`
- [x] 五门＋新门本机全绿后收口，交 review — `shadow-docs/changes/20261012-fix-release-smoke-field-contract/brief.md`

- 偏差记录：`README.md` 与 `CLAUDE.md` 的门数与门表随新门同批改（对外表述与产物同源是发版准入项），立项 `files` 未列，CLI 1.5.0 无 `change amend`，手工补入并留痕。

## 结果
- 实际耗时: 约 40 分钟（根因定位含读 CLI 源码定字段；门与夹具 3 轮返工——`String.raw` 撞反引号 1 次、转义折叠 1 次、补丁锚点不同构 2 次；冒烟步骤与卡片同改 1 轮；六门实跑 2 个通道对照）
- 验证: **L 级 · 取证策略 assert-first · 三条放行判据**逐条对账

| 不变量 | 观察点 |
|---|---|
| `INV-1 payload-contract` | 观察点（拒绝路径）：`node --test test/release-smoke.test.mjs` 夹具读 `data.current` → 门输出 `✗ SMOKE_UNKNOWN_FIELD publish-release.yml:99: 从 \`exec.json\` 读 \`data.current\`，该命令不返回此键（可用：action\|version\|prefix\|previous）`，rc=1。观察点（正例）：修复后对真实 yml 复跑 → rc=0；`workflow execute` 的返回键由 CLI 源码 `lib/domains/workflow.mjs`（`return { action:'install', version, prefix, previous }`）定案，非猜测 |
| `INV-2 materialized-layout` | 观察点（拒绝路径）：夹具保留 `data.version` 但保留手拼 `prefix/$CUR/shadow-dev-workflow` → `✗ SMOKE_BAD_LAYOUT` 双条（形状错 + 未派生），rc=1。观察点（正例）：`ROOT="$SMOKE/prefix/shadow-dev-workflow-$VER"` + `workflow status` 的 `CURRENT` 指针一致性断言，门判绿 |
| `INV-3 no-hardcoded-skill-count` | 观察点（拒绝路径）：夹具把 `$EXPECTED` 换成字面量 `9` → `✗ SMOKE_HARDCODED_SKILLS`，rc=1；缺 `EXPECTED=` 亦判红。观察点（正例）：冒烟改为 `EXPECTED=$(find skills -name SKILL.md \| wc -l)` 与物化实测对账，门判绿；发布链卡同批改写「技能数量是两处写死的硬断言」这条旧结论 |
| `INV-4 offline-reproducible` | 观察点：`node scripts/check-release-smoke.mjs --materialize-tmp …` → `摘要: smoke checks=2 fail=0 deferred=1`（静态腿绿；离线腿在本机 `deferred`——CLI 的 `bash -c tar` 收到 `D:\works\…` 反斜杠绝对路径即失败，属 execution-layer 缺陷，本机显式留痕不静默通过，CI/Linux 跑实断言）。`npm run ci` 权威通道 rc=0，新门已进 `ci` 串与 `npm test`（测试计数由 20 升到 27：brief-gate 9 + release-smoke 7 + install-cli 7 + pack 4） |
| `INV-5 chain-red-not-delivered` | 观察点：v7.0.0 的 `publish-release` run **38212369929 = completed/failure**，故本次不写「已交付」——Release 与资产名（`shadow-dev-workflow-v7.0.0.tar.gz`，96997B）与版本权威（tag `c778816` 含 bump，`manifest=7.0.0`）两条成立，第三条冒烟不成立。载体 brief `20261012-chore-release-v7.0.0` 已按本条把状态改记为「产物已发布、交付证据未闭合」，链绿须由下一次 `release.published` 承接 |
| 门的通道一致性（本 change 内的一次真实自纠） | 观察点：初版分类器只在消息含 @@bash -c tar@@ 时降级，直接跑门得到 @@deferred=1@@、而在 @@npm test@@ 内部跑同一腿却报 @@SMOKE_CLI_MISSING@@ 判红（@@ENOENT@@，子进程通道里 .cmd shim 不可解析）——同一现象两种结论的门比红灯更危险。改为按平台确定化（win32 两类同因都降级并区分理由，其余环境判红；CLI 存在性由 @@check:requires:strict@@ 独占执法），两通道复跑均为 @@fail=0 deferred=1@@ |
| 门的先红记录 | 观察点：实现前该 7 条断言中 5 绿 2 红（`INV-5 真实 yml 必过静态对账` 与 `INV-4 离线物化` 判红，正是事故原文的复刻），修复 yml 与门转绿 → 7/7。夹具与真实 yml 同构（直接读 `.github/workflows/publish-release.yml`），不复述字段名 |

## 遗留与后续

1. **`shadow-dev-cli` 两条缺陷（跨上下文后继）**：① `workflow plan/execute --from` 把路径 resolve 回反斜杠再交给 `bash -c tar`，Git Bash 读成「远程主机:路径」→ Windows 本机物化全废（消费侧真实影响，P0 候选）；② 发版链缺 `--body-file`/`--message-file`（`change create` 有），PR 正文含 `&&` 或换行会被 cmd 截断——本次已由 `CONFIRMATION_REQUIRED` 拦住，未误建 tag/Release。
2. **v7.0.0 的链绿证明缺失**：修复合入后需再发一版（建议 `v7.0.1`）才能让 `publish-release.yml` 的新冒烟真正被执行；`gh run rerun` 取的是事件 SHA 上的旧文件，验不到修复。
3. **`npm run ci` 的通道依赖**：node_repl 子进程通道无可用 bash，`install-cli.test.mjs` 与 `pack.test.mjs` 在文件级即抛「可信 bash 未找到」（rc=1），同一提交在 `exec_command` 通道 rc=0。按新纪律记为证据缺口并给出对照观察点，不静默免除；处置顺序要求显式给 `SHADOW_DEV_BASH`。
4. 事故留痕：`README.md`/`CLAUDE.md` 的门数随新门从五门改六门，立项 `files` 未列，`change amend` 能力不在已 pin 的 CLI 里，手工补入并留痕。

## 知识评估
- **预期影响:** 更新
- **候选卡片:** `knowledge/release-artifact-pipeline.md`
- **理由:** 冒烟的字段契约与可复现形态是长期事实，应由发布链卡持有；不为一次修复新建卡。
