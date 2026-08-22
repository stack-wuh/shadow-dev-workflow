---
name: shadow-dev-release
description: Knowledge 闭环 + 提交 + PR — review 通过后完成知识评估、提交代码并发布 PR。触发词：提交、commit、push、PR、发布、release。
---
# Shadow Dev Release — 知识闭环与发布

review 通过后先完成最终知识评估，再提交和发布 PR。归档由 `shadow-dev-archive` 在 PR merged 后独立处理。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-release · 知识闭环与发布`

## 1. 检查最终知识评估

brief 必须包含最终结果和理由：新增、更新、废弃或无需变更。新增或更新前按 `domain + keywords + scope` 查重。

### 新增

创建稳定主题卡片，使用 `norms/knowledge-cards.md` 的完整格式，并加入对应 menu 路由。

### 更新

原位更新现有卡片，向 source 追加本次 brief；通过代码或可重复验证确认后更新 verified。

### 废弃

将 status 改为 deprecated，指向替代卡片或明确写明无替代。确认无有效引用后才能删除。

### 无需变更

不创建形式化卡片，只在 brief 记录没有产生长期事实的理由。

Knowledge 不保存一次性实现过程或验证输出。写入和 menu 更新必须在提交前完成。当前 CLI 不负责 Knowledge 文件时使用普通文件编辑，不虚构新 CLI。

## 2. 展示提交预览

```bash
shadow-dev repo inspect
shadow-dev commit plan --name <name> --files <逗号分隔路径> --message "<message>"
```

列出分支、change、明确文件和知识评估结果，使用 AskUserQuestion 确认执行。

## 3. 提交和创建 PR

```bash
shadow-dev commit execute --name <name> --plan-hash <hash> --confirm
shadow-dev publish plan --name <name>
shadow-dev publish execute --name <name> --plan-hash <hash> --confirm
```

禁止原始 Git/GitHub 写命令、`git add .`、`git add -A` 和 `--no-verify`。网络步骤失败立即停止，不换方式重试。publish 使用 brief 中 `data.type` 自动映射到仓库已定义的 label。

## 4. 输出

报告 change、分支、PR、验证结果和最终 Knowledge 动作。

## 5. 下一步

PR merged 后执行 `shadow-dev-archive` 归档。也可由 GitHub Actions 在 issue close 时自动触发。

**离场：** 完成时输出：`✅ [离场] shadow-dev-release · PR: <url> · 下一步: shadow-dev-archive（PR merged 后）`
