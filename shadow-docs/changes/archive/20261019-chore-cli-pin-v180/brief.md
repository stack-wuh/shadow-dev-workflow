---
{
  "schema": "shadow-dev/v1",
  "name": "20261019-chore-cli-pin-v180",
  "type": "chore",
  "scope": "shadow-dev-workflow",
  "status": "archived",
  "baseBranch": "main",
  "branch": "chore/20261019-chore-cli-pin-v180",
  "files": [
    "package.json",
    "shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 75,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/75",
    "pullRequest": 76,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/76"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "c642331228017dc6f39d92dd27d290f34e634335",
    "verifiedAt": "2026-10-30T15:45:50.261Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:76",
    "planHash": "0f66dd4863015174cb5c198ab57692510343c85057d5a6d924ed902774587191",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[chore] cliVersion pin 升至 v1.8.0",
      "titleRaw": "cliVersion pin 升至 v1.8.0",
      "supplement": "Brief: shadow-docs/changes/20261019-chore-cli-pin-v180/（S 级一行变更,安装器零 diff）",
      "body": "## 动机\nCLI 已发布 v1.8.0（blog publish 支持 frontmatter issue 号驱动 upsert；video 制作流程模板），插件 pin 仍锁 v1.7.0——SessionStart 自举按 pin 装本机 CLI，v1.8.0 不 bump 则永远到不了消费仓库。既有发版模式：CLI 发版 → 插件 pin bump 随插件发版。\n\n## 引用规范\n- `knowledge/multi-host-plugin-distribution.md`\n  - 当前结论: SessionStart 自举按 `cliVersion` pin 精确安装；pin 与 CLI release 配对由 manifest 机检\n  - 适用 scope: 本变更唯一改动的语义\n\n## 决策\n- **选型:** 仅 `package.json` 的 `cliVersion` bump 为 v1.8.0\n- **对比方案:** 同步 vendored install-cli.sh——v1.7.0..v1.8.0 该文件零 diff（已验证），无从同步\n- **理由:** 上下两个 CLI 版本间安装器无变化，bump 后 hook 下一次会话自动把本机 CLI 升到 v1.8.0\n\n## 任务\n### Phase 1\n- [ ] pin bump——`package.json` — `cliVersion: v1.7.0 → v1.8.0`\n\n## 补充\nBrief: shadow-docs/changes/20261019-chore-cli-pin-v180/（S 级一行变更,安装器零 diff）\n\n完整 brief：shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261019-chore-cli-pin-v180\",\"type\":\"chore\",\"scope\":\"shadow-dev-workflow\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "chore"
      ]
    },
    "release": {
      "files": [
        "package.json",
        "shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md"
      ],
      "message": "chore(release): cliVersion pin 升至 v1.8.0——承接 blog publish upsert 与 video 模板",
      "title": "chore: cliVersion pin 升至 v1.8.0",
      "body": "Closes #75\n\n完整 brief：shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md"
    },
    "commit": {
      "files": [
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261019-chore-cli-pin-v180/brief.md"
      ],
      "message": "chore(index): 登记台账条目——补 gate 的 INDEX 门"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "squash 合并后 HEAD 同源重跑"
  }
}
---

# cliVersion pin 升至 v1.8.0——承接 blog publish upsert 与 video 模板

## 动机

CLI 已发布 v1.8.0（blog publish 支持 frontmatter issue 号驱动 upsert；video 制作流程模板），插件 pin 仍锁 v1.7.0——SessionStart 自举按 pin 装本机 CLI，v1.8.0 不 bump 则永远到不了消费仓库。既有发版模式：CLI 发版 → 插件 pin bump 随插件发版。

## 复杂度评级

- **评级:** S
- **理由:** 纯版本号变更（cliVersion v1.7.0 → v1.8.0）；vendored 安装器 v1.7.0..v1.8.0 零 diff 无需同步；无行为契约变更
- **期望验证深度:** code-read

## 引用规范

- `knowledge/multi-host-plugin-distribution.md`
  - 当前结论: SessionStart 自举按 `cliVersion` pin 精确安装；pin 与 CLI release 配对由 manifest 机检
  - 适用 scope: 本变更唯一改动的语义

## 决策

- **选型:** 仅 `package.json` 的 `cliVersion` bump 为 v1.8.0
- **对比方案:** 同步 vendored install-cli.sh——v1.7.0..v1.8.0 该文件零 diff（已验证），无从同步
- **理由:** 上下两个 CLI 版本间安装器无变化，bump 后 hook 下一次会话自动把本机 CLI 升到 v1.8.0

## 任务

### Phase 1
- [x] pin bump——`package.json` — `cliVersion: v1.7.0 → v1.8.0`

## 结果

- 实际耗时: 约 10 分钟
- 验证: npm run check:version 全绿（三处 manifest 版本同源 7.2.1——cliVersion 独立于插件版本）；check:brief 门闭合（4 份在途 brief）；diff 走查仅 cliVersion 一行；vendored 安装器 v1.7.0..v1.8.0 零 diff 已复核
- 验证: —

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 版本配对机制由既有卡片承载，本次是其常规执行
