---
name: shadow-dev-review
description: 质量门禁 — 以不变量观察点对账验证实现、领域模型一致性与方案，并给出最终知识影响。触发词：代码审查、review、验收、verify。
---
# Shadow Dev Review — 质量门禁

只审查本次改动，不扫全仓。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。运行测试、lint 与检查属于收集验证证据，允许直接执行，但结论必须引用真实输出。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-review · 质量门禁`

## 流程

### 1. 自检验证

代码变更运行类型检查、lint 以及与本次不变量相关的 guard 探针与真实命令；Knowledge 治理由 `scripts/check-knowledge.mjs` 执行（字段、source、路由、死链、残留措辞禁项），brief 契约由 `scripts/check-brief.mjs` 执行（领域模型段、`INV-n` 编号与去重、对账闭合、取证策略取值、S/M 级新建套件断言）。**三条放行判据缺一即 blocked**：观察点闭合、guard 探针绿、regression 探针绿（在该仓 CI 实测耗时 ≤ 60s 时适用）。绿是门槛不是证据：无 `INV-n × 观察点` 对账不得声称完成，探针红无归因同判未验证。

### 2. 获取变更上下文

```bash
shadow-dev review plan --name <name>
shadow-dev review execute --name <name> --conclusion <passed|blocked> --knowledge <新增|更新|废弃|无需变更> --target <卡片路径，无需变更时省略> --reason "<确定理由>" --confirm
```

阅读 plan 列出的 brief、引用 Knowledge 和 diff。`--knowledge` 把第 7 项 Knowledge 门禁的最终结论写入 brief，`shadow-dev-release` 直接消费该结论，不再重复评估。

**机械门禁：** `review execute` 会检查 brief 中的任务清单——存在未完成任务时返回 `TASKS_NOT_COMPLETE` 并拒绝写入 `passed`。先通过 `task set` 确认所有任务真实完成，再执行 review。

### 3. 多维检查

1. **任务完成度：** checkbox 与实际任务一致。
2. **方案一致性：** 实现符合 brief 决策。
3. **规范遵循：** 实现符合引用的 active Knowledge；不适用项有明确理由。
4. **正确性：** 边界、类型、错误路径和并发行为正确。
5. **代码质量：** 无无关修改、重复和明显性能问题。
6. **验证完整性：** 相关验证真实运行且结果可查。
7. **Knowledge 门禁：**
   - 卡片中的验证方式仍成立。
   - 本次是否产生新的长期有效事实。
   - 最终结论是新增、更新、废弃或无需变更。
   - 动作必须给出确定目标路径和理由。
   - 知识卡更新须按 `norms/knowledge-cards.md` 补 `verified-depth` 与 `verified-scope`。
8. **验证强度与观察点对账：** 以 `node scripts/check-brief.mjs` 的输出为准逐条核对（S: diff 走查 / M: 被触及不变量各有观察点 / L: 每条 `INV-n` 一个可追溯观察点或证据缺口）。**以「套件全绿」代替观察点即退回**；拿 CI 绿灯链接单独充当 L 级观察点即退回；探针红未归因亦退回；`observation` 策略下新建套件断言文件按越界指出；`assert-first` 策略下 brief 缺「先红」记录（红灯命令与原因）按取证不实指出。
9. **信号写回：** 本次探索中命中或证伪的路径按 `norms/signals.md` 提案信号（创建 / 加分 / 退役），随 review 结论一并输出。
10. **模型一致性：** 按 `norms/domain-model.md` 检查——实现是否引入未登记的公开名词（命令键、字段、卡片标题、术语）；是否破坏了声明过的不变量；改动是否越出本 change 所属限界上下文去改其他上下文的语义（越界即阻塞，要求拆 change）；`shadow-docs/domain.md` 与知识卡 `domain:` 值是否仍然一致。

以下情况阻塞：

- 稳定事实已变化但 brief 仍填“无需变更”。
- 候选卡片缺少 source、scope、verified。
- active 卡片没有 menu 路由。
- 实现违反 active Knowledge 且 brief 未说明有意变更。
- L 级 brief 缺「## 领域模型」段、不变量清单为空、条目缺 `INV-n` 编号、未声明 `取证策略`，或对账未闭合——`scripts/check-brief.mjs` 判红即阻塞（`rules/iron-laws.md` §7）。
- 实际取证与 propose 批准的 `取证策略` 不符（含 S/M 级新建套件断言文件）。
- 不变量既无观察点也未标注证据缺口，却声称完成。
- 引入新的公开名词而未登记（brief 术语增量或上下文地图）。

## 审查报告

```markdown
## 审查: <name>

### 任务完成度: N/M
### 方案一致性: 通过 / 阻塞
### 规范遵循: 通过 / 阻塞
### 正确性: <结果>
### 代码质量: <结果>
### 验证: <命令与结果>
### 观察点对账: i/I（缺观察点且未标注缺口的条目列出）
### 模型一致性: 通过 / 阻塞
### Knowledge 评估
- 结果: 新增 / 更新 / 废弃 / 无需变更
- 目标: <卡片路径或无>
- 理由: <确定理由>
### 结论: 通过 / 建议 / 阻塞
```

阻塞项修复后重新审查，最多两轮。通过后进入 `shadow-dev-release`。

**离场：** 完成时输出：`✅ [离场] shadow-dev-review · 结论: <passed|blocked> · 下一步: shadow-dev-release`
