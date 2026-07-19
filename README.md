# shadow-dev-workflow

基于 OpenSpec 的 6 阶段 Agent Loop 工作流，作为 Claude Code 插件使用。**内置所需 superpowers 技能，开箱即用。**
每个变更由一个 `.openspec.yaml` 状态机文件驱动；固定的 `proposal.md`、`design.md`、`tasks.md`、`spec.md` 仍然保留。YAML 集中管理它们的索引、阶段状态、执行 DAG、验证证据、失败熔断与恢复检查点。

## 安装

```bash
claude plugins install stack-wuh/shadow-dev-workflow
```

或手动克隆：

```bash
git clone https://github.com/stack-wuh/shadow-dev-workflow ~/.claude/plugins/cache/shadow-dev-workflow
```

## 工作流

```
propose ──→ discuss ──→ apply ──→ review ──→ archive ──→ commit
 新建需求     需求讨论     开始执行    代码审查   文档归档   提交/PR
                           ↑            │
                           └── ✗ ──────┘
```

### 阶段

| 阶段 | 触发词 | 说明 |
|------|--------|------|
| **propose** | "新需求"、"从 Issue 开始" | 生成 proposal/spec 固定产物并写入 YAML 索引、自动发布 GitHub Issue |
| **discuss** | "需求讨论"、"架构设计" | 填充 design/tasks 固定产物，并生成 `apply.workflow` 执行 DAG |
| **apply** | "开始执行" | 按 YAML 索引只加载 proposal/discuss 固定产物，按 checkpoint 执行任务 |
| **review** | "代码审查"、"验收" | 写入验证证据与 findings；阻塞项生成 repair DAG |
| **archive** | "归档" | 保持 specs 合并、组件场景沉淀和 INDEX 更新，并写入 YAML 归档证据 |
| **commit** | "提交"、"PR" | 读取 YAML 门禁后推送、创建 PR、记录发布状态 |

### 快速模式

- **ff（快进）**："快进" / "ff" — 简单变更将最小 proposal 与 apply DAG 直接写入 YAML
- **Issue 模式**："从 Issue 开始" — 从 GitHub Issue 读取需求

## 新用户 30 秒上手

1. 说一句 `新需求：<你的想法>`，系统会创建一个 `.openspec.yaml` 状态机并自动建 Issue。
2. 需求讨论完成后，Agent 会把决策转成 YAML 中的 `apply.workflow`；说 `开始执行` 即从第一个可执行 task 开始。
3. 任何失败都会写入 `runtime.failure` 与 `requiredInputs`；补齐必要输入后说 `继续`，系统会从 checkpoint 恢复。
4. 编码完成后说 `归档`，再说 `提交`；只有 YAML review 门禁通过时才会创建 PR 或自动合并。
4. 如果你只是想先讨论方案，直接说 `提案：<你的想法>`。

## 依赖

- OpenSpec-compatible 项目目录（Agent Loop 保留固定 Markdown 制品，并用 `.openspec.yaml` 管理其状态和读取范围）
- `gh` CLI（用于 GitHub Issues 集成和 PR 创建）

## 内置技能

插件内置了工作流所需的 8 个 superpowers 技能，无需额外安装：

`brainstorming` · `writing-plans` · `using-git-worktrees` · `test-driven-development` · `dispatching-parallel-agents` · `subagent-driven-development` · `verification-before-completion` · `receiving-code-review`

## License

MIT
