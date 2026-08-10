# 开发菜单

> AI 在 propose 阶段根据任务域、关键词和 scope 精确路由规范与 active Knowledge。

## 路由规则

| 技术域 | 关键词 | 应查阅 |
|--------|--------|--------|
| Knowledge 治理 | knowledge 知识库 沉淀 卡片 路由 过期 冲突 | norms/knowledge-cards.md |
| UI 变更 | 页面 组件 布局 样式 配色 字体 按钮 卡片 弹窗 导航 列表 | norms/ui-patterns.md, norms/interaction.md, 项目相关 active Knowledge |
| API 变更 | 接口 端点 API 路由 REST 查询 请求体 响应体 | norms/api-design.md, 项目相关 active Knowledge |
| 前后端对接 | 对接 联调 数据获取 fetch | UI 变更 + API 变更 |
| 数据库变更 | Schema Model 字段 索引 迁移 MongoDB | 项目数据模型 active Knowledge |
| 性能优化 | 首屏 加载 缓存 LCP CLS SSR ISR | norms/code-style.md, 项目性能 active Knowledge |
| Bug 修复 | 报错 崩溃 异常 不对 显示不正常 | norms/tdd-verification.md, knowledge/bug-investigation.md, 项目相关 active Knowledge |
| 交互/动画 | 动效 过渡 动画 手势 滚动 | norms/interaction.md, 项目动效 active Knowledge |
| 无障碍 | a11y aria 对比度 屏幕阅读 焦点 键盘 | norms/interaction.md, norms/ui-patterns.md |

## 查阅流程

1. 提取任务域、关键词、模块和变更 scope。
2. 按本表得到通用规范和通用 Knowledge。
3. 追加项目 `shadow-docs/menu.md` 的命中路由。
4. 只读取 `domain + keywords + scope` 命中且 `status: active` 的卡片，不扫描全文读取全部 Knowledge。
5. deprecated 卡片仅在追溯替代关系时读取。
6. 将适用卡片路径、当前结论和 scope 记录到 brief 的「引用规范」。
7. 每条约束必须遵循，或在「决策」中说明为什么不适用。
