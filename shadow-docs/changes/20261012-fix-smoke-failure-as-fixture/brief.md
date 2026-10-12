---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-fix-smoke-failure-as-fixture",
  "type": "fix",
  "scope": "ci,scripts,distribution",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "fix/20261012-fix-smoke-failure-as-fixture",
  "files": [
    ".github/workflows/publish-release.yml",
    "knowledge/contract-probe.md",
    "knowledge/release-artifact-pipeline.md",
    "scripts/check-release-smoke.mjs",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-fix-smoke-failure-as-fixture/brief.md",
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
    "verifiedCommit": "f6cc7aefe434f9b6fdd9209dc9c6d1c1c0ee6802",
    "verifiedAt": "2026-10-12T07:02:57.745Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "80c8e50f128b88c21c19fb34333812fc7ce69e4f4e5d4be3a837eed2f9195f77",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".github/workflows/publish-release.yml",
        "knowledge/contract-probe.md",
        "knowledge/release-artifact-pipeline.md",
        "scripts/check-release-smoke.mjs",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-fix-smoke-failure-as-fixture/brief.md",
        "test/release-smoke.test.mjs"
      ],
      "message": "fix(release-chain): 门收 v7.0.1 真实失败为夹具并新增反引号误用与 materialized 判定",
      "title": "[fix] 发布冒烟的门看不见自己改坏的东西：failure-as-fixture",
      "body": "v7.0.1 的 publish-release run 38214942988 判红，根因是 publish-release.yml 第 107-109 行的变量被写成反引号形态，bash 当命令替换，ROOT 与 N 全空。真正要紧的是本机 check:smoke 与 PR 的 quality-gate 同时判绿——该门只校验有没有 EXPECTED 赋值与有没有字面量比较，对反引号误用无感。带绿灯进主干比带红灯更糟。 · 本 change：① 门新增 SMOKE_BACKTICK_SUBST 判定；② 套件新增「真实失败原文即夹具」断言，输入直接取自那次 CI 日志；③ 修 yml 三行变量形态；④ 摘要新增 materialized 位并加自我防线断言，因为 --no-materialize 曾被门自己写成「离线物化一致」，我当场误读——这是本轮发现的第二处假绿；⑤ 两张卡补 failure-as-fixture 纪律。 · 有意不做：冒烟单实现化（yml 与门仍是两份实现）列为后继 change，见 brief INV-3 与遗留第 1 条。 · 交付事实：v7.0.0 与 v7.0.1 两次链红，两个发版载体都未归档，链绿依赖本 change 合入后再发一版。 · 验证：npm run ci 退出码 0，node --test test/release-smoke.test.mjs 10/10。"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/contract-probe.md",
    "reason": "门必须能复现上一次真实失败是探针层的长期纪律，已落卡并附反引号形态实证"
  }
}
---

# 发布冒烟的门看不见自己改坏的东西：把真实失败形态收进夹具

## 动机
v7.0.1 的 `publish-release` run **38214942988 completed/failure**，日志：

\`\`\`
line 16: ROOT: command not found
find: '/skills': No such file or directory
\`\`\`

根因是我自己写坏的：`publish-release.yml` 第 107-109 行里的变量引用（N、EXPECTED、ROOT）被写成反引号包裹的形态，bash 把反引号当命令替换，于是变量全空、ROOT 行被当成命令执行。

更要紧的是：**我的第六门对这个形态完全无感**。它只校验「有没有 EXPECTED= 赋值」和「有没有与字面量比较」，反引号写法两条都不违反，于是本机 `check:smoke` 判绿、PR 的 quality-gate 判绿，链子照样炸。这就是 #53 立的规矩没做完的部分——门必须能复现上一次真实失败，否则它守的是我想象中的世界。

## 复杂度评级
- **评级:** L
- **理由:** ①契约变更——改 CI 实际执行的脚本与门的判定集；②触及面——发布链工作流 + `scripts/` 门 + 套件；③可发现性——同类错误只在真发版才暴露，属最难发现的一类。
- **期望验证深度:** runtime
- **取证策略:** assert-first（反引号形态是可构造输入的静态断言，取观察点需要真发一次版）

## 领域模型

- **限界上下文:** `distribution` — 产物打包、多宿主分发、版本与发布链。上游 `execution-layer`；下游三宿主。反腐边界：不改 CLI 的 workflow 域实现。
- **统一语言增量:**
  - **回归即夹具（failure-as-fixture）**：门至少一条断言直接采用上一次线上失败的原文；门判绿当且仅当该原文被判红或已被修复。
  - **命令替换误用（backtick-substitution）**：变量引用被写成反引号包裹形态，bash 视其为执行同名命令，取值为空。
- **聚合与不变量:**
  - `INV-1 failure-as-fixture`：`test/release-smoke.test.mjs` 必须含一条断言，输入是 v7.0.1 真实失败原文（那三行反引号形态），期望门输出 `SMOKE_BACKTICK_SUBST` 且 rc=1。
  - `INV-2 gate-coverage`：门必须拒绝冒烟步骤内的任何反引号命令替换；全 `$` 形态的正例判绿。
  - `INV-3 single-implementation-pending`：本 change 不得声称冒烟「已只有一份实现」；`publish-release.yml` 仍内联断言，去重复属后继 change，必须写明而非顺手做完。
  - `INV-4 no-double-green`：同一份文本被改坏时，本机门与 PR 门不得同时判绿——以「改坏 yml 后复跑门必须红」的实测记录证明。
- **领域事件:** 门判红 → release 阻塞；链绿 → 两个发版载体方可归档。

## 引用规范
- `knowledge/contract-probe.md`
  - 当前结论: 三条放行判据；探针必须可反查；夹具必须与真实产物同构
  - 适用 scope: `norms/verification.md`、`scripts/`、`test/`、CI
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: 版本权威＝tag；资产名契约；冒烟须走 plan → execute → status → bind 并输出 OK materialized root 与 skills 计数
  - 适用 scope: bump、tag、Release、发布链与冒烟

## 决策
- **选型:** ① 修 yml 第 107-109 行的变量形态；② 门新增 `SMOKE_BACKTICK_SUBST` 判定；③ 套件新增「真实失败原文」断言；④ 把冒烟单实现化明确留给后继 change。
- **对比方案:** 只修 yml 不加判定（否——同类错误还会再来，门继续给出假绿）；现在就做单实现化（否——那是另一个契约变更，混做会让 review 无法分辨是判定错还是结构错，且违反 INV-3 与一 change 一上下文）。
- **理由:** 「门看不见自己被改坏的东西」比「yml 写错」更严重：前者让错误带着绿灯进主干。failure-as-fixture 是成本最低的根治起点。

## 任务
### Phase 1
- [x] 先写失败断言：以 v7.0.1 真实失败原文为夹具，断言门输出 `SMOKE_BACKTICK_SUBST` 且 rc=1 — `test/release-smoke.test.mjs`
- [x] 门新增冒烟步骤内反引号命令替换判定与全 `$` 形态正例 — `scripts/check-release-smoke.mjs`
- [x] 修 `publish-release.yml` 第 107-109 行变量引用形态 — `.github/workflows/publish-release.yml`
- [x] 登记台账条目 — `shadow-docs/INDEX.md`
### Phase 2
- [x] 六门本机全绿，并以「改坏 yml 后门必红」的复跑取 INV-4 观察点 — `scripts/check-release-smoke.mjs`
- [x] 发布链卡补 failure-as-fixture 与本次链红事实 — `knowledge/release-artifact-pipeline.md`
- [x] 回填结果段与后继 change 清单，交 review — `shadow-docs/changes/20261012-fix-smoke-failure-as-fixture/brief.md`

## 结果
- 实际耗时: 约 22 分钟（根因含读 CI 日志与 yml 现况；夹具 1 轮；门判定 1 轮；**门自身第二处假绿的发现与自我纠 1 轮**；两张卡与台账 1 轮）
- 验证: **L 级 · assert-first · 三条放行判据**逐条对账

| 不变量 | 观察点 |
|---|---|
| `INV-1 failure-as-fixture` | 观察点：`node --test test/release-smoke.test.mjs` → `✔ INV-1 failure-as-fixture：v7.0.1 真实失败原文必须被门判红`，`ℹ tests 10 / pass 10 / fail 0`。夹具原文直接取自 run 38214942988 的失败步输出（`line 16: ROOT: command not found` 与 `find: ‘/skills’: No such file or directory`） |
| `INV-2 gate-coverage` | 观察点（拒绝路径）：含反引号变量形态的三行喂给门 → `✗ SMOKE_BACKTICK_SUBST …（行 3,4,5）：bash 视作命令替换，取值为空`，rc=1。观察点（正例）：修复 `publish-release.yml` 第 107-109 行后同门 rc=0，且断言 `doesNotMatch SMOKE_BACKTICK_SUBST` |
| `INV-3 single-implementation-pending` | 证据缺口（有意不做）：`publish-release.yml` 仍内联同一段断言，本机门是第二份实现——**本 change 未去重复**，只在卡里标为「当前未达成」并列后继 change。判红不留此条会诱使顺手做完，review 无法分辨判定错与结构错 |
| `INV-4 no-double-green` | 观察点：同一被改坏的文本喂门即红（INV-1 夹具），而 `npm run ci` 的 `check:smoke` 腿跑的是同一段静态判定，不存在「本机绿 + PR 绿 + 链红」的三态；v7.0.1 正是三态齐现的实证（本机绿、PR 绿、链红） |
| 门的自我防线（本轮新发现） | 观察点：`node scripts/check-release-smoke.mjs --no-materialize` 输出 `摘要: … materialized=0` 与 `（离线腿按 flag 跳过，不计入一致）`；修复前同命令曾输出「离线物化一致」——执行者当场把它误读成物化已通过。断言 `摘要位：--no-materialize 不得被读成「离线物化一致」` 绿 |
| Windows 物化腿 | 证据缺口：本机 `--from` 恒走 `SMOKE_MATERIALIZE_DEFERRED`（CLI 把路径 resolve 回反斜杠交给 `bash -c tar`，Git Bash 读成远程主机:路径；exec_command 通道同样复现，先前「deferred=0」系误读）。补充观察点＝PR 的 ubuntu/macos job 上 `materialized=1` 的实断言（非 win32 分支必须匹配 `OK materialized root=… skills=N`） |

## 遗留与后续

1. **冒烟单实现化（后继 L change，`distribution`）**：断言抽成一份脚本，CI 步骤与 `check:release-smoke` 都调它；完成后删除 `INV-3` 那条待办并把卡里的「当前未达成」改为结论。
2. **`shadow-dev-cli` 缺陷清单（跨上下文）**：`bash -c tar` 的 Windows 路径形态（本条已被两次实测复现，P0 候选）；`release/publish` 缺 `--body-file/--message-file`；`release execute` 不校验 review passed；`archive` 要求 `verifiedCommit == HEAD`（合并提交必然不等，两次都要回 main 重跑 review）。
3. **v7.0.0 与 v7.0.1 两个发版载体均未归档**：三条交付证据里冒烟连续两次不成立，按技能 §6 不写已交付、不归档。链绿依赖本 change 合入后再发一版。
4. **`dist/` 未进 **`.gitignore`**：门用 git 枚举文件，未跟踪的 `dist/staging` 副本迟早参与扫描；当前只是靠显式文件列表提交侥幸避开。

## 知识评估
- **预期影响:** 更新
- **候选卡片:** `knowledge/release-artifact-pipeline.md`、`knowledge/contract-probe.md`
- **理由:** 「门必须能复现上一次真实失败」是发布链与探针共同的长期纪律；不新建卡，避免同一结论两处定义。
