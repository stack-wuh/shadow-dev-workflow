---
name: shadow-dev-archive
description: 归档已合并的 change — PR merged 后将 brief 移到 archive/ 并重建 INDEX。触发词：归档、archive。
---
# Shadow Dev Archive — 归档

PR 合并后将 change 归档。可由 `shadow-dev-release` 完成后手动调用，或由 GitHub Actions 在 issue close 时自动触发。

## 前置条件

- PR 已 merged（CLI 通过 GitHub API 验证）
- review conclusion 为 passed
- HEAD 与 review 时的 verifiedCommit 一致

## 流程

### 1. 展示归档预览

```bash
node scripts/shadow-dev.mjs archive plan --name <name>
```

预览将移动的 change 目录和 INDEX 变更。

### 2. 执行归档

```bash
node scripts/shadow-dev.mjs archive execute --name <name> --plan-hash <hash> --confirm
```

具体操作：
- 将 `shadow-docs/changes/<name>/` 移动到 `shadow-docs/changes/archive/<name>/`
- 重建 `INDEX.md`

### 3. 自动归档（GitHub Actions）

issue close 时 webhook 自动 dispatch `archive-change` 事件，由 `.github/workflows/archive-on-issue-close.yml` 执行上述步骤并 commit + push 回 main。

## 禁止

- PR 未合并时执行归档
- 手动移动 change 目录或手改 INDEX
