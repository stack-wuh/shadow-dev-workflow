# Knowledge 约束卡片规范

> Knowledge 是当前有效的执行真相，不是变更历史。

## 作用域

- `norms/`：跨项目硬规则与工程规范。
- `knowledge/`：跨项目经验与协作知识。
- 项目 `shadow-docs/knowledge/`：项目独有的执行真相。
- `brief.md`：记录单次变更发生了什么，不承担当前规范职责。

## 卡片格式

```markdown
---
title: <稳定领域事实名称>
domain: <主领域>
keywords: [<业务词>, <技术词>, <常见现象>]
scope: [<目录、包、路由或业务域>]
status: active
source:
  - changes/<name>/brief.md
verified: YYYY-MM-DD
---

# <稳定领域事实名称>

## 当前结论
<现在成立的事实>

## 执行约束
- <修改相关功能时必须遵守的规则>

## 适用边界
<适用与不适用的场景>

## 验证方式
<可重复检查方法，不保存一次性输出>

## 关联知识
- [<相关卡片>](other-topic.md)
```

`status` 只允许 `active` 或 `deprecated`。`source` 使用相对于知识库根目录的 brief 路径；`verified` 只在通过代码或可重复检查确认结论仍有效时更新。

## 写入门禁

- 一张卡片只表达一个可独立执行的稳定知识单元。
- 标题和文件名描述稳定领域事实，禁止用日期或 `fix`、`add`、`redesign`、`optimize` 等事件命名。
- 不复制 brief 的实现过程与一次性验证输出。
- 新增前按 `domain + keywords + scope` 查重；能原位更新时不新增。
- active 卡片必须出现在 menu 的至少一条路由中。
- source 必须存在，scope 必须明确。
- deprecated 卡片必须指向替代卡片或明确写明无替代。

## 生命周期

- 新事实：新建卡片并加入 menu。
- 事实变化：原位更新，追加 source，验证后更新 verified。
- 事实失效：标记 deprecated，记录替代项或无替代理由；无有效引用后才能删除。
- 无长期事实：只在 brief 的知识评估中记录“无需变更”及理由。

## 冲突处理

优先级：

1. 当前代码与可重复验证结果。
2. active Knowledge。
3. 已完成 brief。
4. 历史索引与迁移记录。

代码与 Knowledge 冲突时不得猜测或静默覆盖。先确认代码是有意变更、回归还是卡片过期，再更新其中过期的一方。
