---
name: shadow-dev-archive
description: 归档已合并的 change — PR merged 后将 brief 移到 archive/ 并重建 INDEX。触发词：归档、archive。
---
# Shadow Dev Archive — 归档

PR 合并后将 change 归档。可由 `shadow-dev-release` 完成交付发布后手动调用，或由 GitHub Actions 在 issue close 时自动触发。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。归档动作本体由 CLI 完成（移动目录、重建 INDEX、本地提交）。唯一允许的原始 git 命令：合并后本地 main 落后时的 `git pull --ff-only`（只读性质的 fast-forward 同步）；其余一切写操作经 CLI。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-archive · 归档 merged change`

## 前置条件

- 本地 main 与远端一致（落后时先 `git pull --ff-only`；HEAD 必须与 review 的 verifiedCommit 同源，不一致时在 main 上重跑 review plan + execute）
- PR 已 merged（CLI 通过 GitHub API 验证）
- review conclusion 为 passed
- 项目 Knowledge 若声明部署触发（如 GitHub Release published 触发 CI/CD）：部署流水线全绿，且 brief「结果」段已记录 release URL——**PR merged ≠ 已交付**，归档不替代发布（发布属 `shadow-dev-release` 第 4 步，缺失时先补再做）

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

### 3. 自动归档（GitHub Actions）

issue close 时 webhook 自动 dispatch `archive-change` 事件，由 `.github/workflows/archive-on-issue-close.yml` 执行上述步骤并 commit + push 回 main。

## 禁止

- PR 未合并时执行归档
- 项目声明了部署触发时，跳过发布阶段直接归档
- 手动移动 change 目录或手改 INDEX

**离场：** 完成时输出：`✅ [离场] shadow-dev-archive · change <name> 已归档 · 工作流结束（交付结论见 release 阶段）`
