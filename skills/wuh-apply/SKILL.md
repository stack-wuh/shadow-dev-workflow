---
name: wuh-apply
description: 开始执行 — 按 brief.md 的 Phase 顺序执行任务，TDD 门禁 + 并行 Agent 调度。触发词：开始执行、apply、实现、写代码。
---
# ⚡ Wuh Apply — 代码执行

按 brief.md 的 Phase 顺序执行任务。代码修改前先建分支，每个 task 走 TDD。

## 流程

### 1. 确认变更

有名称直接用；否则 `ls shadow-docs/changes/` 让用户选。
提示: "将执行变更: <name>"

### 2. 检查多需求冲突

读取 `shadow-docs/INDEX.md`（如存在），检查是否有其他活跃变更与本次改动存在文件重叠：

- 同一文件被多个活跃变更修改 → 提示用户，确认顺序
- 当前变更依赖另一未完成的变更 → 等那个完成再继续

### 3. 创建功能分支

```bash
git branch --show-current
```

如不在功能分支 ➡️ 创建:

```bash
git checkout main
git pull origin main
git checkout -b <type>-<short-description>
```

分支命名: `<type>-<描述>`，type 取值 feat/fix/refactor/docs/chore。

### 4. 分析任务依赖

读 brief.md 的任务部分，构建执行计划：

```
## 执行计划: <name>

| Phase | Task | 预估 | 可并行 |
|-------|------|------|--------|
| 1 | task 1 | 10min | ✓ |
| 1 | task 2 | 15min | ✓ |
| 2 | task 3 | 20min | - (依赖 task 1,2) |

总预估: 45min
```

### 5. TDD 门禁

以下情况强制执行 TDD：新功能、Bug 修复、复杂重构。

```
1. 写失败测试 → 确认失败
2. 写最小实现 → 确认通过
3. 重构保持绿色
```

**铁律**: 没有失败测试记录就开始写实现的，视为未开始。

### 6. 按 Phase 执行

- **同一 Phase 无依赖的 tasks** → 并行 Agent 执行
- **有依赖或单 task** → 主 Agent 串行执行
- 每个 Agent 只给该 task 需要的上下文，不给整个会话历史

**反模式**: 能并行却串行执行；改 A 顺手修 B。

### 7. 进度追踪

每个 task 完成后更新 brief.md checkbox: `[ ]` → `[x]`。

---

✅ **apply 完成** — 下一步: "审查" (wuh-review)
