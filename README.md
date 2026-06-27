# shadow-dev-workflow

基于 OpenSpec + Superpowers 的 6 阶段结构化开发工作流，作为 Claude Code 插件使用。

## 安装

### 前置依赖

```bash
# 安装 superpowers 插件（提供 brainstorming、writing-plans、TDD、verification 等基础技能）
claude plugins install superpowers@claude-plugins-official
```

### 安装本插件

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
| **propose** | "新需求"、"从 Issue 开始" | 创建需求，支持 GitHub Issue 读取/发布 |
| **discuss** | "需求讨论"、"架构设计" | 需求讨论，只讨论不写代码 |
| **apply** | "开始执行" | 按 tasks.md 执行，含 TDD + worktree 隔离 |
| **review** | "代码审查"、"验收" | 7 维审查 + ESLint + 需求验收 |
| **archive** | "归档" | 文档归档，同步 specs 到主规范 |
| **commit** | "提交"、"PR" | 合入分支 + 推送 + 自动创建 PR |

### 快速模式

- **ff（快进）**："快进" / "ff" — 简单变更跳过 discuss 直接生成制品
- **Issue 模式**："从 Issue 开始" — 从 GitHub Issue 读取需求

## 依赖

- [superpowers](https://github.com/anthropics/claude-plugins-official) >= 5.0.0
- OpenSpec CLI（用于 openspec 制品管理）
- `gh` CLI（用于 GitHub Issues 集成和 PR 创建）

## License

MIT
