# Shadow Dev Workflow v6

自包含开发技能包，不依赖任何外部工作流插件。基于三层知识库（规范级 → 项目级 → 菜单级）驱动开发决策。

## 架构

```
skills/
├── wuh-propose/     # 需求对齐 + 方案设计 → brief.md
├── wuh-apply/       # 代码执行：分支 + TDD + Agent 调度
├── wuh-review/      # 质量门禁：验证 + 对照论据检查
├── wuh-ship/        # 归档 + 提交 + PR
└── wuh-knowledge/   # 知识库查询（propose 自动调用）

norms/               # 跨项目通用规范
├── ui-patterns.md
├── api-design.md
├── interaction.md
├── code-style.md
└── tdd-verification.md

menu.md              # 技术域 → 规范路由表
rules/               # 行为准则 + 铁律（不可协商）
```

## 三层知识库

| 层级 | 位置 | 内容 |
|------|------|------|
| 规范级 | `norms/` | 跨项目通用约束（UI、API、交互、代码风格、TDD） |
| 项目级 | `shadow-docs/knowledge/` | 项目独有领域知识片段 |
| 菜单级 | `menu.md` | 按技术域路由到对应规范 |

做新需求时，wuh-propose 自动查菜单 → 拉规范 + 项目知识 → 约束方案设计 → 写入 brief.md 的「引用规范」和「决策」部分。

## brief.md（替代 proposal + design + tasks + specs）

一个变更一个文件。包含：动机、引用规范、决策（含方案对比和论据）、任务（Phase 分组）、结果。

## 工作流

```
propose → apply → review → ship
```

| 阶段 | 触发词 | 说明 |
|------|--------|------|
| **propose** | "新需求"、"提案"、"方案设计" | 聊清需求 → 出方案（含论据）→ 写 brief.md |
| **apply** | "开始执行"、"apply"、"实现" | 检测冲突 → 切分支 → TDD → 按 Phase 并行执行 |
| **review** | "代码审查"、"review"、"验收" | 验证门禁 → 6 维审查 → 对照论据 → 结论分级 |
| **ship** | "提交"、"PR"、"发布"、"归档" | 归档 brief → 提炼知识 → commit → PR |

没有强制顺序。简单改动可跳过 propose。Bug 修复可跳过 propose 直接 apply。

## 与传统 OpenSpec 的差异

- 1 个 brief.md 替代 4 个制品文件
- 决策论据替代 GIVEN/WHEN/THEN
- 知识库驱动设计约束，而非 AI 自由发挥
- 支持多需求并行（INDEX.md 追踪冲突）
- 零外部依赖

## 安装

作为 Claude Code 插件：

```bash
claude plugins install stack-wuh/shadow-dev-workflow
```

## 在项目中使用

项目只需要：

```
shadow-docs/
├── INDEX.md          # 变更索引
├── knowledge/        # 项目专有领域知识
├── menu.md           # 项目级路由（非必须，追加到通用菜单）
├── changes/           # 进行中的变更
└── archive/          # 已完成的变更
```

## 依赖

- Node.js 20+
- `gh` CLI（可选，用于 Issue 和 PR 集成）

## License

MIT
