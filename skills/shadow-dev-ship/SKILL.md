---
name: shadow-dev-ship
description: 归档 + 提交 + PR — 将 brief.md 移到 archive/，更新索引，提 PR。触发词：提交、commit、push、PR、发布、归档。
---
# Shadow Dev Ship — 归档 + 提交

review 通过后将变更归档，提交代码，提 PR。**纯文档管理 + git 操作。**

## 流程

### 1. 展示变更预览

```bash
node scripts/shadow-dev.mjs repo inspect
node scripts/shadow-dev.mjs commit plan --name <name> --files <逗号分隔路径> --message "<message>"
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

归档仅在 GitHub API 已证明 PR merged 后执行，正确路径为 `shadow-docs/changes/archive/<name>/brief.md`：

```bash
node scripts/shadow-dev.mjs archive plan --name <name>
node scripts/shadow-dev.mjs archive execute --name <name> --plan-hash <hash> --confirm
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

INDEX 只能通过 CLI 重建：

```bash
node scripts/shadow-dev.mjs index rebuild plan
node scripts/shadow-dev.mjs index rebuild execute --plan-hash <hash> --confirm
```

### 5. 提交代码

只提交明确文件，禁止 `git add .`、`git add -A`、`--no-verify` 或原始 Git 写命令：

```bash
node scripts/shadow-dev.mjs commit execute --name <name> --plan-hash <hash> --confirm
```

### 6. 推送 + 创建 PR

```bash
node scripts/shadow-dev.mjs publish plan --name <name>
node scripts/shadow-dev.mjs publish execute --name <name> --plan-hash <hash> --confirm
```

**错误处理**: 任何步骤失败立即停止，不重试。所有 Git/GitHub 写操作只能通过 CLI。

### 7. 输出结果

```
## 已完成 ✓

**变更:** <name>
**分支:** <branch>
**PR:** <url>
```

---

✅ **ship 完成** — 关注 CI 结果和 review 反馈。
