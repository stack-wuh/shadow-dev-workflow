---
name: shadow-dev-apply
description: 开始执行 — 按 brief 的 Phase 执行任务，加载 active Knowledge，执行 TDD 与依赖调度。触发词：开始执行、apply、实现、写代码。
---
# Shadow Dev Apply — 执行

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-apply · 按 brief 执行`

## 流程

### 1. 确认变更和约束

确定 change 名称，读取 brief 引用的 active Knowledge，将其执行约束加入任务上下文。

若卡片已 deprecated、source 不存在或 scope 与任务不匹配，停止并返回 propose/review 修正引用。

### 2. 检查冲突

```bash
node scripts/shadow-dev.mjs conflict inspect --name <name>
```

同时检查：

- 其他 active change 是否修改相同文件。
- 当前代码事实是否与 active Knowledge 冲突。

代码与 Knowledge 冲突时暂停相关 task，在同一调查上下文中确认代码是有意变更、回归还是卡片过期。不得为配合实现静默改写 Knowledge。

### 3. 创建功能分支

```bash
node scripts/shadow-dev.mjs repo inspect
node scripts/shadow-dev.mjs branch plan --name <name>
node scripts/shadow-dev.mjs branch execute --name <name> --plan-hash <hash> --confirm
```

分支类型使用 feat、fix、refactor、docs 或 chore。

### 4. 分析依赖

按 brief Phase 和 task 构建执行表。Bug 调查保持主代理或一个持续上下文，不把关联代码拆给多个子代理。只有无共享状态、不会影响根因判断的任务才并行。

### 5. 验证门禁

新功能、Bug 修复和复杂重构执行 TDD：

1. 写失败测试并确认失败。
2. 写最小实现并确认通过。
3. 重构保持绿色。

纯文档和 Knowledge 治理不创建测试文件，执行结构、引用、路由和残留扫描。

### 6. 按 Phase 执行

- 无依赖且无共享调查上下文的 task 可并行。
- 有依赖、单 task 或同一 Bug 调查由主代理串行执行。
- 只修改 brief 声明的文件。
- Knowledge 最终写入发生在 ship；apply 只记录发现的知识影响。

### 7. 更新进度

```bash
node scripts/shadow-dev.mjs task set --name <name> --task <task-id> --state done --confirm
```

每个 task 完成后更新，禁止直接改 brief 的受管状态。

apply 完成后输出离场日志并进入 `shadow-dev-review`。

**离场：** 完成时输出：`✅ [离场] shadow-dev-apply · task N/N 完成 · 下一步: shadow-dev-review`
