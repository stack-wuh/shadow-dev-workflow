---
name: shadow-dev-knowledge
description: 知识库查询 — 根据任务域、关键词和 scope 匹配菜单路由，只拉取 active 规范和知识。被 propose 自动调用。
---
# Shadow Dev Knowledge — 知识库查询

只被 `shadow-dev-propose` 在需求对齐阶段调用，为方案注入当前有效约束。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-knowledge · 知识库查询`

## 查询流程

### 1. 提取查询条件

从需求中提取：

- 任务域：UI、API、数据库、性能、交互、Bug、Knowledge 治理等。
- 关键词：业务词、技术词和故障现象。
- scope：涉及的目录、包、路由或业务模块。

### 2. 按菜单路由

1. 读取通用 `menu.md`，得到通用 norms 和通用 Knowledge。
2. 如项目存在 `shadow-docs/menu.md`，追加项目路由。
3. 只读取菜单命中的文件，不全文扫描全部 Knowledge。
4. Knowledge 必须同时综合 `domain`、`keywords` 和 `scope` 判断相关性。
5. 默认只读取 `status: active`；deprecated 仅用于追溯替代关系。
6. 所有变更默认读取 `norms/code-style.md`。

## Knowledge 卡片要求

```yaml
---
title: 博客封面图
domain: blog
keywords: [封面图, cover, metadata]
scope: [packages/wuh.site.next/app/post]
status: active
source:
  - changes/archive/example/brief.md
verified: 2026-08-08
---
```

读取前检查：

- source 指向存在的 brief。
- active 卡片出现在 menu 的至少一条路由中。
- scope 是明确的路径、包、路由或业务域。
- 同一 scope 下不存在相互冲突的 active 结论。

任一检查失败时输出阻塞项，不把卡片作为可靠执行依据。

## 输出格式

```markdown
## Knowledge 匹配结果

### 技术域与 scope
- 技术域: blog, UI
- scope: packages/wuh.site.next/app/post

### 通用规范
- norms/ui-patterns.md: <适用约束>

### Active Knowledge
- shadow-docs/knowledge/post-cover.md
  - scope: packages/wuh.site.next/app/post
  - source: changes/archive/<name>/brief.md
  - verified: YYYY-MM-DD
  - 执行约束: <约束摘要>

### 阻塞项
- 无；或列出 source、路由、scope、冲突问题

### 不适用
- <文件>: <为什么不适用>
```

## 约束处理

- 每条适用约束必须进入 brief 的「引用规范」，记录路径、当前结论和 scope。
- 不遵循约束时必须在「决策」中说明理由。
- 新增 Knowledge 前按 `domain + keywords + scope` 查重，能更新现有卡片时不新增。
- 新组件和样式必须先确认项目组件库是否已有可复用实现。

**离场：** 完成时输出：`✅ [离场] shadow-dev-knowledge · 命中 N 条 active 卡片 · 返回 shadow-dev-propose`
