# Shadow 的开发工作流

> 自包含技能包，不依赖任何外部工作流插件。以三层知识库驱动开发决策。
> 项目特有配置（技术栈、命名规范等）见各项目的 CLAUDE.md。

## 分层规则

- 本仓库（skills/ + norms/ + menu.md）：定义「怎么做」—— 流程、Skill、行为准则、验证标准
- 项目级（各项目 CLAUDE.md）：定义「是什么」—— 技术栈、命名规范、项目约束
- 项目 `shadow-docs/knowledge/`：项目独有的领域知识
- 冲突时项目级优先

## 规则体系

| 文件 | 内容 |
|------|------|
| `rules/behavior.md` | 行为准则 — 12 条，以否定约束开头 |
| `rules/iron-laws.md` | 补充铁律 — TDD、验证、调试、分支 |
| `norms/` | 跨项目通用规范 — UI、API、交互、代码风格、TDD |

## 知识库

| 层级 | 位置 | 内容 |
|------|------|------|
| 规范级 | `norms/` | 跨项目通用约束 |
| 项目级 | `shadow-docs/knowledge/` | 项目独有领域知识 |
| 菜单级 | `menu.md` | 技术域 → 规范路由表 |

## Skill 触发

| 场景 | Skill |
|------|-------|
| 新需求 / 提案 / 方案设计 | `shadow-dev-propose` |
| 开始执行 / apply / 实现 | `shadow-dev-apply` |
| 代码审查 / review / 验收 | `shadow-dev-review` |
| 提交 / PR / 发布 / 归档 | `shadow-dev-ship` |
| 知识库查询 | `shadow-dev-knowledge`（propose 自动调用）|
