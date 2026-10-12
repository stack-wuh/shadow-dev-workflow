---
name: shadow-dev-archive
description: 归档恢复入口 — 幂等补跑已合并 change 的 brief 归档与 INDEX 重建。正常流程由 release 末段自动归档，本技能用于漏归档、Actions 失败与 hotfix 事后补跑。触发词：归档、archive。
---
# Shadow Dev Archive — 归档（恢复入口）

**正常流程不需要单独跑本技能**：`shadow-dev-release` 在 PR merged 后已在末段完成归档。本技能是**幂等恢复入口**，用于三种场景——历史 change 漏归档、GitHub Actions 自动归档失败、hotfix 无 issue 需事后补归档。也可由 Actions 在 issue close 时自动触发。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。归档动作本体由 CLI 完成（移动目录、重建 INDEX、本地提交）。唯一允许的原始 git 命令：合并后本地 main 落后时的 `git pull --ff-only`（只读性质的 fast-forward 同步）；其余一切写操作经 CLI。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-archive · 归档 merged change`

## 前置条件

- 本地 main 与远端一致（落后时先 `git pull --ff-only`；HEAD 必须与 review 的 verifiedCommit 同源，不一致时在 main 上重跑 review plan + execute）
- PR 已 merged（CLI 通过 GitHub API 验证）
- review conclusion 为 passed
- brief `workflow.worktree` 有记录的独立 workspace 时，归档前先回收：`shadow-dev worktree remove plan --name <name>` + `shadow-dev worktree remove execute --name <name> --confirm`（脏 workspace 会以 `WORKTREE_DIRTY` 拒绝；用户明确要求保留现场时可跳过回收，但须在归档报告中写明 workspace 路径）

**发版结论不是归档前置**：正式对外发版（打 tag、创建 Release）属 `shadow-dev-publish`，与单个 change 的归档解耦——已合并的 change 不因「还没发版」而禁止归档。若项目 Knowledge 另声明了别的部署触发方式并要求交付证据，按该卡片把结论写进 brief「结果」段，但归档动作本身仍只要求 merged + review passed。

## 流程

### 1. 展示归档预览

```bash
shadow-dev archive plan --name <name>
```

预览将移动的 change 目录和 INDEX 变更。

### 2. 执行归档

```bash
shadow-dev archive execute --name <name> --confirm
```

具体操作：
- 将 `shadow-docs/changes/<YYYYMMDD-{type}-{slug}>/` 移动到 `shadow-docs/changes/archive/<YYYYMMDD-{type}-{slug}>/`
- 重建 `INDEX.md`

**归档提交只动 `shadow-docs/`**：不得触碰 `package.json` 与两份宿主清单——版本权威由发版阶段独占。

### 3. 自动归档（GitHub Actions）

issue close 时 webhook 自动 dispatch `archive-change` 事件，由 `.github/workflows/archive-on-issue-close.yml` 执行上述步骤并 commit + push 回 main。

## 禁止

- PR 未合并时执行归档
- review 未 passed 时执行归档
- 手动移动 change 目录或手改 INDEX
- 为了让门变绿而改写卡片 `source` 里的来源路径（治理门向 `changes/archive/` 兜底解析，见 `norms/knowledge-cards.md`）

**离场：** 完成时输出：`✅ [离场] shadow-dev-archive · change <name> 已归档 · INDEX 已重建（发版结论见 shadow-dev-publish）`
