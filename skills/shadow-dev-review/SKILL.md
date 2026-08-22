---
name: shadow-dev-review
description: 质量门禁 — 验证实现、方案与 active Knowledge，并给出最终知识影响。触发词：代码审查、review、验收、verify。
---
# Shadow Dev Review — 质量门禁

只审查本次改动，不扫全仓。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-review · 质量门禁`

## 流程

### 1. 自检验证

代码变更运行类型检查、lint 和相关测试；Knowledge 治理运行字段、source、路由、死链接和残留扫描。无验证输出不得声称完成。

### 2. 获取变更上下文

```bash
shadow-dev review plan --name <name>
shadow-dev review execute --name <name> --plan-hash <hash> --conclusion <passed|blocked> --confirm
```

阅读 plan 列出的 brief、引用 Knowledge 和 diff。

### 3. 七维检查

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

以下情况阻塞：

- 稳定事实已变化但 brief 仍填“无需变更”。
- 候选卡片缺少 source、scope、verified。
- active 卡片没有 menu 路由。
- 实现违反 active Knowledge 且 brief 未说明有意变更。

## 审查报告

```markdown
## 审查: <name>

### 任务完成度: N/M
### 方案一致性: 通过 / 阻塞
### 规范遵循: 通过 / 阻塞
### 正确性: <结果>
### 代码质量: <结果>
### 验证: <命令与结果>
### Knowledge 评估
- 结果: 新增 / 更新 / 废弃 / 无需变更
- 目标: <卡片路径或无>
- 理由: <确定理由>
### 结论: 通过 / 建议 / 阻塞
```

阻塞项修复后重新审查，最多两轮。通过后进入 `shadow-dev-release`。

**离场：** 完成时输出：`✅ [离场] shadow-dev-review · 结论: <passed|blocked> · 下一步: shadow-dev-release`
