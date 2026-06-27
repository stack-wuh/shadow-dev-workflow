---
name: shadow-dev-discuss
description: 技术方案设计 — 思考模式，只讨论不实现。可读代码、搜索、调研，但不写代码
---
# 💬 Discuss — 技术方案设计

承接 propose 的需求制品，完成技术方案设计。只讨论不写代码。

**前置条件:** propose 已完成需求对齐，`proposal.md` + `specs/` 已就绪。

## 📋 讨论流程

### 📖 [1/5] 读取需求制品

读取 propose 产出的需求制品，确认理解无误：

- `proposal.md` — 动机、变更范围、非目标
- `specs/<domain>/spec.md` — GIVEN/WHEN/THEN 需求规格

如 propose 阶段跳过了某些制品（如 specs 未细化），先补全再进入技术讨论。

⏭️ 下一步: [2/5] 技术方案讨论

### 🏗️ [2/5] 技术方案讨论

围绕 HOW 展开，给出 2-3 个方案并标注推荐：

- **架构:** 模块归属、依赖关系、新增/复用决策
- **接口设计:** API 路径、请求/响应格式、错误码
- **数据模型:** 表结构/Schema、索引、迁移策略
- **技术选型:** 库/工具选择、取舍理由
- **边界与异常:** 异常路径、降级策略、并发冲突

**立场：**
- 好奇而非指令式 — 自然提问，不照脚本
- 发散 — 给出多个方向，让用户选择
- 可视化 — 善用 ASCII 图表
- 落地 — 必要时探索实际代码库

**反模式:** 用户说"知道了"就结束、没追问边界条件就下结论。

⏭️ 下一步: [3/5] 代码探索

### 🔍 [3/5] 代码探索

确认技术方向后，探索现有代码以验证方案可行性。

**代码探索规则：**
- 先用 Grep/Glob 关键字检索，判断是新功能还是存量修改
- 新功能 ➡️ 不需读代码，只查 openspec INDEX 确认规范不冲突
- 存量修改 ➡️ 列出匹配文件清单，AskUserQuestion 确认后再读
- 禁止未经确认批量读取文件

**工具使用:** Read / Grep / Glob / Bash / WebSearch / WebFetch

**输出语言:** 对话用中文，代码块/命令/路径保留英文。

⏭️ 下一步: [4/5] 收敛为设计

### 📐 [4/5] 收敛为设计

将讨论结论写入 design.md：

- **技术方案:** 选定的架构、模块划分、关键决策及理由
- **数据模型:** Schema 变更、迁移计划
- **接口设计:** API contract（路径、参数、响应）
- **影响分析:** 修改范围、风险点、回滚策略

⏭️ 下一步: [5/5] 生成实施计划

### 📝 [5/5] 生成实施计划

design.md 确认后，生成实施计划。**计划必须写入 openspec 变更目录，而非 superpowers 默认路径。**

**5a. 确保 openspec 变更目录存在**

若 `openspec/changes/<name>/` 尚不存在（跳过了 propose 直接 discuss），先创建：

```bash
mkdir -p openspec/changes/<name>/specs/<domain>
```

并写入最小 `.openspec.yaml`：

```yaml
project: <项目名>
change: <change-name>
date: yyyy-MM-dd
type: P|B
status: proposed
```

**5b. 调用 writing-plans 并覆盖输出路径**

调用 `Skill("superpowers:writing-plans")`，但**覆盖其默认输出路径**：
- writing-plans 默认写 `docs/superpowers/plans/` ➡️ **改写为** `openspec/changes/<name>/tasks.md`
- 在调用时明确告知 writing-plans：「计划输出到 `openspec/changes/<name>/tasks.md`，不要使用默认路径」

**5c. 展示计划**

以表格展示任务摘要：

```
| # | 任务 | 模式 | 依赖 | 涉及文件 |
|---|------|------|------|----------|
| 1 | xxx  | 前台 | 无   | xxx.ts  |
| 2 | xxx  | 后台 | 无   | yyy.tsx |
```

AskUserQuestion 让用户确认计划。计划确认后建议 "开始执行"。

**反模式:** 跳过计划直接写代码、任务粒度过大、不标注依赖、计划写入 superpowers 默认路径而非 openspec。

---

✅ **discuss 完成** — 下一步: "开始执行" (`shadow-dev-apply`)
