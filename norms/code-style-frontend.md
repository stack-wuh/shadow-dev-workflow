# 前端代码风格约定

> 适用于 `packages/wuh.site.next`、`packages/wuh.site.console`、`packages/components` 和 `packages/hooks`。先遵守 [code-style.md](code-style.md) 共同底线，再遵守本规范。

## Next.js 主站

- `packages/wuh.site.next` 使用 Next.js 15 App Router；默认优先使用 Server Component，只有需要状态、事件处理、Effect 或浏览器 API 时才使用 Client Component。
- `'use client'` 只放在确实需要客户端能力的组件边界，不向上无理由扩散。
- Server Component 不直接访问 `window`、`document`、`localStorage` 等浏览器 API；共享代码使用前必须有明确运行环境边界。
- 数据请求按页面/模块职责组织，使用项目既有的 `fetch`、缓存和 ISR 约定；不要在多个组件中重复实现同一请求。
- 路由、页面元数据、错误页和 loading 状态遵循 App Router 目录约定。

## Console 应用

- `packages/wuh.site.console` 使用 Vite + React；浏览器入口、路由和构建配置集中在 Console 包内。
- 不从主站页面目录导入实现代码；可复用 UI、Hook 和契约通过 workspace 包公开入口消费。
- 依赖浏览器环境的代码在应用入口或明确的客户端模块中使用，不能泄漏到纯类型/共享包。

## React 组件库

- `packages/components` 只提供通用 UI 能力，不依赖 Next.js 页面、NestJS 服务、业务路由或具体应用状态。
- 组件 Props 命名、受控/非受控行为、事件回调和样式传递方式遵循相邻组件的既有接口风格。
- styled-components 使用 `$` 前缀的 transient props，避免样式专用属性透传到 DOM。
- 主题颜色、间距和状态样式使用 CSS 变量或主题令牌；新增 UI 同时考虑亮色、暗色、键盘焦点和 reduced motion。
- 组件应明确处理 loading、disabled、empty 和 error 等可见状态；交互规则同时遵守 `ui-patterns.md` 与 `interaction.md`。
- 组件的公共导出从包的公开入口维护，禁止消费者依赖组件内部文件路径。

## 共享 Hooks

- `packages/hooks` 只封装可复用的 React 状态、副作用和浏览器能力，不包含页面业务流程。
- Hook 的副作用必须在生命周期中建立和清理；事件监听、定时器、订阅和请求不能遗留。
- 使用 `window`、`document`、`matchMedia` 等 API 时明确处理 SSR/预渲染环境。
- Hook 的返回值保持稳定、语义清晰；需要对外消费的类型从对应包公开导出。

## 前端通用

- React 组件中避免通过副作用派生本可直接计算的状态；状态归属应尽量靠近实际使用位置。
- 表单、异步请求和交互反馈必须覆盖成功、失败、加载和取消等适用状态。
- 前端数据结构优先复用 `@wuh.site/shared-contracts`，展示专用 ViewModel 在边界处转换，不污染共享契约。
- 不在 JSX 中硬编码主题色或环境相关地址；配置通过明确的配置入口提供。
