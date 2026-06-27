---
name: shadow-openspec-superpowers-workflow-propose
description: 创建新需求 — 支持 full 模式（brainstorming + 完整制品）和 ff 模式（快进一键生成）
---
# Propose — 创建新需求

## 模式判断

开场根据上下文判断模式：
- 入口路由传来 "Issue" / "从 Issue 开始" / "GitHub Issue" → **Issue 模式**（跳至下方 Issue 章节）
- 入口路由传来 "ff" / "快进" → **ff 模式**（跳至下方 ff 章节）
- 入口路由传来 "propose" / "新需求" 或无上下文 → **full 模式**（默认）
- 无法判断 → AskUserQuestion：「完整需求对齐还是快进生成？」

**在了解用户需求之前，不要执行任何查阅或探索操作。** 先问清楚要做什么，再决定查什么。

---
## 需求来源选择

模式确定后（full / ff），AskUserQuestion 选择需求来源：
- "手动描述" → 进入 brainstorming（现有流程）
- "从 GitHub Issue" → 进入下方 Issue 读取流程

---
## Issue 模式 — 从 GitHub Issue 读取需求

### 选择 Issue

AskUserQuestion 选择读取方式：
- "指定编号" → 用户输入 Issue 编号（如 `42`）
- "浏览列表" → 执行 `gh issue list --limit 20 --state open --json number,title,labels` → 展示列表让用户选

### 读取并输入 brainstorming

```bash
gh issue view <number> --json title,body,labels
```

Issue 标题作为需求摘要、正文作为背景描述、labels 作为标签。Issue 编号记录备用（后续写入 `.openspec.yaml`）。

读取完成后进入 brainstorming（下方 full 模式步骤 1）或 ff 模式快速对齐。

---

## Full 模式 — 完整需求创建

### 1. 需求对齐（brainstorming 门禁）

调用 `Skill("superpowers:brainstorming")` 对齐需求：
- 逐一提问澄清需求（一次一个问题）
- 提出 2-3 个方案，标注推荐方案和理由
- AskUserQuestion 让用户确认需求摘要

**探索代码前先预检：**
- 用 Grep/Glob 关键字快速检索需求涉及的文件名/关键词
- **新功能**（无匹配文件）→ 不需要读代码，只查 openspec INDEX 看规范冲突
- **修改已有功能**（有匹配文件）→ 列出匹配文件清单，AskUserQuestion 让用户确认要读哪些，**不要未经确认就批量读取**
- **禁止**一次性读取超过用户确认范围的文件

**反模式:** 用户说"简单"就跳过 brainstorming；读代码前不确认文件清单。

### 1.5 查阅规范索引（需求已知后执行）

**需求已明确，现在检查是否与已有规范冲突。**

```bash
cat openspec/INDEX.md 2>/dev/null || echo "INDEX_NOT_FOUND"
```

如 INDEX.md 存在：
1. **根据已确认的需求提取 3-5 个关键词**，与 INDEX.md 中各领域的「关键词」做匹配
2. **匹配规则:** 关键词相似（含同义词、同领域术语）≥2 个即视为相关
3. **如匹配到相关领域:**
   - 读取对应 `openspec/specs/<domain>/spec.md`（仅匹配到的领域）
   - 提取：已定义的 GIVEN/WHEN/THEN 需求、接口约定、数据模型规范
   - 检查冲突并提示：「`<domain>` 已规定 `<requirement>`，当前需求是否需修改此规范？」
4. **如无匹配:** 跳过，继续正常流程

如 INDEX.md 不存在：跳过。首次归档后 INDEX.md 会自动创建。

### 2. 确定变更命名和目录

**必读 `openspec/config.yaml`** 的 `rules.proposal` 确认命名规则。常见格式：`{project-name}_{yyyy_MM_DD}` 或 `YYYY-MM-DD-{kebab}`，以 config.yaml 为准。

brainstorming skill 默认写 `docs/superpowers/specs/`，但 openspec 变更必须产出到 `openspec/changes/<name>/`。brainstorming 结束后，将产出的设计文档转化为 openspec 格式：
- `.openspec.yaml` — project/change/date/type/status/issue(可选)
- `proposal.md` — 动机、变更范围、非目标
- `design.md` — 技术方案、影响分析
- `tasks.md` — 按 Phase 组织，标注涉及文件、预计耗时
- `specs/<domain>/spec.md` — ## ADDED/MODIFIED/REMOVED + GIVEN/WHEN/THEN

### 3. 创建变更目录

```bash
mkdir -p openspec/changes/<name>/specs/<domain>
```

### 4. 写入全部制品

按上述模板写入 proposal.md、design.md、tasks.md、specs/ 和 .openspec.yaml。

### 5. 展示结果

```
## 新需求已创建: <name>

- proposal.md — 为什么做
- design.md — 技术方案
- tasks.md — N 个实施步骤
- specs/ — 增量需求规格

接下来可以 "需求讨论" 细化方案，或直接 "开始执行"。
```

### 6. 发布为 GitHub Issue（可选，仅 "手动描述" 来源）

如果需求来源为 "手动描述" 且制品已生成，AskUserQuestion：
- "发布为 GitHub Issue" → `gh issue create --title "<proposal 标题>" --body "<proposal 摘要>" --label enhancement`
- "跳过"

创建成功后，将返回的 Issue 编号写入 `.openspec.yaml` 的 `issue` 字段。

**注意事项:** 同名变更存在时，询问继续还是新建。

---

## ff 模式 — 快进生成

简单变更跳过 discuss 直接生成全部规划制品。适用条件：单文件修改、输入输出明确、无架构影响、无需技术选型讨论。

### 1. 快速对齐（轻量 brainstorming）

不调用完整 brainstorming，只做一次 AskUserQuestion 确认需求和方案。

### 1.5 查阅规范索引

需求确认后，执行与 Full 模式 1.5 相同的规范检查流程。

### 2. 一键生成制品

遵循 openspec/config.yaml 命名规则，创建 `openspec/changes/<name>/` 目录并写入 .openspec.yaml、proposal.md、design.md、tasks.md、specs/。

### 3. 展示结果

```
## 变更已快进生成: <name>
- proposal.md / design.md / tasks.md / specs/ 已全部生成
建议直接 "开始执行"。
```

### 4. 发布为 GitHub Issue（可选，仅 "手动描述" 来源）

与 Full 模式步骤 6 相同。

复杂变更（多模块、数据模型变更、技术选型）应走完整 propose → discuss 流程。
