---
name: shadow-dev-review
description: Agent Loop 代码审查与验收 — 将验证证据、findings 和 repair DAG 写入单一 .openspec.yaml
---
# ✅ Review — Agent Loop 验收

## 输入边界

对 `schema: agent-loop/v1`，Review 先读取 `.openspec.yaml` 中：

```yaml
proposal:
discuss:
artifacts:
apply:
review:
runtime:
```

再按 `artifacts` 索引读取固定 proposal/discuss 产物：`proposal.md`、`specs/<domain>/spec.md`、`design.md`、`tasks.md`，以及 `apply.workflow[].files` 所列代码 diff。禁止扫描未登记文档。

## [1/6] 启动门禁

只有在以下条件满足时开始：

- `apply.status: completed`；
- `runtime.state` 不是未解决 `blocked | waiting_for_input`；
- 每个完成 task 都有至少一条 evidence。

否则写入 `runtime.failure.kind: verification` 或展示 required inputs，回到 Apply 的精确 task；不得宣布通过。

开始时：

```yaml
change: { status: reviewing }
review: { status: running, verification: [], findings: [] }
runtime: { phase: review, state: running }
```

## [2/6] 验证与多维审查

1. 运行 `apply.workflow` 与 `apply.repairWorkflow` 收集的验证命令；
2. 检查 `proposal.acceptanceCriteria` 是否由实现和 evidence 覆盖；
3. 检查 `discuss.decisions/contracts/reuse` 是否被遵守；
4. 只审查 workflow files 的 git diff：代码质量、安全、性能、范围漂移；
5. Lint/类型/测试不可运行时，写入明确证据；环境缺失归为 `missing_input`，工具失败归为 `retryable` 或 `verification`。

每条验证记录写入：

```yaml
review:
  verification:
    - id: type-check
      command: pnpm exec tsc --noEmit
      result: passed | failed | unavailable
      summary: <short output>
      at: <ISO-8601>
```

每条发现记录写入：

```yaml
review:
  findings:
    - id: R-001
      severity: blocker | warning | suggestion
      file: <path>
      line: <optional line>
      message: <finding>
      status: open | fixed | accepted
```

## [3/6] 阻塞回环

存在 blocker 或失败验证时，不得直接修代码。先把每项 blocker 转成最小 repair task：

```yaml
apply:
  repairWorkflow:
    - id: repair-r-001
      originFindingId: R-001
      title: <fix title>
      status: pending
      dependsOn: []
      files: []
      instructions: []
      verification: []
      requiredInputs: []
      attempts: 0
      maxAttempts: 2
      evidence: []
      failure: null
```

然后：

```yaml
review: { status: blocked }
change: { status: applying }
runtime:
  phase: apply
  state: failed
  resume: { taskId: repair-r-001, command: 开始执行 }
  failure:
    kind: verification
    message: <blocker summary>
```

提示用户执行“开始执行”。Apply 只运行 repairWorkflow，完成后回到 Review。

## [4/6] Warning 决策

仅有 warning 时：

```yaml
review: { status: warnings }
runtime:
  phase: review
  state: waiting_for_input
  requiredInputs:
    - key: review-warnings-decision
      description: 选择修复 warning 或接受 warning 后归档
      supplied: false
```

不得替用户默认接受 warning。

## [5/6] 通过

没有 blocker，且所有 required verification 已通过时：

```yaml
review:
  status: passed
  summary: <acceptance and risk summary>
change: { status: reviewing }
runtime: { phase: archive, state: completed }
```

## [6/6] Legacy

Legacy change 必须读取 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-review.md` 后按旧 Markdown 审查方式处理；不要混用两套制品。
