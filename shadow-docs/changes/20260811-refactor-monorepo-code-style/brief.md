---
{"schema":"shadow-dev/v1","name":"20260811-refactor-monorepo-code-style","type":"refactor","scope":"shadow-dev-workflow/norms","status":"implemented","baseBranch":"main","branch":"feat-standalone-cross-platform-workflow","files":["menu.md","norms/code-style.md","norms/code-style-frontend.md","norms/code-style-backend.md","norms/code-style-database.md","norms/code-style-packages.md","shadow-docs/changes/20260811-refactor-monorepo-code-style/brief.md"],"github":{"repository":null,"issue":null,"issueUrl":null,"pullRequest":null,"pullRequestUrl":null},"review":{"conclusion":"pending","verifiedCommit":null,"verifiedAt":null},"workflow":{"operation":null,"checkpoint":null,"planHash":null,"updatedAt":null,"lastError":null}}
---

# Monorepo 代码规范重构

## 动机

当前 `code-style.md` 将前端、后端和通用规则混在一起，无法准确约束包含多个应用端、服务端和共享包的 `x.wuh.site` monorepo。数据库设计规范也需要从后端模块规范中明确分离出来。

## 引用规范

- `norms/code-style.md`
- `norms/api-design.md`
- `norms/knowledge-cards.md`
- `menu.md`

## 决策

- 保留 `code-style.md` 作为 monorepo 共同底线和依赖边界规范。
- 新增前端、后端、数据库、共享包四份分规范。
- 数据库设计与 MongoDB/Mongoose 代码规范集中在 `code-style-database.md`，不再继续拆分。
- 规范以当前 `x.wuh.site` 技术栈为主要执行对象。
- 采用渐进式治理：新代码必须遵守；修改旧代码时只处理与本次改动直接相关的问题。
- 不再把单文件 300 行、所有导出函数必须有 JSDoc、所有网络请求必须重试作为全 monorepo 的绝对规则。

## 任务

- [x] 重写 monorepo 总代码规范。
- [x] 新增前端代码规范。
- [x] 新增后端代码规范。
- [x] 新增数据库设计与代码规范。
- [x] 新增共享包代码规范。
- [x] 更新开发菜单路由。
- [x] 创建设计记录并完成一致性检查。

## 结果

完成五层规范文件和开发菜单路由更新，覆盖主站、管理端、组件库、Hooks、共享契约、配置包、NestJS API、MongoDB/Mongoose 及维护脚本。

## 知识评估

无需新增项目 Knowledge。此次变更更新的是跨项目 workflow 的 `norms/` 工程规范；具体业务数据模型和实现事实仍由项目 `shadow-docs/knowledge/` 管理。
