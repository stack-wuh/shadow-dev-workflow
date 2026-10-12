---
name: shadow-dev-release
description: Knowledge 闭环 + 提交 + PR + 合并后归档 — review 通过后完成知识评估、提交发布 PR，并在 merged 后归档 brief。触发词：提交、commit、push、PR、发布、release。
---
# Shadow Dev Release — 知识闭环、提交与归档

review 通过后先落实最终知识动作，再用复合命令一次完成提交、推送和 PR；PR merged 后在本阶段末段归档 brief 并重建 INDEX——所有代码问题提交完即收口，不再把归档留成需要单独记得跑的下一步。正式对外发版（打 release tag、创建 GitHub Release）不属本阶段，由 `shadow-dev-publish` 独立承担。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。唯一边界：知识卡片与 menu 的编辑是 AI 的内容产出（推导+决策的落地）。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-release · 知识闭环与提交`

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

plan 输出已包含分支、变更文件、仓库状态和 PR 参数，planHash 和执行参数自动写入 brief——不需要读取、搬运哈希或在 execute 时重复传参。列出 change、文件和知识结论，向用户提问确认执行。

## 3. 执行发布

```bash
shadow-dev release execute --name <name> --confirm
```

一条命令完成 commit → push → 查询/创建 PR。幂等：已提交则跳过 commit，已有 open PR 则复用。失败处理：`GIT_PUSH_FAILED`、`PR_CREATE_FAILED` 或 `API_TIMEOUT` 时修复网络/凭证后，重新 `release plan` 再 `execute` 即可断点续跑。

禁止原始 Git/GitHub 写命令、`git add .`、`git add -A` 和 `--no-verify`。网络步骤失败立即停止，不换方式重试。

## 4. 等待 merged 并同步基线

归档前置是「GitHub API 证明 PR merged」，本阶段在此等待，不提前归档。合并后同步本地 main：

```bash
shadow-dev sync plan --name <name>
shadow-dev sync execute --name <name> --confirm
```

`sync plan` 对非 `shadow-docs/` 的脏文件报 `DIRTY_WORKTREE`，此时先清理工作树再继续。HEAD 必须与 review 的 `verifiedCommit` 同源；不一致时在 main 上重跑 review 的 plan + execute，不带着漂移归档。

## 5. 归档 brief 与重建 INDEX

```bash
shadow-dev archive plan --name <name>
shadow-dev archive execute --name <name> --confirm
```

CLI 校验 review passed 且 PR merged 后，把 `shadow-docs/changes/<name>/` 移入 `shadow-docs/changes/archive/<name>/` 并重建 `INDEX.md`，归档动作以本地提交落地。

- **归档提交只动 `shadow-docs/`**：不得触碰 `package.json` 与两份宿主清单——版本权威由发版阶段独占，混进来会让 tag 指向的 tree 与实际发布内容分裂。
- **brief 需一并进提交**：本 change 的 brief 在 `release plan` 的 `--files` 里就要列入，不靠归档提交补。
- 独立 workspace（`brief.workflow.worktree` 有记录）时归档前先回收：`shadow-dev worktree remove plan --name <name>` + `shadow-dev worktree remove execute --name <name> --confirm`；脏 workspace 以 `WORKTREE_DIRTY` 拒绝，用户明确要求保留现场时可跳过，但须在报告中写明路径。
- 漏归档、Actions 自动归档失败或 hotfix 事后补归档，用 `shadow-dev-archive` 作为幂等恢复入口补跑，不手改目录与 INDEX。

## 6. 输出

报告 change、分支、commit、PR、验证结果、最终 Knowledge 动作与归档结果（brief 新路径、INDEX 是否已重建）。

**正式发版不属本阶段**：需要对外发布可安装产物时，由 `shadow-dev-publish` 承担（bump → tag → 创建 Release → 审查 Actions 发布链 → 归档发版载体）。项目 Knowledge 若声明其它部署触发方式，按该卡片判定交付证据落点，不凭「CI 已绿」推断已交付。

## 7. 下一步

单个变更的流程到归档即收口。对外发布按需触发 `shadow-dev-publish`——发版与 change 解耦，可攒多个已合并 change 一次发布，不要求每个 change 都发版。

**离场：** 完成时输出：`✅ [离场] shadow-dev-release · PR: <url> · 归档: <archive 路径> · 下一步: shadow-dev-publish（需对外发版时）`
