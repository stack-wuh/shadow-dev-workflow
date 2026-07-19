---
name: shadow-dev-workflow
description: >
  Shadow Agent Loop 统一入口：一个 .openspec.yaml 驱动 propose → discuss → apply → review → archive → commit，
  支持检查点恢复、失败熔断和必要输入补齐。
license: MIT
compatibility: Requires openspec-compatible project layout; agent-loop/v1 coordinates the required Markdown artifacts through .openspec.yaml.
metadata:
  author: shadow
  version: "6.0"
---
# 🔄 Shadow Agent Loop 工作流

所有新变更使用一个状态机文件：

```text
openspec/changes/<change>/.openspec.yaml
```

它是唯一的 Agent Loop 控制面与恢复记录。固定产物仍然保留：`proposal.md`、`design.md`、`tasks.md`、`specs/<domain>/spec.md`；YAML 只索引它们、控制读取范围、记录 checkpoint 和熔断状态。归档继续执行 specs 合并、组件场景沉淀、`navigation-guide.yaml` 与 `INDEX.md` 更新。完整字段、熔断规则和历史兼容策略见：

```text
skills/shadow-dev-workflow/references/agent-loop-protocol.md
```

## 🛡️ 进入门禁

任何阶段开始前，必须先向用户打印：

```text
🧭 当前流程: [x/6] <流程名称>
🎯 用户意图: <用户原话的归纳>
📌 本阶段产物: 写入 .openspec.yaml 的 <section>
✅ 执行门禁: <YAML 状态条件>
➡️ 下一步: <默认流向或恢复动作>
```

打印门禁前不得读代码、写文件、运行 GitHub/Git/测试命令。恢复时先打印“中断恢复”提示，再读取目标 YAML 的 `runtime`。

## 状态机

```text
propose -> discuss -> apply -> review -> archive -> commit
                         ^        |
                         |--------| blocker -> repairWorkflow
```

| 阶段 | 写入 YAML | 下一步 |
|---|---|---|
| propose | `proposal`, `artifacts.proposal/specs`, `change.issue`, `runtime` | discuss |
| discuss | `design.md`、`tasks.md` + `discuss`, `apply.workflow`, `runtime` | apply |
| apply | task evidence, checkpoint, failure | review / 等待输入 |
| review | `review.verification`, `review.findings`, repair DAG | archive / apply |
| archive | 固定产物归档、specs 合并、场景沉淀、索引更新 + `archive/runtime` | commit |
| commit | `commit`, `change.status`, `runtime` | 完成 |

## 语义路由

| 用户意图 | 路由 | Agent Loop 条件 |
|---|---|---|
| 提案 / 新需求 / bug反馈 / ff | `shadow-dev-propose` | 创建新 change 或读取指定 Issue |
| 需求讨论 / design / discuss | `shadow-dev-discuss` | `proposal.status: completed` |
| 开始执行 / apply | `shadow-dev-apply` | `apply.status: ready | running` |
| 代码审查 / review | `shadow-dev-review` | `apply.status: completed` |
| 归档 / archive | `shadow-dev-archive` | `review.status: passed` 或已接受 warnings |
| 提交 / commit / PR | `shadow-dev-commit` | `archive.status: completed` |
| 继续 / continue / 上次 | 断点恢复 | 从 `runtime.phase/state/resume` 路由 |

用户仅说“提案”时，默认创建新需求；不得扫描活跃 change 猜测上下文。用户说“继续”或明确给出 change ID 时，读取该 change 的 YAML 恢复。

## 中断恢复与熔断

恢复算法：

1. 读取 `.openspec.yaml` 的 `runtime`；
2. `state: waiting_for_input`：只展示 `requiredInputs`，用户补齐后从 `resume.taskId` 继续；
3. `state: blocked | failed`：展示 `failure.kind/message`，不得自动跳过；
4. `state: completed | idle`：路由到 `runtime.phase`；
5. Apply 从 checkpoint 后第一个依赖已完成的 task 开始，不重做已完成任务。

失败类型统一为：

- `missing_input`：请求最小必要参数；
- `retryable`：任务级重试到 `maxAttempts`，然后熔断；
- `verification`：生成精确 repair task 后回到 Apply；
- `permanent`：等待用户决定，不进行推测性修改。

## Legacy 兼容

没有 `schema: agent-loop/v1` 的历史 change 继续按 Markdown 制品流程执行。对应阶段必须读取 `skills/shadow-dev-workflow/references/legacy-markdown/` 下的同名 reference；不得自动迁移或把两种模型混用；迁移需要单独提案。

## 非谈判规则

- Apply 对 Agent Loop 只读取 `proposal`、`discuss`、`apply`、`runtime`。
- Discuss 必须生成 `apply.workflow`，Apply 不得自行重写计划。
- 每个 task 尝试、证据、失败和 checkpoint 都必须立即回写 YAML。
- 未通过 review 验证不得 archive 或 commit。
- 自动合并只在用户明确要求且 YAML review 无 blocker/warning 时执行。
