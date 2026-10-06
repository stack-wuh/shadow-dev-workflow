---
{
  "schema": "shadow-dev/v1",
  "name": "20261005-fix-iron-laws-tiered-validation",
  "type": "fix",
  "scope": "shadow-dev-workflow/rules",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "fix/20261005-fix-iron-laws-tiered-validation",
  "files": [
    "rules/behavior.md",
    "rules/iron-laws.md",
    "shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/brief.md",
    "skills/shadow-dev-apply/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 25,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/25",
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "b1bbe74c91d3afed5664167a5c2a7548225a2d95",
    "verifiedAt": "2026-10-06T16:10:26.170Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "issue:25",
    "planHash": "ee59c3c2982bb6c2605e94dd1c15cc87e2509d0d6c69df4b359c6173529c920d",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[fix] 铁律对齐分级验证制——消除一刀切强制 TDD 残留",
      "titleRaw": "铁律对齐分级验证制——消除一刀切强制 TDD 残留",
      "supplement": "Brief: shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/（S 级，rules 层与 norm 分级制逐字对齐）",
      "body": "## 动机\n20260925 起 norm 修订为 S/M/L 分级验证制（经用户批准），但 `rules/iron-laws.md` §1 与 `rules/behavior.md` §4 未随改，仍保留「新功能、复杂重构、Bug 修复 → 先写失败测试」的一刀切旧铁律。rules/ 是注入会话的最高优先行为层，AI 实际按它执行——导致 S/M 级需求仍被强制先红后绿，直接违背用户明确要求「不是所有需求都需要 TDD、都需要先写 test 文件」。本变更是修订遗漏的修复，不是新决策。\n\n## 引用规范\n- `norms/tdd-verification.md`\n  - 当前结论: 分级制——S 不创建测试（diff 走查+扫描）/ M 绿灯测试 / L 完整 TDD 先红后绿；S 级过度测试同样阻塞；实现期升降级须先修订 brief\n  - 适用 scope: 三处残留措辞的逐字对齐目标\n\n## 决策\n- **选型:** 原位改写三处残留，与 norm 分级表逐字对齐，并把「一刀切强制测试 = 过度测试违规」写入阻断条款\n- **对比方案:** 删除 rules/§1 整体改为引用 norm——rules/ 是用户直读的独立行为层，删除损失可发现性；改写保留结构\n- **理由:** 渐进式治理——只修正与分级制直接冲突的措辞与 apply description 字样，不顺手重写其他铁律\n\n## 任务\n### Phase 1\n- [ ] 改写 iron-laws §1——`rules/iron-laws.md` — 「不要跳过 TDD」→「不要跳过与复杂度匹配的验证」，触发/做什么/阻断按 L/M/S 重写\n- [ ] 对齐 behavior §4——`rules/behavior.md` — 「bug fix 先写复现测试」改为 L 级条件化\n- [ ] 清理 apply description——`skills/shadow-dev-apply/SKILL.md` — 「执行 TDD 与依赖调度」→「执行分级验证与依赖调度」\n\n## 补充\nBrief: shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/（S 级，rules 层与 norm 分级制逐字对齐）\n\n完整 brief：shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261005-fix-iron-laws-tiered-validation\",\"type\":\"fix\",\"scope\":\"shadow-dev-workflow/rules\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "fix"
      ]
    },
    "release": {
      "files": [
        "rules/behavior.md",
        "rules/iron-laws.md",
        "shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/brief.md",
        "skills/shadow-dev-apply/SKILL.md"
      ],
      "message": "fix(rules): 铁律对齐分级验证制——L 先红后绿/M 绿灯/S 不创建测试，一刀切强制测试定为违规",
      "title": "fix(rules): 铁律对齐分级验证制——消除一刀切强制 TDD",
      "body": "Closes #25\n\n完整 brief：shadow-docs/changes/20261005-fix-iron-laws-tiered-validation/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "rules 层与已批准的 norm 分级制逐字对齐，治理载体自身修复，无新长期事实"
  }
}
---

# 铁律对齐分级验证制——消除一刀切强制 TDD 的残留

## 动机

20260925 起 norm 修订为 S/M/L 分级验证制（经用户批准），但 `rules/iron-laws.md` §1 与 `rules/behavior.md` §4 未随改，仍保留「新功能、复杂重构、Bug 修复 → 先写失败测试」的一刀切旧铁律。rules/ 是注入会话的最高优先行为层，AI 实际按它执行——导致 S/M 级需求仍被强制先红后绿，直接违背用户明确要求「不是所有需求都需要 TDD、都需要先写 test 文件」。本变更是修订遗漏的修复，不是新决策。

## 复杂度评级

- **评级:** S
- **理由:** 纯行为纪律文档措辞对齐，零运行时契约；分级方向已由 norm 修订经用户批准，本变更仅消除矛盾残留
- **期望验证深度:** code-read

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 分级制——S 不创建测试（diff 走查+扫描）/ M 绿灯测试 / L 完整 TDD 先红后绿；S 级过度测试同样阻塞；实现期升降级须先修订 brief
  - 适用 scope: 三处残留措辞的逐字对齐目标

## 决策

- **选型:** 原位改写三处残留，与 norm 分级表逐字对齐，并把「一刀切强制测试 = 过度测试违规」写入阻断条款
- **对比方案:** 删除 rules/§1 整体改为引用 norm——rules/ 是用户直读的独立行为层，删除损失可发现性；改写保留结构
- **理由:** 渐进式治理——只修正与分级制直接冲突的措辞与 apply description 字样，不顺手重写其他铁律

## 任务

### Phase 1
- [x] 改写 iron-laws §1——`rules/iron-laws.md` — 「不要跳过 TDD」→「不要跳过与复杂度匹配的验证」，触发/做什么/阻断按 L/M/S 重写
- [x] 对齐 behavior §4——`rules/behavior.md` — 「bug fix 先写复现测试」改为 L 级条件化
- [x] 清理 apply description——`skills/shadow-dev-apply/SKILL.md` — 「执行 TDD 与依赖调度」→「执行分级验证与依赖调度」

## 结果

- 实际耗时: 约 10 分钟（压缩流程单授权）
- 验证: code-read——diff 走查 3 文件 +6/−6 与声明一致；全仓扫描确认一刀切措辞清零（norms L 级表格语境保留属预期）；扫描同时发现 hotfix skill 6 处同款强制（复现测试先红后绿非协商），因 files 清单锁定，转堆叠变更 20261005-fix-hotfix-tiered-validation 处理
- 验证: —

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 治理载体（rules/norms）自身对齐既有批准结论，不产生新长期事实
