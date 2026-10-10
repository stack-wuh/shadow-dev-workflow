---
name: shadow-dev-apply
description: 开始执行 — 按 brief 的 Phase 执行任务，加载 active Knowledge 与领域不变量，执行分级验证与依赖调度。触发词：开始执行、apply、实现、写代码。
---
# Shadow Dev Apply — 执行

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。运行项目测试、lint 与诊断脚本属于收集验证证据，允许直接执行，但结论必须引用真实输出。

**CLI 前置（非协商）：** `shadow-dev` 不在 PATH，或返回 `UNKNOWN_COMMAND` / `ARTIFACT_INCOMPATIBLE`，即**响亮阻塞**——报告「已装 CLI 低于产物 `requiresCommands` 所需」，给出升级动作（`bash scripts/install-cli.sh install --version <pin>` 或 `shadow-dev workflow plan` + `execute`）后停止。禁止静默降级到次优命令路径（如「worktree 不可用就改走 branch」），更禁止回退原始 `git`/`gh`。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-apply · 按 brief 执行`

## 流程

### 1. 确认变更和约束

确定 change 名称，读取 brief 引用的 active Knowledge，将其执行约束加入任务上下文。

**L 级另须载入 brief 的「## 领域模型」段**：限界上下文、统一语言增量与不变量清单进入任务上下文，不变量就是本阶段要逐条取证的验收对象（`norms/domain-model.md`、`rules/iron-laws.md` §7）。缺该段或清单为空 → 退回 propose 补齐后再开工，不得边写边补。

若卡片已 deprecated、source 不存在或 scope 与任务不匹配，停止并返回 propose/review 修正引用。

### 2. 检查冲突

```bash
shadow-dev conflict inspect --name <name>
```

同时检查：

- 其他 active change 是否修改相同文件。
- 当前代码事实是否与 active Knowledge 冲突。

代码与 Knowledge 冲突时暂停相关 task，在同一调查上下文中确认代码是有意变更、回归还是卡片过期。不得为配合实现静默改写 Knowledge。

### 3. 创建功能分支（L 级先评估并行 workspace）

```bash
shadow-dev repo inspect
shadow-dev worktree inspect --name <name>   # 能力以产物 requiresCommands 声明为准
shadow-dev branch plan --name <name>
shadow-dev branch execute --name <name> --confirm
```

`worktree inspect` 的 `recommendation` 决定路径（该域不可用即按「CLI 前置」阻塞，不得改走 branch 蒙混）：**create**（L 级且无自己的 workspace）→ `worktree plan --name <name> --path <dir>` + `worktree execute --name <name> --path <dir> --confirm` 建独立 workspace（替代 branch 流程，回写 `branch` 与 `workflow.worktree`），此后本变更全部命令在 `cd <dir>` 内执行；**reuse** → 直接 `cd` 到 `workflow.worktree` 记录的目录继续；**inline**（S/M 级）→ 照常 branch 切分支。分支类型使用 feat、fix、refactor、docs 或 chore。

### 4. 分析依赖

按 brief Phase 和 task 构建执行表。

若项目存在 `shadow-docs/signals.md`：按任务域与 scope 匹配信号设定探索优先级——正信号排前，weight ≥ 4 且深度为 runtime 的负信号视为已排除路径；扇宽按 brief 复杂度评级（S 直走 / M 排序 / L 先张满扇形只剪已证死路）。探索中命中或证伪信号时记录，供 review 写回。Bug 调查保持主代理或一个持续上下文，不把关联代码拆给多个子代理。只有无共享状态、不会影响根因判断的任务才并行。

### 5. 验证门禁

按 brief 复杂度评级执行验证（`norms/verification.md` 分级制）。验收对象是不变量，不是测试条数：

1. **L**：brief「## 领域模型」段的**每条不变量一个可追溯观察点**——真实命令 + 真实输出，必须覆盖拒绝路径与状态不变量（指针不动、无半成品残留、旧路径不可回退）；本机取不到证据时写明证据缺口与替代观察点（CI run 链接）。
2. **M**：冒烟命令 + 本次触及的既有不变量保持成立 + 既有测试保持绿 + 走查；默认不新建测试文件，触及既有契约时更新既有断言。
3. **S**：不创建测试文件，执行结构、引用、路由和残留扫描。

不为「凑证据」新建测试：确需长期钉住某条不变量才写，并在 brief 写明这条测试钉的是哪条（`rules/behavior.md` §2 反过度设计；S 级写测试同样 review 阻塞）。既有测试文件必须照常运行并通过——取消 TDD 不等于取消跑测试。

**进度报告（非协商，`norms/verification.md`「进度可见性」）：** 开工前报数——测试总数 N（逐项列名）与任务总数 M；L 级另报不变量总数 I。此后每完成一个单元立即输出一行进度线：检查项 `▶ [verify] n/N <检查项> pass|fail`、不变量 `▶ [inv] i/I <不变量> observed|pending`、任务 `▶ [task] m/M <task-id> done`。单步挂起（进程空转、外部命令超时、同一失败重复）先输出 `⏸ [verify|inv|task] <名称> 卡住：<现象与排查方向>` 再处理——用户靠进度线判断是否卡死，静默长跑视为违规。收口汇总行 `✅ N/N 全绿 · I/I 不变量有观察点`，数目与开工报数一致。

### 6. 按 Phase 执行

- 无依赖且无共享调查上下文的 task 可并行。
- 有依赖、单 task 或同一 Bug 调查由主代理串行执行。
- 只修改 brief 声明的文件。
- Knowledge 最终写入发生在 ship；apply 只记录发现的知识影响。

### 7. 更新进度

```bash
shadow-dev task set --name <name> --task <task-id> --state done --confirm
```

每个 task 完成后更新，禁止直接改 brief 的受管状态。`task-id` 的格式固定为 `task-N`（N 为正文任务清单中复选框的 1-based 序号），先用 `shadow-dev task list --name <name>` 确认。

apply 完成后输出离场日志并进入 `shadow-dev-review`。

**离场：** 完成时输出：`✅ [离场] shadow-dev-apply · task N/N 完成 · 下一步: shadow-dev-review`
