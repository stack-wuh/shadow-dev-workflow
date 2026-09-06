---
name: shadow-dev-release
description: Knowledge 闭环 + 提交 + PR — review 通过后完成知识评估、提交代码并发布 PR。触发词：提交、commit、push、PR、发布、release。
---
# Shadow Dev Release — 知识闭环与发布

review 通过后先落实最终知识动作，再用复合命令一次完成提交、推送和 PR。归档由 `shadow-dev-archive` 在 PR merged 后独立处理。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-release · 知识闭环与发布`

## 1. 落实知识结论

review 已把结论写入 brief 的 `knowledge` 字段（action：新增/更新/废弃/无需变更，附 target 和 reason）。release 直接消费，不重新评估：

- **无需变更**：零额外操作，直接进入第 2 步。
- **新增**：按 `domain + keywords + scope` 查重后，用 `norms/knowledge-cards.md` 的完整格式创建稳定主题卡片，并加入对应 menu 路由。
- **更新**：原位更新现有卡片，向 source 追加本次 brief；通过代码或可重复验证确认后更新 verified。
- **废弃**：status 改为 deprecated，指向替代卡片或明确写明无替代；确认无有效引用后才能删除。
- **brief 无 knowledge 字段**（旧流程遗留）：补做一次完整评估（含查重），再按上述规则处理。

Knowledge 不保存一次性实现过程或验证输出。Knowledge 写入和 menu 更新必须在 `release plan` 之前完成。

## 2. 发布计划与确认

```bash
shadow-dev release plan --name <name> --files <逗号分隔路径> --message "<message>" --title "<PR 标题>"
```

plan 输出已包含分支、变更文件、仓库状态和 PR 参数，planHash 和执行参数自动写入 brief——不需要读取、搬运哈希或在 execute 时重复传参。列出 change、文件和知识结论，使用 AskUserQuestion 确认执行。

## 3. 执行发布

```bash
shadow-dev release execute --name <name> --confirm
```

一条命令完成 commit → push → 查询/创建 PR。幂等：已提交则跳过 commit，已有 open PR 则复用。失败处理：`GIT_PUSH_FAILED`、`PR_CREATE_FAILED` 或 `API_TIMEOUT` 时修复网络/凭证后，重新 `release plan` 再 `execute` 即可断点续跑。

禁止原始 Git/GitHub 写命令、`git add .`、`git add -A` 和 `--no-verify`。网络步骤失败立即停止，不换方式重试。

## 4. 输出

报告 change、分支、commit、PR、验证结果和最终 Knowledge 动作。

## 5. 下一步

PR merged 后执行 `shadow-dev-archive` 归档。也可由 GitHub Actions 在 issue close 时自动触发。

**离场：** 完成时输出：`✅ [离场] shadow-dev-release · PR: <url> · 下一步: shadow-dev-archive（PR merged 后）`
