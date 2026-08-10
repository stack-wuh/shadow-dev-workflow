---
name: shadow-dev-propose
description: 新需求对齐 + 方案设计 — 从模糊需求到可执行 brief。触发词：新需求、提案、设计一下、讨论方案。
---
# Shadow Dev Propose — 需求对齐与方案设计

必须先聊清需求，再做方案设计。

## 流程

### 1. 查询 active Knowledge

调用 `shadow-dev-knowledge`：从通用和项目 menu 路由，只读取任务域、关键词和 scope 命中的 active 卡片。

结果进入方案输入。若 source 缺失、无菜单路由、scope 不明确或卡片冲突，先阻塞并处理，不把不可靠内容当作规范。

### 2. 澄清需求

- 每轮只问一个问题。
- 明确目的、边界、成功标准和非目标。
- 存量修改先检索，列出文件清单让用户确认后再读。
- 需求清晰后才进入方案讨论。

### 3. 比较方案

提出 2–3 个方案，分别说明做法、优势和代价；给出推荐及关键权衡。每个方案说明如何遵循或不适用已命中的 Knowledge。

### 4. 收敛为 brief

用户确认方案后，生成正文，再通过 deterministic CLI 创建并批准变更：

```bash
node scripts/shadow-dev.mjs change create --name <name> --type <feature|fix|build|chore|docs|refactor|style|test> --scope <scope> --base-branch <branch> --files <逗号分隔路径> --body-file <正文文件> --confirm
node scripts/shadow-dev.mjs change approve --name <name> --confirm
```

正文结构：

```markdown
# <变更标题>

## 动机
<为什么现在做>

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
- 验证: —

## 知识评估
- **预期影响:** 新增 / 更新 / 废弃 / 无需变更
- **候选卡片:** <路径或无>
- **理由:** <为什么>
```

propose 只做知识影响预评估，不创建或改写 Knowledge。发现代码事实与 active Knowledge 已知冲突时，在 brief 中记录待确认点。

**命名：** `YYYYMMDD-{type}-{kebab-slug}`。type 对应 GitHub issue label，可选值：`feature`、`fix`、`build`、`chore`、`docs`、`refactor`、`style`、`test`。每个 task 控制在 30 分钟内；有依赖的分 Phase。

### 5. 展示结果

展示动机、决策、任务阶段和知识影响预评估，提示下一步使用 `shadow-dev-apply`。

GitHub Issue 必须先 plan、确认后 execute，禁止原始 `gh` 写命令。issue labels 从 change type 映射：feature→`feature`、fix→`fix`、build→`build`、chore→`chore`、docs→`docs`、refactor→`refactor`、style→`style`、test→`test`。

```bash
node scripts/shadow-dev.mjs issue plan --name <name> --labels <type>
node scripts/shadow-dev.mjs issue execute --name <name> --plan-hash <hash> --confirm
```

---

✅ **propose 完成** — 下一步: "开始执行" (shadow-dev-apply)
