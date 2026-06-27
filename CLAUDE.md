# Shadow的开发工作流

> 个人级配置，所有项目共享。工作流统一入口为 shadow-dev-workflow（自动加载对应阶段的 phase skill）。
> 项目特有配置（技术栈、命名规范等）见各项目的 CLAUDE.md。

## 分层规则

- 个人级（本文件 + skills/ + rules/）：定义「怎么做」—— 流程、Skill 触发、行为准则、验证标准
- 项目级（各项目 CLAUDE.md）：定义「是什么」—— 技术栈、命名规范、项目约束
- 冲突时项目级优先

## 规则体系

| 文件 | 内容 | 规则数 |
|------|------|--------|
| `rules/behavior.md` | 行为准则 — 4 行模板（防什么/何时触发/做什么/怎么验收），全部以否定约束开头 | 12 条 |
| `rules/iron-laws.md` | 补充铁律 — 非协商，违反即阻断（TDD/验证/调试） | 3 条 |

## Skill 触发

| 场景 | Skill |
|------|-------|
| 新需求 | `shadow-dev-propose` |
| 需求讨论/架构设计 | `shadow-dev-discuss` |
| 开始执行 | `shadow-dev-apply` |
| 代码审查/验收 | `shadow-dev-review` |
| 归档 | `shadow-dev-archive` |
| 提交/PR | `shadow-dev-commit` |
| Bug/异常/测试失败 | `debugging-workflow` |
| UI/UX 设计 | `ui-ux-pro-max` |
