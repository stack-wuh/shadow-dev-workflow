---
name: shadow-dev-commit
description: 代码提交 — 推送、创建 PR、合并、清理分支一气呵成，并自动关闭关联 Issue
---
# 📦 Commit — 代码提交

archive 之后，一键完成：提交 → 推送 → 创建 PR → 开启 auto-merge → 清理分支 → 切回 main，并让关联 Issue 自动关闭。

## 0. 检查分支状态

```bash
git branch --show-current
```

- **如果在功能分支上** → 正常走 PR 流程（后续步骤自动完成）
- **如果在 main 上** → 检查 `openspec/changes/archive/<change-name>/` 是否存在：
  - 存在 → 说明 archive 已完成，直接提交文档改动即可（跳过 PR 流程）
  - 不存在 → 要求先走 archive 流程，不要直接提交

分支确认后继续下一步。

## 步骤

### 1. 展示变更预览 + 确认

```bash
git status
git diff --stat
```

展示待提交内容，让用户确认一次，并检查 `.openspec.yaml` 中的 `issue` 字段是否存在：

- 如果 `issue` 为空，立即停止，要求先回到 `propose` 补齐 Issue
- 如果 `issue` 存在，提取编号并继续

```
## 待提交变更

**分支:** 42-feat-相邻文章优化

| 文件 | 状态 |
|------|------|
| openspec/changes/archive/... | A |
| packages/xxx/xxx.ts | M |

确认后自动完成: commit → push → create PR → enable auto-merge → cleanup → checkout main → close Issue
```

AskUserQuestion：「确认执行？」（「确认执行」/「还需调整」）

### 💾 [2/4] 提交代码

```bash
# 提交 openspec 文档
git add openspec/changes/archive/<name>/ openspec/specs/
git commit -m "docs(openspec): 归档需求文档 <name>"

# 提交代码
git add <changed-files>
git commit -m "<type>(<scope>): <description> (#42)"
```

### 🔀 [3/4] 推送 + 创建 PR + 合并 + 清理

先从 `.openspec.yaml` 的 `issue` 字段提取编号，作为 PR 标题和关闭关联的唯一来源。

```bash
# 推送
git push origin <branch>

# 创建 PR（PR body 必须包含 Closes #42）
gh pr create --title "<type>: <change-name> (#42)" --body "<summary>\n\nCloses #42" --base main

# 开启自动合并（squash）
gh pr merge --auto --squash --delete-branch

# 切回 main 并同步
git checkout main
git pull origin main
```

**错误处理：** 任何步骤失败 → 立即停止 → 展示该步骤的手动命令 → 等待用户。不重试，不回退。

### 🎁 [4/4] 输出结果

```
## 已完成 ✓

**变更:** <change-name>
**分支:** 已删除 <branch>
**当前分支:** main
**远端:** 已同步
**Issue:** 已随 PR 自动合并后关闭
```
