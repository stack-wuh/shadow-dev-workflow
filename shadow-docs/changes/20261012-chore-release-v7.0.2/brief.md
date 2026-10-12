---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-chore-release-v7.0.2",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261012-chore-release-v7.0.2",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-chore-release-v7.0.2/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 58,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/58"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "7933ee5d90703d6c53e3e0bfe43d7e68f320eb18",
    "verifiedAt": "2026-10-12T07:57:44.794Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:58",
    "planHash": "a89dcf5f002bae242548f09b19374e083476b361334d2841669e42fa24f81779",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-chore-release-v7.0.2/brief.md"
      ],
      "message": "chore(release): v7.0.2 bump manifest",
      "title": "[chore] 发版载体 v7.0.2",
      "body": "v7.0.0与v7.0.1冒烟连红。#55收失败为夹具 #56/#57单实现化与EBUSY隔离。修复已合main 须发版取链绿证据。 内容：7.0.1升到7.0.2 bump cliVersion pin不动。 验证：npm run ci退出码0 六门fail=0 npm test 30/30。 合并后待你执行：bump复核 然后打tag推送 然后创建Release 逐条见brief。"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "发版事实待第5步执行后回填"
  }
}
---

# 发版 v7.0.2

## 动机
v7.0.0 与 v7.0.1 连续两次发版冒烟判红。修复已合入 main（#55 failure-as-fixture、#56/#57 冒烟单实现化与 pack 隔离输出），必须再发一版才拿得到 publish-release 链绿证据。

## 复杂度评级
- **评级:** S
- **理由:** 纯声明式版本 bump，零行为契约变更。
- **期望验证深度:** code-read

## 覆盖范围（已合并未发布）
- #55 fix-smoke-failure-as-fixture — 门收 v7.0.1 真实失败为夹具（backtick-substitution），本机 materialized= 位自我防线
- #56/#57 refactor-release-smoke-single-implementation — 冒烟收敛为唯一实现，yml 只剩一行委派，离线腿与 CI 同调一份脚本；pack 增加 --out 隔离产物目录（修 main 上 EBUSY 并行争用）

## 引用规范
- knowledge/release-artifact-pipeline.md：版本权威＝tag；资产名契约；冒烟走单实现脚本并输出 OK materialized root=... skills=N

## 决策
- **选型:** patch bump 到 7.0.2。tag 指向含 bump 与归档提交的 main。
- **理由:** version 是对外承诺；7.0.1 链红案已结，7.0.2 让消费侧拿到的产物与链绿证据第一次对应同一棵树。只 bump 三份 manifest，cliVersion pin 不动。

## 任务
### Phase 1
- [x] bump 三份 manifest 到 7.0.2 — package.json .claude-plugin/plugin.json .codex-plugin/plugin.json
- [x] 登记台账条目 — shadow-docs/INDEX.md
- [x] 六门一体本机全绿后发 PR — package.json

## 结果
- 实际耗时: —
- 验证: —

## 知识评估
- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 字段契约与离线冒烟长期事实已由 release-artifact-pipeline.md 持有（#53/#55/#56 落卡）。
