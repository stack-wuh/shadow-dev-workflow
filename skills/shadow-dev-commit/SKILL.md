---
name: shadow-dev-commit
description: 代码提交 — 推送功能分支到远端，自动创建 PR 并关联 Issue
---
# 📦 Commit — 代码提交

在 archive 之后，将功能分支推送远端并创建 PR。每个操作步骤均需用户确认后自动执行。

**前置条件:** apply 阶段已在功能分支上完成代码编写。分支命名遵循 `openspec/config.yaml` 的 `rules.branch`。

### 🐙 GitHub 操作兼容

所有 `gh` 命令默认使用 gh CLI；若 `gh` 不可用（沙箱环境），回退到 `curl` + `GITHUB_TOKEN` 调用 [GitHub REST API](https://docs.github.com/en/rest)。检测：`gh auth status 2>/dev/null`，失败则走 API。

**命令对照：**

| 操作 | gh CLI | curl 回退 |
|------|--------|-----------|
| PR 创建 | `gh pr create --title "..." --body "..." --base main` | `curl -s -X POST "https://api.github.com/repos/{owner}/{repo}/pulls" -d '{"title":"...","body":"...","head":"<branch>","base":"main"}'` |
| Issue 列表 | `gh issue list -s open --json number,title` | `curl -s "https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=30"` |

`{owner}/{repo}` 从 `gh repo view --json nameWithOwner 2>/dev/null` 或 `git remote get-url origin` 解析。

## 📋 步骤

### 🔍 [1/5] 展示变更预览

先收集当前 git 状态，列出所有待提交内容，让用户确认是否继续：

```bash
git status
git diff --stat
git log --oneline origin/main..HEAD 2>/dev/null || echo "(未推送提交)"
```

展示格式：

```
## 待提交变更预览

**分支:** <branch-name>
**未跟踪文件:** <N> 个
**已修改文件:** <N> 个
**本地提交:** <N> 个 (未推送)

| 文件 | 状态 |
|------|------|
| openspec/changes/archive/<name>/... | A |
| packages/xxx/xxx.ts | M |
| ...

详细 diff 可以执行 git diff 查看。
```

AskUserQuestion：「确认提交以上变更？」
- 选项：「确认继续」/「还需调整」

⏭️ 下一步: [2/5] 提交 openspec 文档

### 📄 [2/5] 提交 openspec 文档

展示即将执行的操作：

```
## 提交 openspec 文档

git add openspec/changes/archive/<name>/ openspec/specs/
git commit -m "docs(openspec): 归档需求文档 <name>"
```

AskUserQuestion：「确认提交 openspec 文档？」
- 选项：「确认执行」/「跳过」

确认后自动执行上述命令。

⏭️ 下一步: [3/5] 提交代码并推送

### 🚀 [3/5] 提交代码并推送

展示代码变更和时间线，生成 conventional commit message：

```
## 提交代码并推送

**分支:** <branch-name>
**commit message:** <type>(<scope>): <description>

**变更文件:**
- <file1> — <说明>
- <file2> — <说明>
```

AskUserQuestion：「确认提交代码并推送到远端？」
- 选项：「确认执行」/「还需调整」

确认后自动执行：

```bash
git add <changed-files>
git commit -m "<type>(<scope>): <description>"
git push origin <branch-name>
```

⏭️ 下一步: [4/5] 创建 PR

### 🔀 [4/5] 创建 PR

自动组装 PR 内容并预览：

**4a. 读取模板** — `.github/PULL_REQUEST_TEMPLATE.md`

**4b. 组装内容：**
- `Summary` ← `proposal.md` 的动机/变更范围章节
- `Changes` ← `tasks.md` 的任务列表（已完成的标 ✓）
- `Verification` ← review 阶段的审查结论

**4c. 关联 Issue：**
- `.openspec.yaml` 有 `issue` 字段 ➡️ 自动关联
- 没有 ➡️ AskUserQuestion：「选择 Issue」/「跳过」

**4d. 预览并确认：**

```
## PR 预览

**标题:** <type>: <change-name>
**关联 Issue:** #<N>

## Summary
<proposal 摘要>

## Changes
✓ <task 1>
✓ <task 2>
...

## Verification
<审查结论>
```

AskUserQuestion：「确认创建 PR？」
- 选项：「确认执行」/「还需调整」

确认后自动执行 `gh pr create`。`gh` 不可用时回退到 API（见上方 GitHub 操作兼容）。

⏭️ 下一步: [5/5] 输出结果

### 📊 [5/5] 输出结果

```
## 代码已提交 ✓

**功能分支:** <branch-name>
**openspec 文档:** 已提交 (archive/<name> + specs)
**代码提交:** <N> commits
**远端:** 已推送
**PR:** <url>
```

---

✅ **commit 完成** — 代码已推送，PR 已创建。关注 CI 结果和 code review 反馈。
