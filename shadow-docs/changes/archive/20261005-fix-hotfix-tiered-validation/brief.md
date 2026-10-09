---
{
  "schema": "shadow-dev/v1",
  "name": "20261005-fix-hotfix-tiered-validation",
  "type": "fix",
  "scope": "shadow-dev-workflow/skills",
  "status": "archived",
  "baseBranch": "main",
  "branch": "fix/20261005-fix-hotfix-tiered-validation",
  "files": [
    "shadow-docs/changes/20261005-fix-hotfix-tiered-validation/brief.md",
    "skills/shadow-dev-hotfix/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 27,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/27",
    "pullRequest": 28,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "11dd4a4446722bfe36fa24f05d04011df0a68ecb",
    "verifiedAt": "2026-10-09T15:50:59.539Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:28",
    "planHash": "3e4982672798f1bbca010b23f4e51f9d31f88722cb1216eabd9b83bd60aeaa15",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[fix] hotfix 快车道验证强度对齐分级制——复现测试不再一刀切强制",
      "titleRaw": "hotfix 快车道验证强度对齐分级制——复现测试不再一刀切强制",
      "supplement": "Brief: shadow-docs/changes/20261005-fix-hotfix-tiered-validation/（复现确认按分级，L 才强制先红后绿）",
      "body": "## 动机\nPR #26 扫描发现 `skills/shadow-dev-hotfix/SKILL.md` 存在 6 处同款一刀切强制：「复现测试先红后绿（非协商）」出现在进场说明、修复步骤、不可省清单与 mini 任务模板四处，且 mini 正文声明「复杂度评级恒 S、期望验证深度 unit」自相矛盾（S 级按分级制不创建测试）。与 `norms/tdd-verification.md` 分级制（20260925 用户批准）及 PR #26 后的新铁律直接冲突：线上文案错字、配置错误类 S 级急修也被强制写测试文件。\n\n## 引用规范\n- `norms/tdd-verification.md`\n  - 当前结论: S 不创建测试（走查+扫描）/ M 绿灯测试 / L 完整 TDD 先红后绿；过度测试阻塞\n  - 适用 scope: hotfix 验证强度条款的逐字对齐目标\n\n## 决策\n- **选型:** 「复现测试先红后绿」降级为 L 级条件；快车道铁门禁改为「**复现确认**」——修复前必须以可重复手段复现问题（L 级=自动化测试先红；S/M 级=人工复现步骤/观察），保证根因不失准但手段按级别\n- **对比方案:** 维持强制测试——违背用户明确指令与分级制；完全删掉复现要求——丢失快车道最重要的一条安全性\n- **理由:** 复现确认与写测试是两件事：前者防猜测式修复（hotfix 的立身之本），后者仅是其 L 级实现形式。mini 模板同步修正评级恒 S 的矛盾——评级按触及面判定，命中契约/共享路径即 L\n\n## 任务\n### Phase 1\n- [ ] hotfix skill 分级制改写——`skills/shadow-dev-hotfix/SKILL.md` — 铁门禁措辞、mini 模板、任务示例、不可省清单、根因条款五处对齐\n\n## 补充\nBrief: shadow-docs/changes/20261005-fix-hotfix-tiered-validation/（复现确认按分级，L 才强制先红后绿）\n\n完整 brief：shadow-docs/changes/20261005-fix-hotfix-tiered-validation/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261005-fix-hotfix-tiered-validation\",\"type\":\"fix\",\"scope\":\"shadow-dev-workflow/skills\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261005-fix-hotfix-tiered-validation/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "fix"
      ]
    },
    "release": {
      "files": [
        "shadow-docs/changes/20261005-fix-hotfix-tiered-validation/brief.md",
        "skills/shadow-dev-hotfix/SKILL.md"
      ],
      "message": "fix(skills): hotfix 快车道对齐分级验证制——铁门禁改复现确认，S/M 级不强制创建测试文件",
      "title": "fix(skills): hotfix 对齐分级验证制——复现测试不再一刀切",
      "body": "Closes #27\n\n完整 brief：shadow-docs/changes/20261005-fix-hotfix-tiered-validation/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "历史滞留清理：工作已随 PR #28 合入 main（经 head 分支反查核实），本次仅重钉 verifiedCommit 以完成归档；无新增稳定事实"
  }
}
---

# hotfix 快车道验证强度对齐分级制——复现测试不再一刀切强制

## 动机

PR #26 扫描发现 `skills/shadow-dev-hotfix/SKILL.md` 存在 6 处同款一刀切强制：「复现测试先红后绿（非协商）」出现在进场说明、修复步骤、不可省清单与 mini 任务模板四处，且 mini 正文声明「复杂度评级恒 S、期望验证深度 unit」自相矛盾（S 级按分级制不创建测试）。与 `norms/tdd-verification.md` 分级制（20260925 用户批准）及 PR #26 后的新铁律直接冲突：线上文案错字、配置错误类 S 级急修也被强制写测试文件。

## 复杂度评级

- **评级:** S
- **理由:** 纯流程文档措辞对齐，零运行时契约；方向已由 norm 分级制与 iron-laws 修订批准
- **期望验证深度:** code-read

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: S 不创建测试（走查+扫描）/ M 绿灯测试 / L 完整 TDD 先红后绿；过度测试阻塞
  - 适用 scope: hotfix 验证强度条款的逐字对齐目标

## 决策

- **选型:** 「复现测试先红后绿」降级为 L 级条件；快车道铁门禁改为「**复现确认**」——修复前必须以可重复手段复现问题（L 级=自动化测试先红；S/M 级=人工复现步骤/观察），保证根因不失准但手段按级别
- **对比方案:** 维持强制测试——违背用户明确指令与分级制；完全删掉复现要求——丢失快车道最重要的一条安全性
- **理由:** 复现确认与写测试是两件事：前者防猜测式修复（hotfix 的立身之本），后者仅是其 L 级实现形式。mini 模板同步修正评级恒 S 的矛盾——评级按触及面判定，命中契约/共享路径即 L

## 任务

### Phase 1
- [x] hotfix skill 分级制改写——`skills/shadow-dev-hotfix/SKILL.md` — 铁门禁措辞、mini 模板、任务示例、不可省清单、根因条款五处对齐

## 结果

- 实际耗时: 约 8 分钟
- 验证: code-read——残留 grep 归零（旧一刀切措辞 0 处）；新措辞「复现确认」6 处闭合；diff 走查单文件仅命中声明的 5 个改动点
- 验证: —


> 归档补记（2026-10-09 历史滞留清理）：原 brief 未记录 PR，经 GitHub 反查确认对应 by-body:fix(skills): hotfix 对齐分级验证制— 且已 merged；仅回填记录字段 `github.pullRequest=28`，未改任何状态机字段。

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 治理载体自身对齐既有批准结论，不产生新长期事实
