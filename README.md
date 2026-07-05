# shadow-dev-workflow

基于 OpenSpec 的 6 阶段结构化开发工作流，作为 Claude Code 插件使用。**内置所需 superpowers 技能，开箱即用。**
标准闭环是：提案自动创建 GitHub Issue -> 编码 -> 归档 -> 提交自动创建 PR 并合并 -> 自动关闭关联 Issue。

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
| **propose** | "新需求"、"从 Issue 开始" | 创建需求，自动发布 GitHub Issue |
| **discuss** | "需求讨论"、"架构设计" | 需求讨论，只讨论不写代码 |
| **apply** | "开始执行" | 按 tasks.md 执行，含 TDD + worktree 隔离 |
| **review** | "代码审查"、"验收" | 7 维审查 + ESLint + 需求验收 |
| **archive** | "归档" | 文档归档，同步 specs 到主规范 |
| **commit** | "提交"、"PR" | 合入分支 + 推送 + 自动创建 PR + 自动启用 auto-merge + 自动关闭 Issue |

### 快速模式

- **ff（快进）**："快进" / "ff" — 简单变更跳过 discuss 直接生成制品
- **Issue 模式**："从 Issue 开始" — 从 GitHub Issue 读取需求

## 新用户 30 秒上手

1. 说一句 `新需求：<你的想法>`，系统会先帮你生成需求制品并自动建 Issue。
2. 如果需求很明确，可以直接说 `开始执行`，系统会自动从 `.openspec.yaml` 里的 Issue 生成分支名。
3. 编码完成后说 `归档`，再说 `提交`，系统会自动创建 PR、开启 auto-merge，并在合并后关闭关联 Issue。
4. 如果你只是想先讨论方案，直接说 `提案：<你的想法>`。

## 依赖

- OpenSpec CLI（用于 openspec 制品管理）
- `gh` CLI（用于 GitHub Issues 集成和 PR 创建）

## 内置技能

插件内置了工作流所需的 8 个 superpowers 技能，无需额外安装：

`brainstorming` · `writing-plans` · `using-git-worktrees` · `test-driven-development` · `dispatching-parallel-agents` · `subagent-driven-development` · `verification-before-completion` · `receiving-code-review`

## License

MIT
