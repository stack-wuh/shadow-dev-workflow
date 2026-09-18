---
name: shadow-dev-release
description: Knowledge 闭环 + 提交 + PR — review 通过后完成知识评估、提交代码并发布 PR。触发词：提交、commit、push、PR、发布、release。
---
# Shadow Dev Release — 知识闭环与发布

review 通过后先落实最终知识动作，再用复合命令一次完成提交、推送和 PR；若项目 Knowledge 声明部署触发方式（如 GitHub Release），继续完成交付发布与部署验证。归档由 `shadow-dev-archive` 在 PR merged 且部署链绿后独立处理。

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

## 4. 交付发布（项目条件性）

**PR merged ≠ 已部署。** 本仓库是否以 push/Release/tag 触发生产部署，答案只在项目 Knowledge 里——不得凭「CI 已绿」推断交付完成。

1. **判定：** 查询项目 `shadow-docs/menu.md` 构建/部署域路由（关键词：构建 部署 发布 release 上线 CI），命中卡片后按其「当前结论」确认部署触发方式。无命中或卡片无结论 → 用 AskUserQuestion 直接问用户「本仓库合并后如何上生产」，不猜。
2. **执行：** 项目声明 Release 触发部署 → 按卡片记录的流程创建 Release（优先项目自有发布脚本/技能，如 `pnpm release` 或 `github:release` 技能；版本号与标题格式以卡片记录的实际先例为准）。创建前向用户展示 repo/tag/target/标题并确认。
3. **验证：** 等待部署流水线全绿（如 `gh run watch <id> --exit-status`），将 release URL、run 结论与实际耗时写入 brief 的「结果」段。部署链红 → 停止并报告，不归档。

## 5. 输出

报告 change、分支、commit、PR、验证结果、最终 Knowledge 动作，以及交付发布结论（已部署 + Release URL / 或项目无部署触发）。

## 6. 下一步

PR merged 且**交付发布完成（或确认项目无部署触发）**后，执行 `shadow-dev-archive` 归档。也可由 GitHub Actions 在 issue close 时自动触发。

**离场：** 完成时输出：`✅ [离场] shadow-dev-release · PR: <url> · 部署: <release url 或 无部署触发> · 下一步: shadow-dev-archive（PR merged 且部署链绿后）`
