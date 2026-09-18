---
{
  "schema": "shadow-dev/v1",
  "name": "20260918-chore-cli-pin-130",
  "type": "chore",
  "scope": "cli",
  "status": "archived",
  "baseBranch": "main",
  "branch": "chore/20260918-chore-cli-pin-130",
  "files": [
    "package.json"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 15,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/15",
    "pullRequest": 16,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/16"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "6bdb826f6aac5ef1fad5fd21e1fce0b94c69ba5f",
    "verifiedAt": "2026-09-18T03:55:33.938Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:16",
    "planHash": "262c43f1d26085f24826b3f2ceebd9b8e484a062397e9c103acb593a36973e45",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[chore] 插件 pin 回升 v1.3.0",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\nshadow-dev-cli v1.3.0 已发布（新增 version 元命令，产物已上 GitHub Release）。插件 cliVersion 仍 pin v1.2.0，SessionStart 自举会把本机钉回无 version 的旧版。\n\n## 引用规范\n- install-distribution（CLI 仓知识卡）：pin 是 release 物化轨的锁版本入口。\n\n## 决策\n- package.json cliVersion：v1.2.0 → v1.3.0，单行 chore，无其他文件引用该版本。\n\n## 任务\n- [ ] 回升 pin — package.json — v1.3.0\n\n完整 brief：shadow-docs/changes/20260918-chore-cli-pin-130/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20260918-chore-cli-pin-130\",\"type\":\"chore\",\"scope\":\"cli\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20260918-chore-cli-pin-130/brief.md\",\"cliVersion\":\"1.3.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "chore"
      ]
    },
    "release": {
      "files": [
        "package.json",
        "shadow-docs/changes/20260918-chore-cli-pin-130/brief.md"
      ],
      "message": "chore(cli): cliVersion pin v1.2.0 → v1.3.0——bootstrap 锁到含 version 元命令的发布",
      "title": "chore(cli): bump pinned shadow-dev-cli to v1.3.0",
      "body": ""
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "re-confirm on merge commit"
  }
}
---

# 插件 pin 回升 v1.3.0

## 动机

shadow-dev-cli v1.3.0 已发布（新增 version 元命令，产物已上 GitHub Release）。插件 cliVersion 仍 pin v1.2.0，SessionStart 自举会把本机钉回无 version 的旧版。

## 引用规范

- install-distribution（CLI 仓知识卡）：pin 是 release 物化轨的锁版本入口。

## 决策

- package.json cliVersion：v1.2.0 → v1.3.0，单行 chore，无其他文件引用该版本。

## 任务

- [x] 回升 pin — package.json — v1.3.0
