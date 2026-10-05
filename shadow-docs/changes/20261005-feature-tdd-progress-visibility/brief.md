---
{
  "schema": "shadow-dev/v1",
  "name": "20261005-feature-tdd-progress-visibility",
  "type": "feature",
  "scope": "shadow-dev-workflow/norms,skills",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "feature/20261005-feature-tdd-progress-visibility",
  "files": [
    "norms/tdd-verification.md",
    "shadow-docs/changes/20261005-feature-tdd-progress-visibility/brief.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-hotfix/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 23,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/23",
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "2d1b1746ab936904ec9cc8c1db8adf1111eb3f4b",
    "verifiedAt": "2026-10-05T15:25:30.189Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "issue:23",
    "planHash": "903b103d7c783afd2499c13ef8568fcdf249ec1489d998616e5ba06ac6ef0ea5",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] TDD 与任务执行进度可见性——报数开工、逐完成一行、卡点先报",
      "titleRaw": "TDD 与任务执行进度可见性——报数开工、逐完成一行、卡点先报",
      "supplement": "Brief: shadow-docs/changes/20261005-feature-tdd-progress-visibility/（S 级，进度纪律入 norms，apply/hotfix 落进度线；详见 brief）",
      "body": "## 动机\n静默执行无法察觉卡死：本会话实证三起——branch plan 后台空转 4 分钟无输出、publish 首跑错误被吞误报失败、commit execute 无输出假象。用户明确要求：AI 必须给出明确任务数量，每完成一个任务输出一条进度日志，以此判断是否卡住。\n\n## 引用规范\n- `norms/tdd-verification.md`\n  - 当前结论: 分级制（S/M/L）验证强度非协商；评级可议、匹配不可议\n  - 适用 scope: cross-project——进度可见性作为新的执行纪律节加入本规范\n- `norms/code-style.md`\n  - 当前结论: 渐进式治理不扩大范围；单一职责\n  - 适用 scope: 顺带修正 apply §5 与现行分级制的既有偏差（同一主题，非无关改写）\n\n## 决策\n- **选型:** 进度纪律写入 norm（跨项目生效，hotfix 快车道经引用自动继承），apply/hotfix skill 落具体进度线 token\n- **对比方案:** 只改 apply skill——hotfix 与未来执行通道继承不到，纪律散失；CLI 侧输出进度——CLI 已是两段式有 stderr 人用层，问题在 AI 长链执行静默，不属 CLI 职责\n- **理由:** 「报数开工 → 逐完成一行 → 卡点先报 ⏸ → 收口数目对账」四条款全部可被 review 机械检查（对照 brief 报数与实际输出）；顺带把 apply §5 从旧的「新功能/Bug/复杂重构执行 TDD」措辞对齐 20260925 分级制\n- **PR 附带说明:** 本地 main 含未推送的归档提交 2d1b174，本 PR 基线在其上，合并时一并落 main\n\n## 任务\n### Phase 1\n- [ ] norm 新增进度可见性节——`norms/tdd-verification.md` — 「TDD 与测试要求」之后插入四条款节\n- [ ] apply skill §5 重写——`skills/shadow-dev-apply/SKILL.md` — 分级制对齐 + 进度报告条款（test/task 两级粒度 + ⏸ 卡点行）\n- [ ] hotfix skill §3 补继承句——`skills/shadow-dev-hotfix/SKILL.md` — 修复步骤引用进度可见性条款\n\n## 补充\nBrief: shadow-docs/changes/20261005-feature-tdd-progress-visibility/（S 级，进度纪律入 norms，apply/hotfix 落进度线；详见 brief）\n\n完整 brief：shadow-docs/changes/20261005-feature-tdd-progress-visibility/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261005-feature-tdd-progress-visibility\",\"type\":\"feature\",\"scope\":\"shadow-dev-workflow/norms,skills\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261005-feature-tdd-progress-visibility/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "feature"
      ]
    },
    "release": {
      "files": [
        "norms/tdd-verification.md",
        "shadow-docs/changes/20261005-feature-tdd-progress-visibility/brief.md",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-hotfix/SKILL.md"
      ],
      "message": "feat(norms): TDD 与任务执行进度可见性——开工报数、逐完成一行、卡点先报 ⏸、收口对账；apply §5 顺带对齐分级制",
      "title": "feat(norms): TDD 与任务执行进度可见性",
      "body": "Closes #23\n\n完整 brief：shadow-docs/changes/20261005-feature-tdd-progress-visibility/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "进度纪律直接落入 norms 本体，治理载体即修改对象，无额外跨项目卡片事实"
  }
}
---

# TDD 与任务执行进度可见性——报数开工、逐完成一行、卡点先报

## 动机

静默执行无法察觉卡死：本会话实证三起——branch plan 后台空转 4 分钟无输出、publish 首跑错误被吞误报失败、commit execute 无输出假象。用户明确要求：AI 必须给出明确任务数量，每完成一个任务输出一条进度日志，以此判断是否卡住。

## 复杂度评级

- **评级:** S
- **理由:** 零运行时契约变更——改的是 norms/skills 流程文档（AI 执行纪律的载体），不碰 CLI 代码与哈希语义；触及面 3 个 markdown；可发现性高（进度线即产出本身）
- **期望验证深度:** code-read（diff 走查 + 结构/引用扫描）

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 分级制（S/M/L）验证强度非协商；评级可议、匹配不可议
  - 适用 scope: cross-project——进度可见性作为新的执行纪律节加入本规范
- `norms/code-style.md`
  - 当前结论: 渐进式治理不扩大范围；单一职责
  - 适用 scope: 顺带修正 apply §5 与现行分级制的既有偏差（同一主题，非无关改写）

## 决策

- **选型:** 进度纪律写入 norm（跨项目生效，hotfix 快车道经引用自动继承），apply/hotfix skill 落具体进度线 token
- **对比方案:** 只改 apply skill——hotfix 与未来执行通道继承不到，纪律散失；CLI 侧输出进度——CLI 已是两段式有 stderr 人用层，问题在 AI 长链执行静默，不属 CLI 职责
- **理由:** 「报数开工 → 逐完成一行 → 卡点先报 ⏸ → 收口数目对账」四条款全部可被 review 机械检查（对照 brief 报数与实际输出）；顺带把 apply §5 从旧的「新功能/Bug/复杂重构执行 TDD」措辞对齐 20260925 分级制
- **PR 附带说明:** 本地 main 含未推送的归档提交 2d1b174，本 PR 基线在其上，合并时一并落 main

## 任务

### Phase 1
- [x] norm 新增进度可见性节——`norms/tdd-verification.md` — 「TDD 与测试要求」之后插入四条款节
- [x] apply skill §5 重写——`skills/shadow-dev-apply/SKILL.md` — 分级制对齐 + 进度报告条款（test/task 两级粒度 + ⏸ 卡点行）
- [x] hotfix skill §3 补继承句——`skills/shadow-dev-hotfix/SKILL.md` — 修复步骤引用进度可见性条款

## 结果

- 实际耗时: 约 15 分钟（压缩 propose 单确认，全程授权）
- 验证: code-read——git diff 走查 3 文件 +17/-6 与声明一致；进度线 token 一致性扫描（`▶ [TDD] n/N`、`⏸`、引用节名「进度可见性」三文件各恰 1 处）；旧措辞「新功能、Bug 修复和复杂重构执行 TDD」全仓残留 0；apply §5 分级三条与 norm 表格逐行对齐（L 完整 TDD / M 绿灯 / S 扫描）

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 进度纪律直接落入 norms 本体（治理载体即本次修改对象），不产生额外跨项目卡片事实
