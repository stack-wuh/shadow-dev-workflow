# 信号库（Signals）

> 格式、生命周期与护栏见 workflow 仓 `norms/signals.md`。条目按命中时间排序，最新命中的在前。

## SGN-004 · node 子进程 exit 139 是机器段错误风暴，重试至收敛，勿误判为代码失败
- 方向: positive
- 权重: 5
- 深度: runtime
- 域/scope: 环境 · 任意 node/vitest/tsc/electron 子进程
- 证据: 20260924-feature-git-history-capsule 全链路（tsc/vitest/archive 多次 139 后重试全绿）
- 命中: 6（最近 2026-09-25）
- 退役条件: 更换机器或 node 升级修复 V8 编译缓存问题

## SGN-005 · 系统代理开启时 electron 主进程 net.fetch 会劫持 localhost 自定义端口，实机走查必带 --no-proxy-server
- 方向: positive
- 权重: 4
- 深度: runtime
- 域/scope: 环境 · electron dev 走查
- 证据: 20260924-feature-git-history-capsule 走查（net.fetch 60s 全失败，加 flag 后 7×3s 内主窗加载）
- 命中: 1（最近 2026-09-25）
- 退役条件: 系统代理长期关闭或 electron 修复代理对回环的处理

## SGN-006 · 插件帧子资源请求在主会话 CDP Network 域不可见（OOPIF 或同进程帧行为不一致），勿在主会话反复抓包
- 方向: negative
- 权重: 4
- 深度: runtime
- 域/scope: plugin · components/plugins/PluginFrameHost.tsx 走查
- 证据: 20260924-feature-git-history-capsule 走查（逻辑帧文档请求可见、sdk.js/view.js 子资源请求零捕获，烧约 40min）
- 命中: 1（最近 2026-09-25）
- 退役条件: 帧加载机制重构使子资源请求可观测

## SGN-007 · worktree 装依赖勿用 symlink node_modules（Turbopack 报 "points out of the filesystem root" 直接 panic），用 pnpm i --ignore-workspace --prefer-offline
- 方向: negative
- 权重: 4
- 深度: runtime
- 域/scope: 环境 · worktree 工具链
- 证据: 20260924-feature-git-history-capsule（symlink 下 vitest/tsc 正常但 next dev 秒死）
- 命中: 1（最近 2026-09-25）
- 退役条件: Turbopack 支持符号链接的 node_modules

## SGN-008 · electron 走查抓插件帧：OOPIF 帧走 /json/list 直连 target，同进程帧走 Runtime executionContext / frameTree + createIsolatedWorld，一种通道读不到立刻换另一种
- 方向: positive
- 权重: 3
- 深度: runtime
- 域/scope: plugin · electron CDP 走查
- 证据: 20260924-feature-git-history-capsule 走查（scripts/electron-walkthrough.mjs 即此模式沉淀）
- 命中: 1（最近 2026-09-25）
- 退役条件: CDP 协议行为变化使两种通道统一
