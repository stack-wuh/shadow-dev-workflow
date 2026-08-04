---
name: shadow-dev-review
description: 质量门禁 — 验证 + 对照方案论据检查 + 结论分级。触发词：代码审查、review、验收、verify。
---
# Shadow Dev Review — 质量门禁

apply 完成后的质量检查。只审查本次改动，不扫全仓。

## 流程

### 1. 自检验证

**铁律: 无验证输出不得声称完成。**

```bash
pnpm exec tsc --noEmit 2>&1   # 类型检查
pnpm exec eslint <改动的文件> --format stylish 2>&1  # ESLint
# 运行相关测试（如有）
```

不通过 ➡️ 回去修。修完重新自检。

### 2. 获取变更上下文

```
1. `node scripts/shadow-dev.mjs review plan --name <name>` 获取 brief、任务和改动范围
2. 阅读理解计划列出的 diff 内容
3. 验证后执行 `node scripts/shadow-dev.mjs review execute --name <name> --plan-hash <hash> --conclusion <passed|blocked> --confirm`
```

### 3. 对照检查（6 维）

**维度 1 — 任务完成度：**
- brief.md 所有 checkbox 是否 `[x]`
- 有没有遗漏的任务

**维度 2 — 方案一致性：**
- 代码实现是否匹配 brief.md 的「决策」部分
- 有没有偏离选定的方案

**维度 3 — 规范遵循：**
- 对照 brief.md 的「引用规范」，检查代码是否遵循了每条约束
- 不遵循的约束是否在决策中说明了理由

**维度 4 — 正确性：**
- 边界条件处理（空值、异常路径、并发冲突）
- 类型安全（无无理由 `as`、无 `any`）
- 错误处理不吞异常

**维度 5 — 代码质量：**
- 重复代码、过长函数（>50 行需说明理由）
- 无明显性能问题（N+1 查询、缺失分页）
- 变更范围未超出 brief.md 声明

**维度 6 — 知识贡献：**
- 本次变更是否有值得沉淀到 `shadow-docs/knowledge/` 的领域知识
- 如有，记录到审查报告中

### 4. 审查报告

```
## 审查: <name>

### 任务完成度: N/M ✓

### 方案一致性 ✓

### 规范遵循 ✓

### 正确性
- ⚠ file.ts:42 — xxx 边界未处理

### 代码质量 ✓

### 知识贡献
- 建议新增: knowledge/xxx.md — <为什么值得沉淀>

### 审查结论: ⚠ 建议

建议项（用户决定）:
1. file.ts:42 — xxx 边界处理
```

### 5. 结论分级

| 结果 | 含义 | 动作 |
|------|------|------|
| ✓ 通过 | 无问题 | → "发布" (shadow-dev-ship) |
| ⚠ 建议 | 有建议无阻塞 | 用户决定: 修复后发布 / 直接发布 |
| ✗ 阻塞 | 有必须修复的问题 | → 回到 apply 修复阻塞项 → 重新审查 |

**✗ 阻塞回环**: 修复 → 重新审查 → 最多 2 轮。

---

✅ **review 完成** — 下一步: "发布" (shadow-dev-ship)
