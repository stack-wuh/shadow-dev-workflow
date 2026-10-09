---
title: 分发依赖单向与产物能力契约
domain: distribution
keywords: [分发, 安装, 依赖方向, cliVersion, pin, requiresCommands, 能力契约, ARTIFACT_INCOMPATIBLE, missingCommands, 静默降级, 宿主适配, adapter, bind]
scope: [cross-project]
status: active
source:
  - changes/20261009-refactor-cli-driven-distribution/brief.md
verified: 2026-10-09
verified-depth: runtime
verified-scope: `npm run check:requires` 差集为空 + `bind plan/execute --host codex` 在隔离 home 物化 8 技能 + 越权 fixture 被 v1.5.0 拒绝（真实输出见本 change brief「结果」段）
---

# 分发依赖单向与产物能力契约

## 当前结论

内容/规范包（skills、norms、knowledge、模板）与执行层 CLI 之间的依赖必须**单向**：CLI 驱动包的下载、物化、绑定与回滚；包不安装 CLI、不 pin CLI 版本、不通过宿主 hook 反向拉起工具链。一个生态只允许一条安装轨——两条轨并存（插件引导 CLI + CLI 引导插件）必然产生双份安装器与两份真相，且漂移方向不可控。

两侧兼容判定不用静态版本号，而用**能力名**：包在自身清单里声明需要的命令键（本项目＝`package.json.requiresCommands`），执行层在**任何落盘动作之前**拿自身命令目录断言，缺失即响亮失败（错误码 `ARTIFACT_INCOMPATIBLE`），指针与既有安装态保持不变；未声明视为兼容，旧包零破坏。命令键是唯一会随两侧自然同步的货币；版本号是需要人工维护的静态断言，一旦漏维护就把错位伪装成正常使用。

## 执行约束

- 内容包内禁止出现安装器、版本 pin、自举 hook；安装顺序恒为 `bootstrap → 产物 plan/execute → 宿主 bind plan/execute`。
- 声明与消费**同源登记**：包侧 `requiresCommands` 与执行侧命令目录（`lib/commands.mjs` 的 `COMMANDS`）任一侧变化，必须由一致性门在装配前判红（本项目 `npm run check:requires`：`skills 引用 ⊆ requiresCommands ⊆ CLI 命令目录`）。
- 引用的命令在执行层缺失时**只能阻塞，不能降级**：禁止「命令不可用就走另一条路径」的静默兜底。
- 观测面恒不抛：状态命令（`workflow status`）回 `artifactVersion / cliVersion / missingCommands` 三元组，引导页与巡检读这一个字段即可判断「内容比工具新」。
- 跨仓演进顺序恒为**消费方先行兼容、生产方随后声明**：执行层先发布支持断言的版本，内容包才删旧轨并声明需求；反序会留下无人兜底的窗口。
- 新增宿主/消费者不改执行层代码，只加描述符（`adapters/<host>.json`）；`skillsDir` 是唯一宿主差异点。

## 适用边界

适用于「工具链 + 内容/规范包」的双仓或多产物结构（插件、模板包、SDK 与其脚手架）。不适用：单一可执行体的自更新（安装器指针足够）；无安装态的纯文档产物。

## 验证方式

1. 一致性门：`skills 引用 ⊆ requiresCommands ⊆ CLI 命令目录` 两级包含、差集为空，非零退出即不成立。
2. 装配前拒绝：构造声明了执行层不存在命令键的 fixture 包，`plan` 应 `ok:true` 且透出 `missingCommands` 预览，`execute`/`link` 应 `ARTIFACT_INCOMPATIBLE`，且 `CURRENT`/`PREVIOUS`/`LINK` 不变、不产生半成品目录。
3. 缺省兼容：不带 `requiresCommands` 的历史包仍能物化并切指针。
4. 状态可读：`workflow status` 三元组如实回显；宿主清单以 sidecar 托管记录为准，非托管同名目录拒绝覆盖。

## 关联知识

- [Bug 调查保持单一上下文](bug-investigation.md)
- CLI 仓 `shadow-docs/knowledge/install-distribution.md`（双轨安装器、指针前置校验、bind/sidecar 与 tar 跨平台细节）
