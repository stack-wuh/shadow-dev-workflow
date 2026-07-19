---
name: shadow-dev-propose
description: 创建 Agent Loop 需求 — 将需求产物写入单一 .openspec.yaml，并自动关联 GitHub Issue
---
# 💫 Propose — Agent Loop 需求创建

## 核心约束

新变更使用 `agent-loop/v1`。`.openspec.yaml` 是唯一的 Agent Loop **控制面**：

```text
openspec/changes/<change>/.openspec.yaml
```

固定 OpenSpec 产物必须保留并从 templates 创建：`proposal.md`、`design.md`、`tasks.md`、`specs/<domain>/spec.md`。YAML 记录它们的路径、状态、摘要、依赖、checkpoint 和熔断信息，避免 Agent 在各阶段无目的地反复扫描文档。完整协议见 `skills/shadow-dev-workflow/references/agent-loop-protocol.md`。

历史变更（`schema` 不为 `agent-loop/v1`）保持只读兼容；必须读取 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-propose.md` 执行旧规则，不得在本阶段隐式迁移。

## [1/7] 判断入口

- 用户说 `ff` / `快进`：使用快速模式，仅适用于单文件、输入输出明确、无架构影响的变更。
- 用户说 `Issue` / `从 Issue 开始`：读取指定 Issue，再选择 full 或 ff。
- 其他 `提案`、`新需求`、`bug反馈`：默认 full。

在明确需求前，不读取代码或现有变更。

## [2/7] 对齐需求

full 模式必须完成一次需求对齐：一次只问一个必要问题，明确：

- 要解决的问题与成功标准；
- 范围、非目标、风险；
- 是否涉及用户决策、外部服务或敏感输入。

ff 模式只做一次快速确认。确认后才可读取 `openspec/INDEX.md` 与最小范围的代码上下文。

需求对齐完成后，必须进行一次 UI/UX 语义分类，并写入 `proposal.uiux`：

```yaml
proposal:
  uiux:
    mode: required | skipped | uncertain
    triggers: []
    rationale: <classification reason>
```

- `required`：用户意图包含页面、前端、组件、视觉、UI、UX、布局、交互、响应式、设计系统、品牌、动效、无障碍或 Figma。
- `skipped`：仅后端、API、数据库、同步、Webhook、部署、CI、测试、日志或构建，且没有界面影响。
- `uncertain`：需求没有足够信息判断界面影响；把“是否影响用户界面或交互？”写入 `runtime.requiredInputs`，不得猜测。

`required` 只标记后续 discuss 必须调用 `ui-ux-pro-max`；propose 不得在此时提前生成视觉方案或绕过 brainstorming 确认。

## [3/7] 规范预检

读取 `openspec/INDEX.md`。仅在关键词至少命中两个时读取相关领域规范；将冲突、可复用约束和待确认问题记入后续 YAML 的 `proposal.constraints` / `proposal.risks`。

## [4/7] 创建固定产物与控制面

按 `openspec/config.yaml` 命名规则创建：

```text
openspec/changes/<YYYY-MM-DD-P-or-B-kebab-case>/
```

必须从 templates 创建以下固定产物，并登记到 YAML 的 `artifacts`：

```text
.openspec.yaml
proposal.md
design.md
tasks.md
specs/<domain>/spec.md
```

proposal 阶段填充 `proposal.md` 与 `specs/<domain>/spec.md`；`design.md`、`tasks.md` 先按模板创建，留待 discuss 填充。YAML 填充：

```yaml
schema: agent-loop/v1
change:
  id: <name>
  title: <title>
  type: feature | bug
  status: proposed
proposal:
  status: completed
  source: {}
  intent: <summary>
  background: <background>
  goals: []
  nonGoals: []
  scope: { packages: [], files: [] }
  acceptanceCriteria: []
  constraints: []
  risks: []
  domain: { name: <name>, keywords: [], description: <description> }
  uiux: { mode: skipped, triggers: [], rationale: <reason> }
runtime:
  phase: discuss
  state: idle
```

`proposal.md` 与 `spec.md` 是 proposal 阶段的正式、人可读产物；YAML 仅保存它们的控制索引、摘要和阶段状态。

创建后必须运行模板契约校验器，分别校验 proposal 和每个 spec。将校验器 JSON 输出中的 `templateDigest`、`checkedAt`、`missingHeadings` / `invalidPatterns` 写入对应 `artifacts.*.template.digest` 与 `artifacts.*.validation`。校验失败时：

```yaml
runtime:
  phase: propose
  state: failed
  failure:
    kind: verification
    message: <artifact contract failure>
```

不得创建 Issue 或进入 discuss，直到固定产物通过其模板契约。

## [5/7] 创建 GitHub Issue

创建 Issue 后将 URL 写入：

```yaml
change:
  issue: https://github.com/<owner>/<repo>/issues/<number>
```

Issue 正文须包含 `proposal.intent`、目标、非目标、验收条件和变更 ID。若 `gh issue create` 失败，立即停止，写入：

```yaml
runtime:
  phase: propose
  state: blocked
  failure:
    kind: retryable
    message: <failure message>
  resume:
    command: 继续提案
```

不要重试，不得创建未关联 Issue 的新 Agent Loop 变更。

## [6/7] 完成与交接

仅当 `proposal.status: completed`、`change.issue` 存在时：

```yaml
change:
  status: proposed
runtime:
  phase: discuss
  state: completed
```

输出变更 ID、Issue、已写入的 proposal 字段，并提示用户使用“需求讨论”。

## [7/7] 失败与恢复

所有缺失输入、外部失败或需求矛盾必须写入 `runtime.failure` 与 `runtime.requiredInputs`。用户补齐信息后，从 `runtime.phase` 恢复；不得重新创建 change 或重复 Issue。
