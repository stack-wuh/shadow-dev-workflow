---
{
  "schema": "shadow-dev/v1",
  "name": "20261005-feature-worktree-integration",
  "type": "feature",
  "scope": "shadow-dev-workflow/skills",
  "status": "archived",
  "baseBranch": "main",
  "branch": "feature/20261005-feature-worktree-integration",
  "files": [
    "docs/cli-guide.md",
    "shadow-docs/changes/20261005-feature-worktree-integration/brief.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-archive/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 29,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/29",
    "pullRequest": 30,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/30"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "12019d020b73067649a0a9cd59709dd2d52fb7ad",
    "verifiedAt": "2026-10-07T04:49:22.627Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:30",
    "planHash": "fd120091de6327c0f4f8f10cc2958da31f574814d9139142165e0e71a191a457",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] skills 集成 worktree 并行工作流",
      "titleRaw": "skills 集成 worktree 并行工作流",
      "supplement": "Brief: shadow-docs/changes/20261005-feature-worktree-integration/（依赖 CLI v1.5.0,建议其发布后合入）",
      "body": "## 动机\nCLI v1.5.0（堆叠 PR shadow-dev-cli#35/#36）即将提供 `worktree inspect/plan/execute/remove`；插件 skills 需要把「并行变更用独立 workspace」变成编排指令，替代现状的分支腾挪+stash 硬扛（本会话实证多次冲突）。集成后：L 级变更在 apply 建分支步骤自动走 worktree 建议流，归档前回收 workspace。\n\n## 引用规范\n- `norms/tdd-verification.md`\n  - 当前结论: 分级制与进度可见性条款（本变更延续既有纪律，不新增测试要求）\n  - 适用 scope: apply §3 集成措辞的纪律一致性\n\n## 决策\n- **选型:** 四个文件集成——apply §3（建分支前 `worktree inspect --name`，recommendation=create 时走 `worktree plan/execute` 替代 branch 域、reuse 时提示 cd 到记录目录继续）、propose §5（L 评级批准时随确认提示并行选项）、archive 前置（`workflow.worktree` 存在则先 `worktree remove` 再归档）、docs/cli-guide.md 命令参考补 worktree 域小节\n- **对比方案:** 仅改 apply——propose 的评级批准时机错过并行决策点，archive 遗留脏 workspace；CLI 侧提示即可——skills 不读 CLI stderr 的建议字段就无人执行\n- **理由:** 编排层职责就是把 CLI 能力接入流程节点；skills 文案与 CLI 命令面逐字对齐（`worktree inspect --name <name>` 等签名以 CLI 仓 commands.mjs 为准）\n- **发布顺序约束:** skills 引用的 worktree 命令随 CLI v1.5.0 发布（PR #36 合并 + tag）后才对消费仓库生效；**`cliVersion` pin 的 bump 与 vendored 安装器同步为合并后独立小变更**（既有模式：升级 CLI = 同步副本 + 改 pin + 插件发版）。本 PR 建议待 v1.5.0 发布后合入\n- **范围说明:** 不改 hotfix skill——快车道恒小修复单 workspace，并行非其语义\n\n## 任务\n### Phase 1\n- [ ] apply 集成——`skills/shadow-dev-apply/SKILL.md` — §3 建分支前加 worktree inspect 决策流\n- [ ] propose 提示——`skills/shadow-dev-propose/SKILL.md` — §5 展示结果的下一步提示加并行选项（L 评级）\n- [ ] archive 前置——`skills/shadow-dev-archive/SKILL.md` — 前置条件补 workspace 回收检查\n- [ ] 命令参考——`docs/cli-guide.md` — 命令参考表补 worktree 域与使用节\n\n## 补充\nBrief: shadow-docs/changes/20261005-feature-worktree-integration/（依赖 CLI v1.5.0,建议其发布后合入）\n\n完整 brief：shadow-docs/changes/20261005-feature-worktree-integration/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261005-feature-worktree-integration\",\"type\":\"feature\",\"scope\":\"shadow-dev-workflow/skills\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261005-feature-worktree-integration/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "feature"
      ]
    },
    "release": {
      "files": [
        "docs/cli-guide.md",
        "shadow-docs/changes/20261005-feature-worktree-integration/brief.md",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-archive/SKILL.md",
        "skills/shadow-dev-propose/SKILL.md"
      ],
      "message": "feat(skills): worktree 并行工作流集成——apply 决策流/propose 提示/archive 回收前置/cli-guide 命令表(依赖 CLI v1.5.0)",
      "title": "feat(skills): skills 集成 worktree 并行工作流",
      "body": "Closes #29\n\n完整 brief：shadow-docs/changes/20261005-feature-worktree-integration/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "squash 合并后 HEAD 同源重跑;结论与分支审查一致"
  }
}
---

# skills 集成 worktree 并行工作流——L 级变更独立 workspace

## 动机

CLI v1.5.0（堆叠 PR shadow-dev-cli#35/#36）即将提供 `worktree inspect/plan/execute/remove`；插件 skills 需要把「并行变更用独立 workspace」变成编排指令，替代现状的分支腾挪+stash 硬扛（本会话实证多次冲突）。集成后：L 级变更在 apply 建分支步骤自动走 worktree 建议流，归档前回收 workspace。

## 复杂度评级

- **评级:** S
- **理由:** 纯 skills 编排文案与文档命令表扩展，零运行时契约；CLI 命令面契约由 CLI 仓变更承载
- **期望验证深度:** code-read

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 分级制与进度可见性条款（本变更延续既有纪律，不新增测试要求）
  - 适用 scope: apply §3 集成措辞的纪律一致性

## 决策

- **选型:** 四个文件集成——apply §3（建分支前 `worktree inspect --name`，recommendation=create 时走 `worktree plan/execute` 替代 branch 域、reuse 时提示 cd 到记录目录继续）、propose §5（L 评级批准时随确认提示并行选项）、archive 前置（`workflow.worktree` 存在则先 `worktree remove` 再归档）、docs/cli-guide.md 命令参考补 worktree 域小节
- **对比方案:** 仅改 apply——propose 的评级批准时机错过并行决策点，archive 遗留脏 workspace；CLI 侧提示即可——skills 不读 CLI stderr 的建议字段就无人执行
- **理由:** 编排层职责就是把 CLI 能力接入流程节点；skills 文案与 CLI 命令面逐字对齐（`worktree inspect --name <name>` 等签名以 CLI 仓 commands.mjs 为准）
- **发布顺序约束:** skills 引用的 worktree 命令随 CLI v1.5.0 发布（PR #36 合并 + tag）后才对消费仓库生效；**`cliVersion` pin 的 bump 与 vendored 安装器同步为合并后独立小变更**（既有模式：升级 CLI = 同步副本 + 改 pin + 插件发版）。本 PR 建议待 v1.5.0 发布后合入
- **范围说明:** 不改 hotfix skill——快车道恒小修复单 workspace，并行非其语义

## 任务

### Phase 1
- [x] apply 集成——`skills/shadow-dev-apply/SKILL.md` — §3 建分支前加 worktree inspect 决策流
- [x] propose 提示——`skills/shadow-dev-propose/SKILL.md` — §5 展示结果的下一步提示加并行选项（L 评级）
- [x] archive 前置——`skills/shadow-dev-archive/SKILL.md` — 前置条件补 workspace 回收检查
- [x] 命令参考——`docs/cli-guide.md` — 命令参考表补 worktree 域与使用节

## 结果

- 实际耗时: 约 20 分钟
- 验证: code-read——五个 worktree 命令签名与 CLI 仓 commands.mjs catalog 逐项对齐(两侧均有命中);WORKTREE_DIRTY 语义在 CLI i18n 与插件两处文案一致;diff 仅命中声明的 4 文件;apply 集成含 CLI < v1.5.0 时的降级句(命令不可用走 branch),无隐式版本依赖
- 验证: —

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 并行工作流由 skills 编排文案与 CLI 文档承载；workspace 生命周期语义属 CLI 仓知识（其卡片更新在 CLI 侧评估）
