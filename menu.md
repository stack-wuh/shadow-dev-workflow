# 开发菜单

> AI 在 propose 阶段根据需求涉及的技术域，用此表路由到对应规范。

## 路由规则

收到需求后，提取技术域关键词，按下表匹配应查阅的规范。每个匹配到的规范必须读取并提取约束，在 brief.md 的「引用规范」部分记录。

| 技术域 | 关键词 | 应查阅 |
|--------|--------|--------|
| UI 变更 | 页面 组件 布局 样式 配色 字体 按钮 卡片 弹窗 导航 列表 | norms/ui-patterns.md, norms/interaction.md, 项目 knowledge/ 中与组件/主题相关的条目 |
| API 变更 | 接口 端点 API 路由 REST 查询 请求体 响应体 | norms/api-design.md, 项目 knowledge/ 中与对应模块的 API 条目 |
| 前后端对接 | 对接 联调 数据获取 fetch | UI 变更 + API 变更（合并路由）|
| 数据库变更 | Schema Model 字段 索引 迁移 MongoDB | 项目 knowledge/ 中数据模型相关条目 |
| 性能优化 | 首屏 加载 缓存 LCP CLS SSR ISR | norms/code-style.md, 项目 knowledge/ 中性能相关条目 |
| Bug 修复 | 报错 崩溃 异常 不对 显示不正常 | norms/tdd-verification.md, 项目 knowledge/ 中相关领域条目 |
| 交互/动画 | 动效 过渡 动画 手势 滚动 | norms/interaction.md, 项目 knowledge/ 中动效相关条目 |
| 无障碍 | a11y aria 对比度 屏幕阅读 焦点 键盘 | norms/interaction.md, norms/ui-patterns.md |

## 查阅流程

```
1. 提取需求中的技术域关键词
2. 在此表中匹配 → 得到规范文件清单
3. 扫描 shadow-docs/knowledge/ 下的项目知识条目 → 匹配标题/关键词
4. 读取匹配到的所有规范
5. 提取约束条件，记录到 brief.md 的「引用规范」部分
6. 在方案设计时，每条约束要么遵循，要么在「决策」中明确说明为什么不适用
```
