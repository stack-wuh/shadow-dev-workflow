---
title: 产物能力声明与分发一致性门
domain: distribution
keywords: [分发, pin, cliVersion, requiresCommands, 能力声明, 一致性门, check:requires, ARTIFACT_INCOMPATIBLE, missingCommands, 静默降级, 响亮阻塞, 版本错位]
scope: [cross-project]
status: active
source:
  - changes/20261009-build-artifact-capability-gate/brief.md
  - changes/20261010-build-quality-gate/brief.md
verified: 2026-10-10
verified-depth: runtime
verified-scope: `npm run check:requires` 两级差集为空；把声明里删掉一键的门负例（exit 1 且点名该键）；越权 fixture 被 v1.5.0 以 `ARTIFACT_INCOMPATIBLE` 拒绝且指针不动
---

# 产物能力声明与分发一致性门

## 当前结论

内容包与执行层之间有两件事必须**分开**，混淆就会漂：

1. **装哪个 CLI** —— 由内容包的版本 pin 决定（本项目 `package.json.cliVersion`）。它是静态声明，必须有人或有机检维持。
2. **这份内容能不能装进这个 CLI** —— 由内容包自声明所需命令键（`requiresCommands`）、执行层在**任何落盘动作之前**拿自身命令目录断言决定；缺失即响亮失败（`ARTIFACT_INCOMPATIBLE`），指针与既有安装态不变。未声明视为兼容，旧包零破坏。

命令键是唯一会随两侧自然同步的货币；版本号需要人工维护，一旦漏维护就把错位伪装成正常使用（实证：README 写 v1.1.0、pin 写 v1.4.0、skills 已指挥 v1.5.0 才发布的 worktree 域，三处同时漂）。

## 执行约束

- pin 与能力声明**必须共存且互相校验**：改 pin 之后必须跑一致性门（本项目 `npm run check:requires`：`skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录`），两级差集非空即判红。禁止只靠人记忆同步。
- 声明集必须**恰好覆盖内容包真正会跑的命令**：内容里出现即要声明，包括恢复动作（如「升级 CLI」用的 `workflow plan/execute`）——它们是同一份指令要执行的命令。
- 内容层遇到命令缺失**只能阻塞，不能降级**：禁止「worktree 不可用就改走 branch」这类静默兜底，它把版本错位转成更难发现的长期偏差。
- 同一条纪律套在**自己的机器门**上：一致性门解析不到执行层命令目录时必须判红（`check:requires:strict`），禁止以「CLI 目录未参与断言」的半绿放行。非交互环境里 human 帮助层会与 JSON 同流写 stdout，命令目录必须取最后一个 `{"ok"` 契约行并带超时——否则门要么假红要么假绿（本仓实测：`check:requires` 非 strict 在 CLI 缺失时 rc=0 半绿，旧解析法在非 TTY 下恒 unresolved 假红）。
- 观测面恒不抛：`workflow status` 回 `artifactVersion / cliVersion / missingCommands`，引导页/巡检读一个字段即可判断「内容比工具新」。
- 跨仓演进顺序：消费方先行兼容（执行层发布支持断言的版本），生产方随后声明；反序会留下无人兜底的窗口。
- 宿主差异只进描述符（`adapters/<host>.json`），插件/hook 轨与 bind 轨可并存（见 [多宿主插件分发](multi-host-plugin-distribution.md)），但两条轨都不得自行安装或选择 CLI 版本以外的东西。

## 适用边界

适用于「工具链 + 内容/规范包」的双仓结构与多宿主分发。不适用：单一可执行体自更新；无安装态的纯文档产物。

## 验证方式

1. `npm run check:requires` → `undeclared=[] missing-in-cli=[]` 且退出码 0。
2. **门负例**：把声明里任意一键删掉后重跑，必须退出码 1 并点名该键（证明门真的在判，不是摆设）。
3. `workflow plan --from <本仓>` → `ok:true` 且 `missingCommands=[]`；构造声明了不存在命令键的 fixture → `workflow execute`/`link` 报 `ARTIFACT_INCOMPATIBLE` 且 `CURRENT`/`PREVIOUS`/`LINK` 不变。
4. 缺省兼容：无 `requiresCommands` 的历史包仍能物化切指针。
5. 发布冒烟：release 资产上传后在隔离 prefix 用真实 CLI 走 `workflow plan --release → workflow execute → bind plan`，断言物化内容（见 `release-artifact-pipeline.md`）。
6. 半绿负例：`SHADOW_DEV_CLI=<坏路径> npm run check:requires:strict` 退出码 1；去掉 `:strict` 同条件退出码 0 且自曝「CLI 目录未参与断言」。

## 关联知识

- [多宿主插件分发契约](multi-host-plugin-distribution.md)
- [Bug 调查保持单一上下文](bug-investigation.md)
- CLI 仓 `shadow-docs/knowledge/install-distribution.md`、`distribution-capability-contract`（断言落点与指针语义）
