---
name: shadow-dev-discuss
description: Agent Loop 技术方案设计 — 将设计决策与可执行 Apply DAG 写入单一 .openspec.yaml
---
# 🧭 Discuss — Agent Loop 技术方案

## 核心约束

仅处理 `schema: agent-loop/v1` 的变更。读取顺序严格限制为 YAML 索引指定的 proposal 产物：

```yaml
change:
proposal:
artifacts.proposal:
artifacts.specs:
runtime:
```

不扫描其他无关产物。Discuss 必须填充固定 `design.md`、`tasks.md`，并更新 YAML 的 `artifacts.design`、`artifacts.tasks` 与 `discuss` 摘要。协议见 `skills/shadow-dev-workflow/references/agent-loop-protocol.md`。

若是 legacy 变更，读取 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-discuss.md` 后按旧版 Markdown 流程处理；不得将其自动迁移。

## [1/6] 入口与恢复

读取 `.openspec.yaml`。仅当：

- `proposal.status: completed`；
- `change.issue` 存在；
- `runtime.state` 不为未解决的 `blocked`；

才继续。否则写入或展示所需 `runtime.requiredInputs`，等待用户补齐。

## [2/6] 最小上下文探索

从 `proposal.domain.keywords` 与 `proposal.scope` 出发：

1. 阅读匹配的 `openspec/INDEX.md` 条目；
2. 列出命中的存量文件；
3. 对存量修改，先让用户确认读取范围；
4. 仅阅读已确认范围与实现方案必要的文件。

探索结论写入 `design.md`；`discuss.implementationNotes` 只保存已读文件、关键决策和恢复所需的简短索引，避免下次重复探索。

## [3/6] 决策收敛

向用户提供 2–3 个方案，标记推荐项；确认后写入 `design.md`，并在 YAML 回写可恢复摘要：

```yaml
discuss:
  decisions:
    - id: <stable-id>
      question: <decision>
      options: []
      selected: <option>
      rationale: <why>
  architecture:
    summary: <architecture>
    modules: []
  contracts:
    api: []
    data: []
  reuse:
    components: []
    newComponents: []
  impact:
    dependencies: []
    compatibility: <compatibility>
    rollback: <rollback>
```

## [4/6] 生成 Apply 工作流

用户确认设计后，必须填充 `tasks.md`，再由 Agent 将 tasks.md 投影成唯一执行 DAG，写入 `apply.workflow`。每项必须具备：

```yaml
- id: <stable-task-id>
  title: <task title>
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

规则：

- 每项控制在 2 小时以内；
- 不同写入集合才允许并行；
- verification 必须可执行或可人工判定；
- 需要用户、环境、密钥、外部服务的任务预先声明 `requiredInputs`；
- tasks.md 是固定产物，必须保留任务、依赖、文件、预计耗时与验证；YAML workflow 只承担执行调度、task 状态、证据和断点恢复。

同时写入：

```yaml
apply:
  status: ready
  generatedFrom: [proposal, discuss]
  instructions: []
change:
  status: discussed
artifacts:
  design: { status: completed }
  tasks: { status: completed }
runtime:
  phase: apply
  state: idle
```

在将 Apply 设为 ready 前，必须运行模板契约校验器校验 `design.md` 与 `tasks.md`。把 JSON 输出中的 `templateDigest`、校验时间和失败项写入 `artifacts.design` / `artifacts.tasks` 的 `template.digest` 与 `validation`。任一校验失败时：

```yaml
runtime:
  phase: discuss
  state: failed
  failure:
    kind: verification
    message: <artifact contract failure>
```

不得生成 `apply.status: ready` 或进入 Apply。

## [5/6] 设计未决与熔断

若设计需要用户答案，写入：

```yaml
runtime:
  phase: discuss
  state: waiting_for_input
  requiredInputs:
    - key: <key>
      description: <question>
      supplied: false
  resume:
    command: 继续需求讨论
```

不得生成猜测性的 apply 任务。用户补齐后仅处理未决字段并从 `runtime.phase` 恢复。

## [6/6] 输出

展示 DAG 摘要：任务、依赖、文件、验证、缺失输入。用户确认后提示“开始执行”。
