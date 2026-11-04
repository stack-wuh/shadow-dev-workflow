---
{
  "schema": "shadow-dev/v1",
  "name": "20261104-chore-cli-pin-v190",
  "type": "chore",
  "scope": "package.json",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261104-chore-cli-pin-v190",
  "files": [
    "package.json"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 81,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/81"
  },
  "review": {
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:81",
    "planHash": "fcfcddc2b1484a4a48d3e0695e8fedc67a5a3f77d2c21fdf1bf4b965a433b3c0",
    "updatedAt": null,
    "lastError": null,
    "commit": {
      "files": [
        "package.json"
      ],
      "message": "chore: cliVersion pin v1.8.0 → v1.9.0——SessionStart 自举不再回滚已发版 CLI"
    }
  }
}
---

# cliVersion pin 对齐 v1.9.0：SessionStart 自举不再回滚 CLI

## 动机

插件 SessionStart 钩子（bootstrap-cli.sh）按 package.json 的 `cliVersion` 重装 CLI。pin 落后（v1.8.0，插件缓存实装甚至 v1.4.0）导致宿主每次重启把已发版的 CLI 指针回滚——2026-11-03/04 两次实测回滚波及 desktop 发布链联调（CLI v1.9.0 的 blog unpublish 能力被降版本）。CLI v1.9.0 已发布（blog unpublish + 重新上架语义），pin 应对齐。

## 复杂度评级

- **评级:** S
- **理由:** 纯声明式配置（pin 字符串），零行为契约变更
- **期望验证深度:** code-read

## 引用规范

- knowledge/install-distribution.md（install 安装器 CURRENT/PREVIOUS 指针契约）
  - 当前结论: 钩子按 pin 幂等自举；指针与版本目录一致则不触网
  - 适用 scope: package.json
  - 遵循方式: 仅改 pin 值，安装器路径与逻辑不动

## 决策

- **选型:** pin v1.8.0 → v1.9.0；插件缓存（6.3.1）已同步手工补丁，源仓为本修

## 任务

### Phase 1
- [x] cliVersion v1.8.0 → v1.9.0 — `package.json` — 编辑

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** pin 值维护，install-distribution 卡既述机制
