---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-chore-manifest-version-sync",
  "type": "chore",
  "scope": "packaging",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "chore/20261009-chore-manifest-version-sync",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json"
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
    "verifiedCommit": "a2ec8723c3f3639e60b095ed17cb942ec47b51d8",
    "verifiedAt": "2026-10-09T15:05:39.668Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "29fc3c98943eceab3daad21902f12d0d4b614f0b43eee71463db84f5bde159e3",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "package.json",
        "shadow-docs/changes/20261009-build-artifact-capability-gate/brief.md",
        "shadow-docs/changes/20261009-chore-manifest-version-sync/"
      ],
      "message": "chore(plugin): plugin/codex 清单版本对齐 package.json 6.5.1——既有 pack 机检判红的封口",
      "title": "[chore] 清单版本对齐 v6.5.1（机检判红封口）",
      "body": ""
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "版本号一致性修复，由既有 pack 机检保证，无新增长期事实"
  }
}
---

# 清单版本与 package.json 对齐（v6.5.0 发版漏同步的机检抓到我自己）

## 动机
上一批把 `package.json` 升到 6.5.0 却没同步 plugin 清单，被本仓既有测试 `pack: 三处 manifest 版本与 package.json 对齐（发版漏同步的机检）` 判红——这条机检正是第一轮复盘说的「manifest 漏同步」缺陷的解法，这次它抓的是我。已发布的 v6.5.0 产物内清单版本不一致，需以 6.5.1 覆盖发布。

## 复杂度评级
- **评级:** S
- **理由:** ①无行为契约变更（纯版本号一致性）；②只碰清单与 manifest；③既有测试当场判红，可发现性最高。
- **期望验证深度:** code-read + `npm test` 全绿 + 产物解包核对

## 引用规范
- `norms/knowledge-cards.md`；本仓 `test/pack.test.mjs` 的三清单同源断言（既有契约，不得绕过）
- `knowledge/distribution-capability-contract.md`：pin/声明/清单三处同源，任何一处变化都要有机检判红——本次由既有门判出，属机制生效

## 决策
- **选型:** `package.json` + 全部 plugin 清单一次升到 **6.5.1**，重发产物；不改测试迁就漏同步。
- **对比方案:** 直接改 v6.5.0 release 的资产——未选，release 资产与 tag 已分发，覆盖式修补不可追溯。
- **理由:** 版本号一致性靠机检保证，破口必须用新版本封口。

## 任务
### Phase 1
- [x] 清单版本对齐 — `package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` — 全部升 6.5.1；`npm test` 两文件全绿
- [x] 覆盖发布 — `.agents/plugins/marketplace.json` — `node scripts/pack.mjs` 后发 v6.5.1，解包核对三处版本一致且 `requiresCommands` 存在

## 非目标
- 不动门逻辑与命令行为；不加 CI

## 结果
- 实际耗时: —
- 验证: —

## 知识评估
- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 「清单版本必须与 package.json 同步且由机检保证」已在 `test/pack.test.mjs` 断言与 distribution 卡片的同源约束里；本次是该约束的正常执行结果，不是新事实。
