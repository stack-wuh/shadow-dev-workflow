---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-fix-distribution-gate-regex",
  "type": "fix",
  "scope": "scripts",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "fix/20261009-fix-distribution-gate-regex",
  "files": [
    "knowledge/distribution-capability-contract.md",
    "package.json",
    "scripts/check-requires.mjs"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "c5319bb789131cf33377f93e593c080a2e7266d9",
    "verifiedAt": "2026-10-09T15:02:51.214Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "8a160fc3ce8c2fe18c2368cb4d61fedf1f6fb3971a4c46aed99c9e15b94c9fdf",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "package.json",
        "scripts/check-requires.mjs",
        "shadow-docs/changes/20261009-build-artifact-capability-gate/brief.md",
        "shadow-docs/changes/20261009-fix-distribution-gate-regex/"
      ],
      "message": "fix(scripts): 一致性门禁止跨行吞引用（负例必判红）+ 复原 npm test 两文件",
      "title": "[fix] 一致性门假绿修复：引用扫描禁止跨行 + npm test 复原",
      "body": ""
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/distribution-capability-contract.md",
    "reason": "卡片验证方式补入「门负例必跑 + 引用扫描禁止跨行」这条踩出来的稳定教训"
  }
}
---

# 一致性门不再跨行吞引用：负例必判红 + npm test 覆盖两个测试文件

## 动机
`check-requires.mjs` 的引用正则用了可跨行的 `\s+`，把下一条 `shadow-dev` 的 `shadow-` 前缀一起吃掉（实测 `repo inspect\nshadow-dev` 成为一组），导致 `worktree inspect` 等引用**从未被统计**——门会假绿，而假绿的门比没有门更危险（它给「pin 与声明已互校」的错误信心）。同一批改动还把 `scripts.test` 写成 `node --test test/`，在本机 node 22 下测试发现失败（`# tests 1 # fail 1`），main 上现在是红的。

## 复杂度评级
- **评级:** S
- **理由:** ①契约变更：无（门的判定逻辑修正与 npm script 复原，不改任何命令行为）；②触及面：单个脚本 + 一行 manifest；③可发现性：门正/负例与测试脚本立刻可判红。
- **期望验证深度:** code-read + 三条必判红/判绿冒烟（按 2026-10-09 裁决不写 TDD）

## 引用规范
- `knowledge/distribution-capability-contract.md`
  - 当前结论: 声明与消费两级包含、差集非空即判红；改 pin 后必须跑门。
  - 适用 scope: scripts/check-requires.mjs, package.json
- `norms/tdd-verification.md`：S 级不创建测试文件；既有测试必须保持绿。

## 决策
- **选型:** 正则改为禁止跨行（`[^\S\n]+`），并把两条判红路径都实跑验证；`scripts.test` 回到显式两文件。
- **对比方案:** 加测试文件钉住正则——未选（裁决：不写 TDD），改以「门负例必判红」冒烟作为交付证据，并写进卡片的验证方式。
- **理由:** 门是唯一保证 pin/声明不互相冒充的机制，它的假绿路径必须被当作 bug 当场证伪。

## 任务
### Phase 1
- [x] 修正引用正则 — `scripts/check-requires.mjs` — 禁止跨行匹配；重跑正例，引用数应上升且 `undeclared=[] missing-in-cli=[]`
- [x] 两条判红冒烟 — `scripts/check-requires.mjs` — (a) 从声明删一键 → 必 exit 1 且点名 `undeclared`；(b) 声明一个不存在键 → 必 exit 1 且点名 `missing-in-cli`（这就是 pin/CLI 过旧的判红路径）
- [x] 复原测试入口 — `package.json` — `scripts.test` = `node --test test/install-cli.test.mjs test/pack.test.mjs`，跑绿

## 非目标
- 不动 hooks/pin/两轨形态；不加 CI workflow（独立 change）

## 结果
- 实际耗时: ≈5 分钟
- 验证（S 级＝走查 + 三条冒烟）：门正例（引用数上升、两级差集为空）；负例 a 删一键 → exit 1 且 undeclared 点名；负例 b 声明不存在键 → exit 1 且 missing-in-cli 点名；`npm test` 两文件恢复全绿。
- 影响面自查：上一批（PR #36）把两条假绿带进了 main——门从未真正判过红、`npm test` 在 main 上是红的。本 change 是它自己的第一个真 bug。

## 知识评估
- **预期影响:** 更新
- **候选卡片:** `knowledge/distribution-capability-contract.md`
- **理由:** 卡片「验证方式」需补一条硬要求：**一致性门交付前必须跑负例证明它会判红**——这是本次踩出来的稳定教训，属原位更新不另立新卡。
