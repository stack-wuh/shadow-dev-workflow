---
name: shadow-dev-ship
description: 归档 + 提交 + PR — 将 brief.md 移到 archive/，更新索引，提 PR。触发词：提交、commit、push、PR、发布、归档。
---
# 📦 Wuh Ship — 归档 + 提交

review 通过后将变更归档，提交代码，提 PR。**纯文档管理 + git 操作。**

## 流程

### 1. 展示变更预览

```bash
git status
git diff --stat
```

```
## 待提交变更

**分支:** feat-add-share-button
**变更:** 2026-08-01-add-share-button

| 文件 | 状态 |
|------|------|
| ... | ... |

确认后完成: 归档 → commit → push → PR
```

AskUserQuestion：确认执行。

### 2. 归档 brief

```bash
# 移到 archive
mv shadow-docs/changes/<name> shadow-docs/archive/<name>
```

### 3. 提炼知识

检查本变更是否有值得沉淀的领域知识。如有，创建对应的 `shadow-docs/knowledge/<slug>.md`：

```markdown
---
keywords: [关键词1, 关键词2]
---

# <知识标题>

<一句话描述这条知识>
```

ASKUserQuestion 让用户确认要沉淀的知识条目。

### 4. 更新 INDEX

如 `shadow-docs/INDEX.md` 不存在则创建：

```markdown
# 变更索引

| 日期 | 变更 | 关键词 | 状态 |
|------|------|--------|------|
| 2026-08-01 | add-share-button | 分享, 博客, UI | ✅ 完成 |
```

活跃变更标记为 🔄 进行中。每次 ship 时更新对应行状态。

### 5. 提交代码

```bash
git add shadow-docs/archive/<name>/ shadow-docs/knowledge/ shadow-docs/INDEX.md
git commit -m "docs(changes): 归档变更 <name>"

git add <改动的源代码>
git commit -m "<type>(<scope>): <description>"
```

### 6. 推送 + 创建 PR

```bash
git push origin <branch>
gh pr create --title "<type>: <description>" --body "<summary>" --base main
```

**错误处理**: 任何步骤失败 → 立即停止 → 展示手动命令。gh 操作最多尝试 1 次，不重试。

### 7. 输出结果

```
## 已完成 ✓

**变更:** <name>
**分支:** <branch>
**PR:** <url>
```

---

✅ **ship 完成** — 关注 CI 结果和 review 反馈。
