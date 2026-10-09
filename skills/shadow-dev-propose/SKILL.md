---
name: shadow-dev-propose
description: 新需求对齐 + 领域建模 + 方案设计 — 从模糊需求到可执行 brief。触发词：新需求、提案、设计一下、讨论方案。
---
# Shadow Dev Propose — 需求对齐与方案设计

必须先聊清需求，再做方案设计。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-propose · 需求对齐与方案设计`

## 流程

### 1. 查询 active Knowledge

调用 `shadow-dev-knowledge`：从通用和项目 menu 路由，只读取任务域、关键词和 scope 命中的 active 卡片。

结果进入方案输入。若 source 缺失、无菜单路由、scope 不明确或卡片冲突，先阻塞并处理，不把不可靠内容当作规范。

项目存在 `shadow-docs/domain.md` 时一并读取上下文地图，确定任务所属限界上下文与上下游；没有该文件且项目明显含多个上下文时，把「建上下文地图」作为独立变更提示用户，不在本 change 顺手补。

### 2. 澄清需求

- 每轮只问一个问题。
- 明确目的、边界、成功标准和非目标。
- 存量修改先检索，列出文件清单让用户确认后再读。
- 需求清晰后才进入方案讨论。

### 3. 领域对齐

按 `norms/domain-model.md` 回答四个问题，答案写进 brief 的「## 领域模型」段：

1. 本变更属于哪个**限界上下文**？是否同时踩进第二个上下文（是 → 建议拆 change）。
2. **统一语言**有无增量？新出现的公开名词（命令键、字段、卡片标题）在该上下文内的唯一含义是什么。
3. 哪个**聚合**的哪条**不变量**被这次改动威胁？它现在靠什么观察点守住。
4. 是否要求别的上下文跟着变？那是**跨上下文依赖**，写进 brief 的前置/后继，不顺手改。

必填按评级：**L** 四项齐全且不变量清单非空（`rules/iron-laws.md` §7：缺段或清单为空即视为未开始）；**M** 至少一行归属上下文 + 被触及的既有不变量；**S** 免填。

### 4. 比较方案

提出 2–3 个方案，分别说明做法、优势和代价；给出推荐及关键权衡。每个方案说明如何遵循或不适用已命中的 Knowledge。

### 5. 收敛为 brief

用户确认方案后，生成正文，再通过 deterministic CLI 创建并批准变更（`--body-file` 指向的临时正文文件是 AI 唯一需要准备的输入，其余一律由 CLI 落盘）：

```bash
shadow-dev change create --name <name> --type <feature|fix|build|chore|docs|refactor|style|test> --scope <scope> --base-branch <branch> --files <逗号分隔路径> --body-file <正文文件> --confirm
shadow-dev change approve --name <name> --confirm
```

正文结构：

```markdown
# <变更标题>

## 动机
<为什么现在做>

## 复杂度评级
- **评级:** S / M / L（按 norms/verification.md 三要素：契约变更 / 触及面 / 可发现性）
- **理由:** <对照三要素的具体判断>
- **期望验证深度:** code-read | unit | runtime | field

## 领域模型

- **限界上下文:** <名称> — <一句话职责>。上游/下游 <关系>；反腐边界 <本上下文不做什么>。
- **统一语言增量:** <新术语及其唯一含义>（无则写「无」）
- **聚合与不变量:**
  - `<聚合根>`：<必须成立的断言>；<必须成立的断言>
- **领域事件:** <状态改变时刻及其流程后果>

## 引用规范
- <卡片路径>
  - 当前结论: <结论>
  - 适用 scope: <scope>

## 决策
- **选型:** <方案>
- **对比方案:** <未选方案和原因>
- **理由:** <关键权衡和规范遵循>

## 任务
### Phase 1
- [ ] task 1 — `文件路径` — <动作>

## 结果
- 实际耗时: —
- 验证: —（L 级逐条对账：每条不变量 → 观察点命令与输出摘要，或标注证据缺口与替代观察点）

## 知识评估
- **预期影响:** 新增 / 更新 / 废弃 / 无需变更
- **候选卡片:** <路径或无>
- **理由:** <为什么>
```

propose 只做知识影响预评估，不创建或改写 Knowledge。发现代码事实与 active Knowledge 已知冲突时，在 brief 中记录待确认点。

**命名：** `YYYYMMDD-{type}-{kebab-slug}`。type 对应 GitHub issue label，可选值：`feature`、`fix`、`build`、`chore`、`docs`、`refactor`、`style`、`test`。每个 task 控制在 30 分钟内；有依赖的分 Phase。

### 6. 展示结果

展示动机、复杂度评级（含理由与期望验证深度）、领域模型（含不变量清单）、决策、任务阶段和知识影响预评估，提示下一步使用 `shadow-dev-apply`。评级随 propose 确认一并由用户批准；知识评估引用卡片更新时须写明 `verified-depth`。评级为 **L** 时同步提示并行选项：与其他变更并行或需要独立工作区时，apply 阶段用 `shadow-dev worktree plan/execute` 创建专属 workspace，避免共享 checkout 的分支腾挪。**注意执行顺序**：worktree 从基线派生新工作树，此时尚未提交的 brief 不在其中（会 `BRIEF_NOT_FOUND`），因此新立项变更要先在共享 checkout 建分支并提交 brief，或本轮走 inline 分支并在 brief「决策」中写明隔离手段（例如中途不执行 `bind execute`）。所需能力由产物 `package.json.requiresCommands` 声明、CLI 在物化前断言；能力缺失时 apply 响亮阻塞，不静默降级。

GitHub Issue 必须先 plan、确认后 execute，禁止原始 `gh` 写命令。plan 把标题、正文、labels 和 planHash 持久化到 brief，execute 只需 `--name --confirm`。仓库自动从 `origin` remote 推导（`github.com[:/]owner/repo`），非 GitHub remote 或多仓库场景用 `change create --repository <owner/repo>` 显式指定。issue labels 从 change type 映射：feature→`feature`、fix→`fix`、build→`build`、chore→`chore`、docs→`docs`、refactor→`refactor`、style→`style`、test→`test`。

```bash
shadow-dev issue plan --name <name> --title "<issue 标题>" --body "<简述，指向 brief>" --labels <type>
shadow-dev issue execute --name <name> --confirm
```

---

**离场：** 完成时输出：`✅ [离场] shadow-dev-propose · 下一步: shadow-dev-apply`
