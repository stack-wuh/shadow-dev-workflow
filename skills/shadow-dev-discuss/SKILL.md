---
name: shadow-dev-discuss
description: 需求讨论 — 思考模式，只讨论不实现。可读代码、搜索、调研，但不写代码
---
# Discuss — 需求讨论

思考模式，只讨论不实现。可读代码、搜索、调研，但不写代码。

根据用户的讨论方向自动调节深度:
- 偏需求 → 聊 WHY/WHAT、用户场景、边界条件
- 偏架构 → 聊 HOW、模块拆分、技术选型、API 设计、数据模型

**立场:**
- 好奇而非指令式 — 自然提问，不照脚本
- 发散 — 给出多个方向，让用户选择
- 可视化 — 善用 ASCII 图表
- 落地 — 必要时探索实际代码库

**代码探索规则（与 propose 一致）:**
- 先用 Grep/Glob 关键字检索，判断是新功能还是存量修改
- 新功能 → 无需读代码
- 存量修改 → 列出匹配文件清单，AskUserQuestion 确认后再读
- 禁止未经确认批量读取文件

**工具使用:** Read / Grep / Glob / Bash / WebSearch / WebFetch

**输出语言:** 对话用中文，代码块/命令/路径保留英文。

**讨论方向示例:**
- 需求范围: "这个功能解决什么问题？谁会用？"
- 技术选型: "Redis vs 内存缓存，优缺点对比"
- 模块拆分: "评论模块是独立还是复用 content 模块？"
- 接口设计: "GET /v2/repos 返回什么字段？"

**产出 (可选，视讨论结果):**
- 更新 `proposal.md` — 需求范围变更
- 更新 `design.md` — 技术方案确定
- 创建/更新 `specs/` — 需求规格细化

## 讨论结束: 生成实施计划

方案明确后，生成实施计划。**计划必须写入 openspec 变更目录，而非 superpowers 默认路径。**

### 1. 确保 openspec 变更目录存在

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

### 2. 调用 writing-plans 并覆盖输出路径

调用 `Skill("superpowers:writing-plans")`，但**覆盖其默认输出路径**：
- writing-plans 默认写 `docs/superpowers/plans/` → **改写为** `openspec/changes/<name>/tasks.md`
- 在调用时明确告知 writing-plans：「计划输出到 `openspec/changes/<name>/tasks.md`，不要使用默认路径」

### 3. 展示计划

以表格展示任务摘要:

```
| # | 任务 | 模式 | 依赖 | 涉及文件 |
|---|------|------|------|----------|
| 1 | xxx  | 前台 | 无   | xxx.ts  |
| 2 | xxx  | 后台 | 无   | yyy.tsx |
```

AskUserQuestion 让用户确认计划。计划确认后建议 "开始执行"。

**反模式:** 跳过计划直接写代码、任务粒度过大、不标注依赖、计划写入 superpowers 默认路径而非 openspec。
