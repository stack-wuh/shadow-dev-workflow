---
name: shadow-dev-commit
description: 代码提交 — 推送、创建 PR、合并、清理分支一气呵成
---
# 📦 Commit — 代码提交

archive 之后，一键完成：提交 → 推送 → 创建 PR → 合并 PR → 清理分支 → 切回 main。

**前置条件:** 代码已在功能分支上编写完成。

## 步骤

### 1. 展示变更预览 + 确认

```bash
git status
git diff --stat
```

展示待提交内容，让用户确认一次：

```
## 待提交变更

**分支:** 42-feat-相邻文章优化

| 文件 | 状态 |
|------|------|
| openspec/changes/archive/... | A |
| packages/xxx/xxx.ts | M |

确认后自动完成: commit → push → create PR → merge PR → cleanup → checkout main
```

AskUserQuestion：「确认执行？」（「确认执行」/「还需调整」）

### 2. 提交代码

```bash
# 提交 openspec 文档
git add openspec/changes/archive/<name>/ openspec/specs/
git commit -m "docs(openspec): 归档需求文档 <name>"

# 提交代码
git add <changed-files>
git commit -m "<type>(<scope>): <description> (#42)"
```

### 3. 推送 + 创建 PR + 合并 + 清理

```bash
# 推送
git push origin <branch>

# 创建 PR（squash merge 到 main）
gh pr create --title "<type>: <change-name> (#42)" --body "<summary>" --base main

# 合并 PR（squash）
gh pr merge --squash --delete-branch

# 切回 main 并同步
git checkout main
git pull origin main
```

**错误处理：** 任何步骤失败 → 立即停止 → 展示该步骤的手动命令 → 等待用户。不重试，不回退。

### 4. 输出结果

```
## 已完成 ✓

**变更:** <change-name>
**分支:** 已删除 <branch>
**当前分支:** main
**远端:** 已同步
```
