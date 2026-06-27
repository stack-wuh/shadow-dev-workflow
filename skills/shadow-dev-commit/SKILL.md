---
name: shadow-dev-commit
description: 代码提交 — 推送功能分支到远端，自动创建 PR 并关联 Issue
---
# 📦 Commit — 代码提交

在 archive 之后，将功能分支推送远端并创建 PR。

**前置条件:** apply 阶段已在功能分支上完成代码编写。分支命名遵循 `openspec/config.yaml` 的 `rules.branch`。

## 📋 步骤

### 📄 [1/6] 提交 openspec 文档

在主仓库中提交 archive 阶段产生的 openspec 文档变更（归档目录 + 合并后的 specs）。

```bash
git add openspec/changes/archive/<name>/ openspec/specs/
git commit -m "docs(openspec): 归档需求文档 <name>"
```

→ 下一步: [2/6] 提交代码

### 💾 [2/6] 提交代码

在当前功能分支上提交所有代码改动，遵守 conventional commits（`type(scope): description`）。

```bash
git add <changed-files>
git commit -m "type(scope): description"
```

→ 下一步: [3/6] 推送功能分支

### 🚀 [3/6] 推送功能分支

```bash
git push origin <branch-name>
```

→ 下一步: [4/6] 清理 worktree

### 🧹 [4/6] 清理 worktree（仅 worktree 模式）

如果 apply 阶段使用了 worktree，合入后清理：

```bash
git checkout <branch-name>
git merge <worktree-branch>
git worktree remove <worktree-path>
git branch -d <worktree-branch>
git worktree prune
```

未使用 worktree 则跳过此步。

→ 下一步: [5/6] 创建 PR

### 🔀 [5/6] 创建 PR

PR 由 openspec 制品自动生成。

**5a. 读取模板**

读取 `.github/PULL_REQUEST_TEMPLATE.md`。

**5b. 填充模板**

- `Summary` ← `proposal.md` 的动机/变更范围章节
- `Changes` ← `tasks.md` 的任务列表（已完成的标 ✓）
- `Verification` ← review 阶段的审查结论

**5c. 关联 Issue**

- 如果 `.openspec.yaml` 已有 `issue` 字段 → 替换模板中 `{{issue}}` 为实际编号
- 如果没有 → AskUserQuestion：
  - "选择 Issue" → `gh issue list --state open --json number,title` 浏览选择
  - "跳过，不关联 Issue"

**5d. 执行**

```bash
gh pr create --title "feat: <change-name>" --body "<filled-template>"
```

**前置条件:** `gh auth status` 已登录。未登录时提示用户先执行 `gh auth login`。

→ 下一步: [6/6] 输出

### 📊 [6/6] 输出

```
## 代码已提交

**功能分支:** <branch-name>
**openspec 文档:** 已提交 (archive/<name> + specs)
**代码提交:** <N> commits
**远端:** 已推送
**PR:** <url>
```

---

✅ **commit 完成** — 代码已推送，PR 已创建。关注 CI 结果和 code review 反馈。
