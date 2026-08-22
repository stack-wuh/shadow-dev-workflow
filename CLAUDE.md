# Shadow 的开发工作流

> 自包含技能包，以 active Knowledge 驱动开发决策。项目技术栈和约束见项目 CLAUDE.md。

## 分层规则

- `skills/`：定义 propose、apply、review、release、archive 和 Knowledge 查询流程。
- `norms/`：跨项目硬规则与工程规范。
- `knowledge/`：跨项目经验与协作知识。
- 项目 `shadow-docs/knowledge/`：项目独有的执行真相。
- `menu.md` 与项目 `shadow-docs/menu.md`：任务到规范和 active Knowledge 的路由。
- `brief.md` 与 INDEX：变更记录和历史索引，不覆盖 active Knowledge。

## 规则体系

| 位置 | 内容 |
|------|------|
| `rules/behavior.md` | 行为准则 |
| `rules/iron-laws.md` | TDD、验证、调试、分支和 deterministic CLI 铁律 |
| `norms/knowledge-cards.md` | Knowledge 卡片格式、生命周期和冲突处理 |
| `norms/*.md` | UI、API、交互、代码风格和验证规范 |
| `knowledge/*.md` | 跨项目经验与协作知识 |

项目外 memory 不是工作流执行真相源。

## 冲突优先级

1. 当前代码与可重复验证结果。
2. active Knowledge。
3. 已完成 brief。
4. 历史索引与迁移记录。

冲突时先确认代码是有意变更、回归还是卡片过期，不静默覆盖。

## Skill 触发

| 场景 | Skill |
|------|-------|
| 新需求、提案、方案设计 | `shadow-dev-propose` |
| 开始执行、实现 | `shadow-dev-apply` |
| 审查、验收 | `shadow-dev-review` |
| 提交、PR、发布 | `shadow-dev-release` |
| 归档 | `shadow-dev-archive` |
| Knowledge 查询 | `shadow-dev-knowledge`（propose 自动调用） |

## Deterministic CLI

brief JSON frontmatter 是变更状态唯一真相。brief、INDEX、Git 与 GitHub 写操作统一通过 `shadow-dev`，写操作必须确认并校验 planHash。禁止原始 Git/GitHub 写命令、全量暂存、`--no-verify` 和自动冲突解决。

change 命名统一为 `YYYYMMDD-{type}-{slug}`，其中 type 对应 GitHub issue label：`feature`、`fix`、`build`、`chore`、`docs`、`refactor`、`style`、`test`。
