---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-chore-archive-pr-less-briefs",
  "type": "chore",
  "scope": "shadow-docs",
  "status": "archived",
  "baseBranch": "main",
  "branch": "chore/20261009-chore-archive-pr-less-briefs",
  "files": [
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md",
    "shadow-docs/changes/archive/20260811-refactor-monorepo-code-style/brief.md",
    "shadow-docs/changes/archive/20260823-feature-review-task-gate/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 39,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/39",
    "pullRequest": 40,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/40"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "fed3a7e28cfad933a64b65120d2caf7273752283",
    "verifiedAt": "2026-10-09T15:52:56.481Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:40",
    "planHash": "5bea559e7135c64a2b6996dc578ee50a94cbb7a65552e5437e07e91e2a836ff2",
    "updatedAt": null,
    "lastError": null,
    "commit": {
      "files": [
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20260811-refactor-monorepo-code-style",
        "shadow-docs/changes/20260823-feature-review-task-gate",
        "shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md",
        "shadow-docs/changes/archive/20260811-refactor-monorepo-code-style",
        "shadow-docs/changes/archive/20260823-feature-review-task-gate"
      ],
      "message": "chore(shadow-docs): 归档两个无 PR 轨迹的早期滞留 brief（历史整理，不改状态字段）"
    },
    "issuePlan": {
      "title": "[chore] 归档两个无 PR 轨迹的早期滞留 brief（不伪造 merged 证据）",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\n`shadow-docs/changes/` 里滞留 8 个活动 change，其中 6 个能按真实 PR 归档（见 issue 关联说明）。剩两个——`20260811-refactor-monorepo-code-style`（status implemented）与 `20260823-feature-review-task-gate`（status committed，任务 0/2 未勾）——**在 GitHub 上查不到任何对应 PR**（早期直推 main 时代的产物），因此 `archive plan` 的「PR 必须 merged」门禁按设计无法通过。INDEX 长期挂着活动条目会让人误判工作未完成，也不符合「归档只认 merged 证据」的纪律。处理方式：为本 change 自己建 PR 轨迹，把这两个 brief 作为**历史整理**移入 `archive/`，在移动后的正文里如实写明「无 PR 轨迹、经本 change 的 PR 整理归档」，不改它们的状态机字段、不补勾历史任务。\n\n## 引用规范\n- `norms/knowledge-cards.md`：brief 记录「这次发生了什么」，不覆盖 active Knowledge；移动不改结论。\n- `skills/shadow-dev-archive/SKILL.md`：禁止手改 INDEX、归档只认 merged 证据——本 change 用自身 PR 承载整理动作，正是为了不把「无证据」伪装成「有证据」。\n\n## 决策\n- **选型:** 新建 chore change，用 `git mv` 等价的显式文件清单提交把两个 brief 目录移入 `archive/`，`index rebuild` 重建 INDEX，本 change 自己走完 PR 后归档。\n- **对比方案:** (a) 给 CLI 的 archive 加 force 后门——未选，绕过证据门禁的口子一旦被发明就会被滥用；(b) 随便挂一个邻近 PR 号（如 #9/#10）让它过门禁——未选，那是伪造记录；(c) 留在活动列表里——未选，等于让 INDEX 长期说谎。\n- **理由:** 归档门禁没错，错的是历史缺轨迹；用一条有轨迹的整理 change 补历史，比拆门更诚实。\n\n## 任务\n### Phase 1\n- [ ] 移动两个无轨迹 brief — `shadow-docs/changes/archive/20260811-refactor-monorepo-code-style/brief.md`, `shadow-docs/changes/archive/20260823-feature-review-task-gate/brief.md` — 目录移入 archive/，正文各加一段「无 PR 轨迹」的归档补记（不改 frontmatter 状态字段、不补勾任务）\n- [ ] 重建索引 — `shadow-docs/INDEX.md` — 经 `shadow-dev index rebuild plan/execute` 完成，人工核对两个条目转为已完成且路径指向 archive\n- [ ] 对账 — `shadow-docs/INDEX.md` — `change list` 活动项应为空；INDEX 活动区不再出现这两个名字\n\n完整 brief：shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261009-chore-archive-pr-less-briefs\",\"type\":\"chore\",\"scope\":\"shadow-docs\",\"status\":\"committed\",\"branch\":\"chore/20261009-chore-archive-pr-less-briefs\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "chore"
      ]
    },
    "release": {
      "files": [
        "shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md"
      ],
      "message": "docs(shadow): 归档 change 结果与补记",
      "title": "[chore] 归档两个无 PR 轨迹的早期滞留 brief",
      "body": "Closes #39\n\n完整 brief：shadow-docs/changes/20261009-chore-archive-pr-less-briefs/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "历史整理动作无新增稳定事实；本 change 自带 PR #40 轨迹，两个无轨迹 brief 的补记已写明来源"
  }
}
---

# 归档两个无 PR 轨迹的早期滞留 brief（不伪造 merged 证据）

## 动机
`shadow-docs/changes/` 里滞留 8 个活动 change，其中 6 个能按真实 PR 归档（见 issue 关联说明）。剩两个——`20260811-refactor-monorepo-code-style`（status implemented）与 `20260823-feature-review-task-gate`（status committed，任务 0/2 未勾）——**在 GitHub 上查不到任何对应 PR**（早期直推 main 时代的产物），因此 `archive plan` 的「PR 必须 merged」门禁按设计无法通过。INDEX 长期挂着活动条目会让人误判工作未完成，也不符合「归档只认 merged 证据」的纪律。处理方式：为本 change 自己建 PR 轨迹，把这两个 brief 作为**历史整理**移入 `archive/`，在移动后的正文里如实写明「无 PR 轨迹、经本 change 的 PR 整理归档」，不改它们的状态机字段、不补勾历史任务。

## 复杂度评级
- **评级:** S
- **理由:** ①零行为契约变更（只移动历史 markdown 并重建索引）；②触及面仅 `shadow-docs/`；③坏在 INDEX/目录立刻可见。
- **期望验证深度:** code-read（结构扫描 + `change list` 清零）

## 引用规范
- `norms/knowledge-cards.md`：brief 记录「这次发生了什么」，不覆盖 active Knowledge；移动不改结论。
- `skills/shadow-dev-archive/SKILL.md`：禁止手改 INDEX、归档只认 merged 证据——本 change 用自身 PR 承载整理动作，正是为了不把「无证据」伪装成「有证据」。

## 决策
- **选型:** 新建 chore change，用 `git mv` 等价的显式文件清单提交把两个 brief 目录移入 `archive/`，`index rebuild` 重建 INDEX，本 change 自己走完 PR 后归档。
- **对比方案:** (a) 给 CLI 的 archive 加 force 后门——未选，绕过证据门禁的口子一旦被发明就会被滥用；(b) 随便挂一个邻近 PR 号（如 #9/#10）让它过门禁——未选，那是伪造记录；(c) 留在活动列表里——未选，等于让 INDEX 长期说谎。
- **理由:** 归档门禁没错，错的是历史缺轨迹；用一条有轨迹的整理 change 补历史，比拆门更诚实。

## 任务
### Phase 1
- [x] 移动两个无轨迹 brief — `shadow-docs/changes/archive/20260811-refactor-monorepo-code-style/brief.md`, `shadow-docs/changes/archive/20260823-feature-review-task-gate/brief.md` — 目录移入 archive/，正文各加一段「无 PR 轨迹」的归档补记（不改 frontmatter 状态字段、不补勾任务）
- [x] 重建索引 — `shadow-docs/INDEX.md` — 经 `shadow-dev index rebuild plan/execute` 完成，人工核对两个条目转为已完成且路径指向 archive
- [x] 对账 — `shadow-docs/INDEX.md` — `change list` 活动项应为空；INDEX 活动区不再出现这两个名字

## 非目标
- 不给 CLI 的 archive 加例外参数（若要做，另立 change 并写清证据替代方案）
- 不改写这两个 change 的历史任务勾选与状态字段

## 结果
- 实际耗时: —
- 验证: —

## 知识评估
- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 「归档只认 merged 证据」已在 archive skill 与 knowledge-cards 的生命周期约束里；本次是该约束的一次历史补偿执行。真正值得沉淀的是「CLI 无 PR 轨迹的历史 change 如何处置」——但它需要先有机制（例外归档的替代证据），留待独立 change 决策，不在本轮下结论。
