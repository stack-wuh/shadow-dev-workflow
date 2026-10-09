---
name: shadow-dev-hotfix
description: 紧急修复快车道 — 线上/阻塞问题的最小修复直达 PR。省掉知识路由、方案比较、issue 与人工多维审查，只保留复现确认、两段式确认与 PR 合入。触发词：hotfix、线上急修、紧急修复、快修、快速上线。
---
# Shadow Dev Hotfix — 紧急修复快车道

只用于线上故障或阻塞级问题。省时间不省安全：复现确认、planHash 两段式确认、PR 合入三个铁门禁一个不减。复现确认的手段按复杂度分级（`norms/tdd-verification.md`），不是一律写测试。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。运行测试与检查属于收集验证证据，允许直接执行，但结论必须引用真实输出。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-hotfix · 紧急修复快车道`

## 准入判定

三条同时满足才走本通道，否则退回 `shadow-dev-propose`（不是所有急都叫 hotfix）：

1. 线上故障或阻塞级 Bug，正常流程时延不可接受；
2. 修复面小：预期 ≤5 个文件，单个修复任务 30 分钟内可完成；
3. 有一句话根因假设（没有就先用 propose 的调查流程，快不代替根因）。

## 流程

### 1. 单轮对齐

一轮问清四件事，各一句话：**现象、影响面、根因假设、验证方式**。不查知识库菜单、不做多方案比较——方案恒为「最小修复」。用户答不清任一项就退回 propose。

### 2. mini-brief + 分支

```bash
shadow-dev change create --name <YYYYMMDD-fix-slug> --type fix --scope <scope> --base-branch main --files <预期路径> --body-file <mini 正文> --confirm
shadow-dev change approve --name <name> --confirm
shadow-dev branch plan --name <name>
shadow-dev branch execute --name <name> --confirm
```

mini 正文结构（复杂度评级按 norm 三要素判定——文案/配置/展示层默认 S（期望验证深度 code-read/field）、触及行为局部 M、命中契约/共享路径/宿主核心 L；无 issue，PR 即追踪载体）：

```markdown
# <一句话标题>

## 现象与影响
<现象、影响面、发现渠道>

## 复杂度评级
- **评级:** <S/M/L，按 norm 三要素>
- **理由:** <一句话>
- **期望验证深度:** <code-read|field|unit|runtime>

## 根因与修复
<根因一句话假设，现场验证可修正；最小修复方案>

## 引用规范
- knowledge/bug-investigation.md
  - 当前结论: 复现→追踪→根因→最小修复→回归由单一上下文完成
  - 适用 scope: cross-project

## 任务
### Phase 1
- [ ] 复现锁定 Bug — `test/<文件>` 或复现步骤记录 — L 用复现测试锁定（能稳定复现即可，2026-10-09 裁决后不强制先红仪式）；S/M 以可重复手段复现（观察/查询/手动步骤）
- [ ] 修复并回归 — `<目标文件>` — 最小修复；按评级强度回归验证（L 复现测试转绿并留观察点，S/M 复现手段复验）

## 结果
- 实际耗时: —
- 验证: —

## 知识评估
- **预期影响:** 无需变更（仅当修复揭示长期事实才升级为新增/更新）
- **候选卡片:** 无
- **理由:** 一次性修复过程不入 Knowledge
```

### 3. 修复（复现确认铁律，强度按分级）

**复现确认非协商**：修复前必须以可重复手段复现问题、确认根因不失准——**L** 级写自动化复现测试先红后绿；**M** 级绿灯测试回归；**S** 级（文案/配置/展示层）以人工复现步骤或观察记录复现并复验，**不强制创建测试文件**（`norms/tdd-verification.md` 分级制）。同一个 Bug 的复现、根因确认、修复、回归在同一上下文完成（`knowledge/bug-investigation.md`）。快车道不豁免进度可见性：开工报数（任务 M 项，有测试则另报测试 N 项）、逐完成一行 `▶ [TDD|task] …`、卡点先报 `⏸`（`norms/tdd-verification.md`「进度可见性」）。只修改 brief 声明的文件；发现波及面超出准入判定时停下，退回 propose 重新立项。

### 4. 收尾门禁（压缩串行）

```bash
shadow-dev task set --name <name> --task task-1 --state done --confirm   # 逐项真实勾选
shadow-dev review execute --name <name> --conclusion passed --knowledge 无需变更 --reason "<一句话理由>" --confirm
```

人工多维审查压缩为：只看本次 diff 与验证输出。机械门禁不减——任务未全勾 `review execute` 返回 `TASKS_NOT_COMPLETE`。

### 5. 发布

```bash
shadow-dev release plan --name <name> --files <逗号分隔路径> --message "fix: <一句话>" --title "<PR 标题>"
```

用户确认执行方案时若已一并授权发布（如「全程自动到 PR」），`release execute` 不再二次询问；否则按惯例向用户提问确认（宿主有结构化提问能力就用，没有就直接文字询问）：

```bash
shadow-dev release execute --name <name> --confirm
```

复合命令一次完成 commit → push → PR（直达 main，幂等可断点续跑）。无 issue：归档在 PR merged 后手动执行 `shadow-dev-archive`，或事后补 issue 交由 Actions 触发。

## 不可省清单

- 复现确认先于修复（`norms/tdd-verification.md` 分级制：L 复现测试先红后绿，S/M 人工复现复验；验证强度与评级匹配非协商）
- 全部写操作 plan/execute 两段式 + `--confirm`
- 显式文件清单，禁止 `git add .`
- main 只接受 PR 合入

## 省掉清单

- 知识库 menu 路由查询（仅内嵌引用 bug-investigation 一张卡）
- 多轮需求澄清与多方案比较（单轮、单方案）
- GitHub issue（PR 即载体）
- 人工九维审查（机械门禁 + diff/验证输出核对替代）
- 信号提案（除非修复命中 `norms/signals.md` 的明确信号）

**离场：** 完成时输出：`✅ [离场] shadow-dev-hotfix · PR: <url> · 下一步: shadow-dev-archive（PR merged 后）`
