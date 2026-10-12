---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-refactor-release-smoke-single-implementation",
  "type": "refactor",
  "scope": "distribution,ci,scripts",
  "status": "committed",
  "baseBranch": "main",
  "branch": "refactor/20261012-refactor-release-smoke-single-implementation",
  "files": [
    ".github/workflows/publish-release.yml",
    "knowledge/contract-probe.md",
    "knowledge/release-artifact-pipeline.md",
    "package.json",
    "scripts/check-release-smoke.mjs",
    "scripts/pack.mjs",
    "scripts/release-smoke.sh",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-refactor-release-smoke-single-implementation/brief.md",
    "test/release-smoke.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 56,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/56"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "e383212a264d598d15a07d842f11289e593853b2",
    "verifiedAt": "2026-10-12T07:34:59.609Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "c2fdf159312601363f437fb813a8f70d70a0ce5c",
    "planHash": "5e5dadb2e2c9e886fe04f7a3fbf15999351130d9c2ace5999e4e96e39425534b",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".github/workflows/publish-release.yml",
        "knowledge/contract-probe.md",
        "knowledge/release-artifact-pipeline.md",
        "scripts/check-release-smoke.mjs",
        "scripts/release-smoke.sh",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-refactor-release-smoke-single-implementation/brief.md",
        "test/release-smoke.test.mjs"
      ],
      "message": "refactor(release-chain): 冒烟收敛为唯一实现，yml 只剩一行委派",
      "title": "[refactor] 发布冒烟只留一份实现：yml 与本机门调同一个脚本",
      "body": "连续两次发版各炸一处（v7.0.0 借错字段、v7.0.1 变量写成反引号），结构性原因是同一段断言存在两份实现：CI 跑 yml 内联那份，本机门跑自己那份，改坏一份另一份毫无反应，于是「本机绿 + PR 绿 + 链红」可以同时成立。#55 用 failure-as-fixture 给第二份实现打补丁，本 change 消灭「两份」本身。 · 做法：断言唯一实现落在 scripts/release-smoke.sh（五条断言、双入口 --release 与 --from、set -euo pipefail、失败带 x 前缀可定位行号）；publish-release.yml 冒烟步骤只剩一行 bash 调用；门改为对唯一实现做静态对账（SMOKE_NOT_DELEGATED、SMOKE_INLINE_ASSERTION、SMOKE_ASSERTION_MISSING 用 7 条特征串守住条目、SMOKE_BACKTICK_SUBST、SMOKE_UNKNOWN_FIELD）并自检自身不得驱动 CLI（SMOKE_DUPLICATION），离线腿改为直接调用脚本、退出码即判据。 · 验证：node --test test/release-smoke.test.mjs 10/10；npm run ci 权威通道退出码 0，六门 fail=0，npm test 30/30；离线腿实跑输出 OK materialized root=...  skills=9 与 materialized=1 deferred=0——本机绿从此等价于 CI 将跑同一份代码。 · 诚实记录：本轮执行者自伤 7 次（多层转义、String.replace 的美元符后向引用、try/catch 吞掉 ReferenceError、把 resolveBash 返回对象当字符串、自指命中），根因与收敛纪律已写入 knowledge/contract-probe.md 新增条「AI 生成源码的转义纪律」，brief 结果段逐条留痕。 · 交付事实：v7.0.0 与 v7.0.1 两个发版载体仍未归档，等本 change 合入后再发一版让 publish-release 首次跑绿。"
    },
    "commit": {
      "files": [
        "scripts/check-release-smoke.mjs",
        "scripts/pack.mjs",
        "shadow-docs/changes/20261012-refactor-release-smoke-single-implementation/brief.md"
      ],
      "message": "fix(release-chain): pack 增加 --out 隔离产物目录，修 main 上 EBUSY 并行争用"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/release-artifact-pipeline.md",
    "reason": "冒烟单实现化达成是发布链的长期事实；同时把执行者生成源码的转义纪律落进 contract-probe 卡"
  }
}
---

# 发布冒烟只留一份实现：yml 与本机门调同一个脚本

## 动机
v7.0.0 与 v7.0.1 连续两次发版各炸一个新点：第一次是 `workflow execute` 的字段被借走（`current`），第二次是变量被写成反引号形态。#53 建了第六门（`scripts/check-release-smoke.mjs`），门守的是**它自己那份断言**，而 CI 跑的是 `publish-release.yml` 里内联的另一份——**同一段验收逻辑存在两份实现**，改坏一份另一份毫无反应，于是「本机绿 + PR 绿 + 链红」可以稳定重现。#55 把上次的失败原文收进夹具（failure-as-fixture），那是给第二份实现打补丁；本 change 去掉「两份」这件事本身：断言只写在 `scripts/release-smoke.sh` 里，CI 步骤与本机离线腿都调它。做完后「本机绿」才第一次等价于「链会绿」，而不是「另一份实现碰巧也对」。

## 复杂度评级
- **评级:** L
- **理由:** ①契约变更——改 `release.published` 实际执行的断言载体与门的判定集；②触及面——发布链工作流、`scripts/` 两份、`package.json` 的 `ci` 串、套件、发布链卡；③可发现性——错法只在真发版暴露，两次实证。
- **期望验证深度:** runtime
- **取证策略:** assert-first（委派关系、断言条目齐备、第二份实现是否存在，全是可构造输入的静态断言）

## 领域模型

- **限界上下文:** `distribution` — 产物打包、多宿主分发、版本与发布链。上游 `execution-layer`；下游三宿主。反腐边界：不改 CLI 的 workflow 域实现，只调它。
- **统一语言增量:**
  - **单实现（single implementation）**：同一段验收逻辑在仓库里只有一个载体文件，其它位置只能调用它，不能复制它的断言。
  - **委派式冒烟（delegated smoke）**：CI 步骤体只剩一行调用与参数，失败信息可定位到脚本行号。
- **聚合与不变量:**
  - `INV-1 single-source`：`publish-release.yml` 的冒烟步骤必须调用 `scripts/release-smoke.sh`，且步骤内不得再出现任何断言原文（`data.`、`test -f`、`find`、`node -pe`）——违反判 `SMOKE_INLINE_ASSERTION`。
  - `INV-2 assertions-preserved`：脚本必须逐项保留既有五条断言（plan 版本、execute 的 `version`、`CURRENT` 指针、`norms/verification.md` 在位、skills 与 `EXPECTED` 实测相等）；缺任一条判 `SMOKE_ASSERTION_MISSING`——单实现化不得顺手削弱验收强度。
  - `INV-3 no-second-copy`：门源码不得自己再写一遍物化断言；离线腿必须以 `bash scripts/release-smoke.sh --from` 的退出码为唯一判据——违反判 `SMOKE_DUPLICATION`。
  - `INV-4 failure-as-fixture-kept`：v7.0.1 真实失败原文（反引号形态）喂给门仍必须判 `SMOKE_BACKTICK_SUBST`；迁移判定目标时不得把这条弄丢。
  - `INV-5 ci-failure-localizable`：脚本须 `set -euo pipefail` 且每条失败给出带 x 前缀的可定位消息；CI 侧只剩一行调用，行号即脚本行号。
- **领域事件:** 门判红 → release 阻塞；`release.published` 链第一次跑绿 → 三个发版载体（v7.0.0 / v7.0.1 / 下一个）方可归档。

## 引用规范
- `knowledge/contract-probe.md`
  - 当前结论: 三条放行判据；探针必须可反查；夹具必须与真实产物同构；门必须能复现上一次真实失败
  - 适用 scope: `norms/verification.md`、`scripts/`、`test/`、CI
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: 版本权威＝tag；资产名契约；冒烟走 plan → execute → status → bind；冒烟只应有一份实现（当前未达成 → 本 change 达成它）
  - 适用 scope: bump、tag、Release、发布链与冒烟

## 决策
- **选型:** 断言收敛到 `scripts/release-smoke.sh`（bash，双入口 `--release/--from`）；yml 步骤体改成一行调用；门改成「静态对账（委派关系 + 断言齐备 + 无第二份副本 + 反引号误用）+ 离线腿直接跑脚本」。
- **对比方案:** 让门继续做第二份断言并靠夹具对齐（否——两份实现在语义上永远可能漂移，夹具只能追已发生的错，不能防下一个没发生的）；用 node 重写冒烟（否——步骤体在 bash 里，改成 node 会新增一层调用与解释器依赖，Windows 侧还多一个 PATH 变量）；yml 用 `run: bash …` 但保留少量内联断言（否——「少量」就是第二次 v7.0.1）。
- **理由:** 唯一能消灭「本机绿+链红」三态的办法是让两者执行同一份代码。断言条数与内容不改，只改存放位置（INV-2 用机检把这条钉住，防止重构顺手削弱验收）。

## 任务
### Phase 1
- [x] 先写失败断言：委派关系缺失、断言条目缺失、第二份副本存在、真实失败原文仍判红 — `test/release-smoke.test.mjs`
- [x] 新建 `scripts/release-smoke.sh`：五条断言的单实现，双入口 `--release|--from`，`set -euo pipefail` — `scripts/release-smoke.sh`
- [x] 门改为对脚本做静态对账 + 离线腿调用脚本（退出码为唯一判据），并自检源码内不得再有物化断言 — `scripts/check-release-smoke.mjs`
- [x] `publish-release.yml` 冒烟步骤体改为一行委派调用 — `.github/workflows/publish-release.yml`
### Phase 2
- [x] 门与套件本机全绿；INV-1/2/3 各取拒绝路径与正例观察点 — `scripts/check-release-smoke.mjs`
- [x] 发布链卡把「当前未达成」改为结论并记三条链史 — `knowledge/release-artifact-pipeline.md`
- [x] `package.json` 的 `ci` 串与资产名单复核（`scripts/` 新增 .sh 需被产物收录） — `package.json`
- [x] 登记台账、回填结果段与后继清单，交 review — `shadow-docs/INDEX.md`

## 结果
- 实际耗时: 约 60 分钟（其中约 35 分钟耗在执行者自己的转义与吞原因错误上，有效工程时间约 25 分钟）
- 执行者自伤记录（不遮，共 7 次）：① `String.raw` 内含反引号 → 模板提前终止（2 次）；② `String.replace` 的替换串里出现美元符加引号 → 被当成后向引用，吃掉整行并把匹配后的文本重复插回（第 106 行与两份「知识评估」即其现场，本条自身也是同一坑的复发）；③ 在 `String.raw` 里多写一层反斜杠 → 落到文件成了坏正则；④ 把生成器写成「字符串拼字符串」再度触发解析错误；⑤ `try { spawnSync } catch {}` 把 ReferenceError 吞成「产物不存在」；⑥ 把 `resolveBash()` 的返回对象当字符串传给 spawnSync；⑦ 判定用 `l.includes(...) 时特征串写在自己源码里造成自指命中。收敛动作已写入 `knowledge/contract-probe.md` 新增条「AI 生成源码的转义纪律」：从 `git show HEAD:文件` 取回已验证版本、只做行级最小手术、判定一律用 includes/indexOf、需要引号用 `String.fromCharCode`、**改文本用数组 splice 而不是 replace（替换串含美元符必炸）**、每次写盘立刻 `node --check`、删净死函数与残留 import。此后语法检查全部一次通过。
- 验证: **L 级 · 取证策略 assert-first · 三条放行判据**逐条对账
- 复核: `package.json` 无需改动——`check:smoke` 已随 #53 进 `ci` 串与套件名单，且 pack 收录整个 `scripts/` 目录，新脚本自动进产物；故本 change 的实际改动面是 7 个文件加 1 个新增脚本。

| 不变量 | 观察点 |
|---|---|
| `INV-1 single-source` | 观察点（拒绝路径）：夹具 yml 未调用脚本 → `✗ SMOKE_NOT_DELEGATED`，rc=1；步骤体内残留断言原文 → `✗ SMOKE_INLINE_ASSERTION publish-release.yml:4`（行号并入定位字段））。观察点（正例）：真实仓库只剩 `bash scripts/release-smoke.sh --release ...` 一行 → `[.] 委派：CI 冒烟步骤只剩一行调用` |
| `INV-2 assertions-preserved` | 观察点（拒绝路径）：脚本从 `exec.json` 读 `.data.current` → `✗ SMOKE_UNKNOWN_FIELD`；删掉 bind 行 → `✗ SMOKE_ASSERTION_MISSING …bind 宿主版本一致`（点名缺哪条）；ROOT 改成 `prefix/$CUR/…` → `✗ SMOKE_BAD_LAYOUT`；缺 `set -euo pipefail` 同判红。观察点（正例）：`[.] 唯一实现：字段契约、7 条断言条目与变量形态成立` |
| `INV-3 no-second-copy` | 观察点：`checkNoSecondCopy` 扫门自身源码（特征串拆写避免自指）→ `[.] 无第二份实现：门只调用脚本，不自行驱动 CLI`；离线腿唯一判据是脚本退出码，实跑输出 `OK materialized root=…/shadow-dev-workflow-7.0.1 skills=9（与 CI 同一份实现）` 与 `materialized=1 deferred=0`；断言「门自身不得成为第二份实现」绿 |
| `INV-4 failure-as-fixture-kept` | 观察点：v7.0.1 的真实失败形态（变量写成反引号）作为脚本夹具喂给迁移后的门 → `✗ SMOKE_BACKTICK_SUBST` 带行号，rc=1；判定目标从 yml 迁到唯一实现后该能力未丢失 |
| `INV-5 ci-failure-localizable` | 观察点：唯一实现首行 `set -euo pipefail`、每条失败带 x 前缀；`publish-release.yml` 冒烟步骤只剩一行，失败行号即脚本行号（定位 run 38214942988 时靠 line 16 一步到位） |
| 三条放行判据 | 观察点：`npm run ci` 权威通道退出码 0；`npm test` 为 `tests 30 / pass 30 / fail 0`；六门摘要 `check:knowledge ok=11 fail=0`、`check:brief briefs=6 fail=0`、`check:smoke checks=4 fail=0 deferred=0 materialized=1`；regression 门槛按 CI 实测耗时 ≤ 60s 适用且满足 |

## 知识评估
- **预期影响:** 更新
- **候选卡片:** `knowledge/release-artifact-pipeline.md`、`knowledge/contract-probe.md`
- **理由:** 发布链卡把「冒烟只应有一份实现」从待办改为结论（含 7 条断言条目清单与两个委派判定）；探针层卡新增「AI 生成源码的转义纪律」——本轮 7 次自伤的根因不是粗心，而是用带多层转义的字符串手写源码，且失败信息被自己的 try/catch 吞掉。不新建卡，避免同一结论两处定义。

## 遗留与后续

1. `bash -c tar` 的 Windows 路径缺陷需再判一次：本轮离线腿在同通道实跑通过（`materialized=1`），与 #53/#55 记录的 deferred 不同——不据此宣布已修好，判据是它在 CI 与本机稳定复现或稳定不复现。
2. `shadow-dev-cli` 清单（跨上下文后继）：`--body-file/--message-file`；`release execute` 不校验 review passed（实证：review 未落时照样开出 PR #54）；`archive` 要求 `verifiedCommit == HEAD` 过严（本轮第三次撞上，均需回 main 重跑 review）。
3. `dist/` 仍未进 `.gitignore`：本 change 的离线腿会稳定产出 `dist`，当前靠显式文件列表提交侥幸不带入版本库。
4. v7.0.0 / v7.0.1 两个发版载体仍未归档：等本 change 合入后再发一版，`publish-release` 首次跑绿才同时归档三者。

6. **main 红灯归因（本 change 内发现并修复）**：`quality-gate push/main` 在 `e383212` 判红，Windows runner 报 `EBUSY: resource busy or locked, unlink dist/shadow-dev-workflow-v7.0.1.tar.gz`——根因是 #55 让门的离线腿与 `pack.test.mjs` 争用同一个 `dist/` 目录，而 `node --test` 并行执行测试文件。修复：`scripts/pack.mjs` 增加 `--out`（默认行为不变，tar 仍用相对路径但 `cwd` 换到 out 的父目录），门改为打包进各自隔离的 `<work>/dist`，并新增 INV-6 禁止争用共享产物目录。观察点：本机 `pack --out` 产出隔离 tarball，`npm run ci` 退出码 0 且 `tests 30 / pass 30`。
