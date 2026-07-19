---
name: shadow-dev-apply
description: Agent Loop 执行 — 仅消费 proposal/discuss/apply YAML 分区，按 DAG 断点执行并支持熔断恢复
---
# ⚡ Apply — Agent Loop 执行

## 输入边界

对 `schema: agent-loop/v1`，Apply 先读取 `.openspec.yaml` 中：

```yaml
proposal:
discuss:
artifacts:
apply:
runtime:
```

允许读取 `change.id` 与 `change.issue` 作为分支、Issue 和审计元数据，但它们不得参与重新规划。随后仅加载 `artifacts` 索引声明的 proposal 阶段产物（`proposal.md`、`specs/<domain>/spec.md`）和 discuss 阶段产物（`design.md`、`tasks.md`）。禁止扫描或要求其他未登记文档。`apply.workflow` 是 tasks.md 的执行投影；Apply 不得自行重写计划或扩大范围。

## [1/8] 恢复或启动

1. 读取 YAML；
2. 检查 `apply.status: ready | running | blocked`；
3. 若 `runtime.state: waiting_for_input`，只展示未满足的 `runtime.requiredInputs`；用户补齐后把 `supplied: true`，继续 `runtime.resume.taskId`；
4. 若 `runtime.state: blocked | failed`，先展示 failure，禁止绕过继续；
5. 找到第一个依赖已完成的 `pending` task，或 `runtime.resume.taskId`。

每次执行前写入：

```yaml
change: { status: applying }
apply: { status: running }
runtime: { phase: apply, state: running }
```

## [2/8] 分支门禁

开始任何代码改动前，检查 Git 分支。禁止在 `main/master` 编码；按 `change.issue` 创建或恢复功能分支。若当前 worktree 有影响任务的未提交改动，记录为 `runtime.failure.kind: permanent` 并等待用户决定。

当 task 是新功能、复杂重构或 Bug 修复时，task 的 `instructions` 与 `verification` 必须明确 TDD 证据（先失败、后通过）；多模块隔离或并行写入才使用 worktree。只有写入集合互不重叠的 tasks 才能并行，并行 worker 不得直接修改 `.openspec.yaml`。

## [3/8] 按 Task 执行

对每个 task：

1. 置 `status: running`，`attempts += 1` 并立即保存 YAML；
2. 只修改该 task 的 `files`；
3. 执行 task 级验证；
4. 成功后写入：

```yaml
status: completed
evidence:
  - command: <command or inspection>
    result: passed
    at: <ISO-8601>
apply.checkpoint:
  lastCompletedTaskId: <task-id>
```

同一层且写入集合不相交的 tasks 可以并行；每个 agent 也必须回传 evidence，主 Agent 串行合并 YAML 状态。不要让多个 agent 同时改 `.openspec.yaml`。

## [4/8] 熔断

任务失败时先归类：

- `missing_input`：记录 `runtime.requiredInputs`，设 `waiting_for_input`；
- `retryable`：允许到 task `maxAttempts`，超限设 `blocked`；
- `verification`：task 设 `failed`，记录命令输出摘要，生成最小 `repairWorkflow` task；
- `permanent`：立刻设 `blocked`，说明不可自动继续的原因。

统一写入：

```yaml
runtime:
  phase: apply
  state: waiting_for_input | blocked | failed
  resume: { taskId: <task-id>, command: 开始执行 }
  failure:
    kind: <kind>
    message: <message>
    occurredAt: <ISO-8601>
```

失败后必须提示用户，不得假设参数或重复已完成 task。

## [5/8] Repair Loop

仅执行 `apply.repairWorkflow` 中来源为 review finding 的 pending task。修复完成后将原 finding 标为 `fixed`，回到 review。不得把无关优化混入 repair。

## [6/8] 完成门禁

仅当 `workflow` 与 `repairWorkflow` 全部为 `completed | skipped` 时：

```yaml
apply: { status: completed }
runtime: { phase: review, state: completed }
change: { status: reviewing }
```

然后提示“代码审查”。

## [7/8] Legacy

若 schema 不是 `agent-loop/v1`，读取 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-apply.md` 后使用旧版 tasks.md 流程。不要混合两种执行模型。

## [8/8] 输出

输出当前 checkpoint、已完成/阻塞 task、验证证据和精确恢复命令。
