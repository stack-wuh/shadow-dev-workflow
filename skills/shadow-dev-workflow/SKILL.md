---
name: shadow-dev-workflow
description: >
  Shadow 的开发工作流统一入口 (6 环节): 新需求➡️需求讨论➡️开始执行➡️代码审查➡️文档归档➡️代码提交。
  整合 Superpowers 技能: propose 嵌 brainstorming, discuss 嵌 writing-plans, apply 嵌 worktree+TDD+subagent,
  review 嵌 verification+code-review+simplify, archive 纯文档管理, commit 嵌 finishing-branch。
  失败回环: 审查 ✗ ➡️ 回到执行修复。
  触发词: 提案 (优先级最高 ➡️ discuss); 新需求/propose; 需求讨论/explore/design; 开始执行/apply; 代码审查/review/verify; 归档/archive; 提交/commit/PR。
  所有输出使用中文，关键字(tasks/proposal/specs/design)保留英文。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: shadow
  version: "5.0"
---
# 🔄 Shadow OpenSpec Superpowers 工作流

统一入口，按用户意图路由到各子流程。所有文档输出使用中文，结构化关键字保留英文。

**⚡ 优先级路由:** 用户说出"提案"时，跳过所有其他意图匹配，直接路由到 [2/6] 需求讨论 (`shadow-dev-discuss`)。

变更命名: `YYYY-MM-DD-{kebab-case}`，如 `2026-05-01-add-comment-api`。

---

## 🔀 流程状态机

```
                ┌── ff（快进: propose + 制品一键生成）──┐
                │                                         │
                ⬇️                                         ⬇️
propose ──➡️ discuss ──➡️ apply ──➡️ review ──➡️ archive ──➡️ commit
 新建需求     需求讨论     开始执行    代码审查   文档归档   提交/PR
                           ⬆️            │
                           │   ✓ 通过   │
                           │            │
                           └── ✗ 阻塞 ──┘  (失败回环: 修复后重新审查)
```

**状态转换规则：**

- **propose** ➡️ **discuss**: 制品创建完成，进入需求讨论细化方案
- **propose** ➡️ **ff**: 简单变更，跳过讨论直接生成全部制品
- **discuss** ➡️ **apply**: 方案明确，开始执行
- **apply** ➡️ **review**: 所有 task 完成，进入代码审查
- **review ✓** ➡️ **archive**: 审查通过，归档 openspec 文档
- **review ✗** ➡️ **apply**: 有阻塞项，回到执行修复（修复后再次 review）
- **review ⚠** ➡️ 用户决定: 修复后归档 / 直接归档
- **archive ✓** ➡️ **commit**: openspec 文档已归档，进入代码提交/PR

---

## 📋 6 环节总览

### 💡 [1/6] 新需求

**意图关键词:** 新需求、新增需求、创建需求、propose、快进、fast-forward、ff、快速生成、从 Issue 开始、GitHub Issue

**典型提示词:**
- "新需求：xxx"、"创建一个需求"、"帮我提个需求"
- "从 Issue #42 开始"、"ff 快进生成"
- "帮我设计一个 xxx 功能"

**路由:** `Skill("shadow-dev-propose")`
**描述:** 创建新需求，支持 full 模式（brainstorming + 完整 openspec 制品）和 ff 模式（快进一键生成）

⏭️ 下一步: [2/6] 需求讨论（full 模式）/ [3/6] 开始执行（ff 模式）

### 🎨 [2/6] 需求讨论 ⚡ 优先级最高

**意图关键词:** 提案 (最高优先级)、需求讨论、讨论一下、架构设计、技术方案、怎么设计、怎么实现、explore、design

**典型提示词:**
- "提案：xxx"、"讨论一下这个方案"、"帮我设计架构"
- "这个需求怎么实现比较好？"、"explore 一下"
- "技术选型讨论"

**路由:** `Skill("shadow-dev-discuss")`
**描述:** 思考模式，只讨论不实现。可读代码、搜索、调研，但不写代码

⏭️ 下一步: [3/6] 开始执行

### 🚀 [3/6] 开始执行

**意图关键词:** 开始执行、开始前端、开始后端、执行任务、apply、实现、写代码

**典型提示词:**
- "开始执行"、"执行 tasks.md"、"apply"
- "开始前端开发"、"实现这个功能"

**路由:** `Skill("shadow-dev-apply")`
**描述:** 按 tasks.md 执行代码实现，含分支创建、预估、TDD 门禁、并行 Agent 调度

⏭️ 下一步: [4/6] 代码审查

### 🔍 [4/6] 代码审查

**意图关键词:** 代码审查、review、验收、verify、审查代码、检查、code review

**典型提示词:**
- "代码审查"、"review 一下"、"审查代码"
- "验收这个需求"、"verify"
- "检查一下代码质量"

**路由:** `Skill("shadow-dev-review")`
**描述:** apply 完成后的质量门禁，合并代码审查、需求验收和代码质量检查

⏭️ 下一步: ✓ 通过 ➡️ [5/6] 归档 / ✗ 阻塞 ➡️ [3/6] 修复

### 📦 [5/6] 文档归档

**意图关键词:** 归档、需求完成、archive、合并文档

**典型提示词:**
- "归档"、"需求完成了，归档"、"archive"

**路由:** `Skill("shadow-dev-archive")`
**描述:** 将 openspec 变更文档移到 archive/，同步 specs 到主规范。纯文档管理，不涉及 git 操作

⏭️ 下一步: [6/6] 代码提交

### 📤 [6/6] 代码提交

**意图关键词:** 提交、commit、push、PR、创建PR、合并、发PR

**典型提示词:**
- "提交代码"、"commit"、"创建 PR"
- "push 到远端"、"发个 PR"

**路由:** `Skill("shadow-dev-commit")`
**描述:** 推送功能分支到远端，自动创建 PR 并关联 Issue

➡️ ✅ **工作流完成** — 关注 CI 结果和 code review 反馈

---

## 🔀 意图路由速查

| 用户说 | 环节 | 路由 |
|--------|------|------|
| "提案" | [2/6] | `Skill("shadow-dev-discuss")`（优先级最高） |
| "新需求"、"创建需求"、"propose" | [1/6] | `Skill("shadow-dev-propose")` |
| "从 Issue 开始"、"GitHub Issue" | [1/6] | `Skill("shadow-dev-propose")`（Issue 模式） |
| "快进"、"fast-forward"、"ff" | [1/6] | `Skill("shadow-dev-propose")`（ff 模式） |
| "继续"、"continue"、"接着做"、"上次" | 自动 | **中断恢复**，自行路由到对应阶段 |
| "提案"、"需求讨论"、"怎么设计"、"explore"、"design" | [2/6] | `Skill("shadow-dev-discuss")` |
| "开始执行"、"apply"、"实现" | [3/6] | `Skill("shadow-dev-apply")` |
| "代码审查"、"review"、"验收"、"verify" | [4/6] | `Skill("shadow-dev-review")` |
| "归档"、"archive" | [5/6] | `Skill("shadow-dev-archive")` |
| "提交"、"commit"、"push"、"PR" | [6/6] | `Skill("shadow-dev-commit")` |

已存在的变更名直接使用；否则让用户选择或新建议。

---

## 🎯 核心原则: Action Not Phases

每个 Action 是独立能力，不强制按顺序完成：

- 紧急 hotfix ➡️ 可跳过 brainstorming 直接 propose + apply
- 小修复 ➡️ 可用 `ff` 快进跳过 discuss 直接生成制品
- 需求模糊 ➡️ 必须走 brainstorming，不跳过探索
- 复杂功能 ➡️ 必须走完整流程

**判断标准:** 简单变更（单文件、明确输入输出、无架构影响）可以跳过 discuss；复杂变更（多模块、技术选型、数据模型变更）必须走完整流程。

---

## 🔄 中断恢复

会话中断后重新进入，先执行 `openspec list` 查看当前状态：

- 有活跃变更 ➡️ 路由到对应阶段继续执行
- 具体步骤已在对应阶段中定义，直接在中断点继续即可
- worktree 仍在时继续使用，无需重建
