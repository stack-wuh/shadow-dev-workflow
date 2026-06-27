---
name: shadow-dev-propose
description: 创建新需求 — 支持 full 模式（brainstorming + 完整制品）和 ff 模式（快进一键生成）
---
# 💡 Propose — 创建新需求

## 🔀 入口

根据上下文判断模式，无法判断时 AskUserQuestion：「完整需求对齐还是快进生成？」

- 入口路由传来 "Issue" / "从 Issue 开始" / "GitHub Issue" ➡️ **Issue 入口**（先读取 Issue，再选 full/ff）
- 入口路由传来 "ff" / "快进" ➡️ **ff 模式**
- 入口路由传来 "propose" / "新需求" 或无上下文 ➡️ **full 模式**（默认）

**在了解用户需求之前，不要执行任何查阅或探索操作。**

---

## 📋 Full 模式 — 完整需求创建

### 🔍 [1/9] 模式判断

按入口规则确定 full 模式，无法判断时 AskUserQuestion。

⏭️ 下一步: [2/9] 需求来源选择

### 📥 [2/9] 需求来源选择

AskUserQuestion 选择需求来源：

- "手动描述" ➡️ 进入 brainstorming
- "从 GitHub Issue" ➡️ 读取 Issue 后进入 brainstorming

**Issue 读取流程：**

1. AskUserQuestion 选择读取方式：
   - "指定编号" ➡️ 用户输入 Issue 编号（如 `42`）
   - "浏览列表" ➡️ `gh issue list --limit 20 --state open --json number,title,labels` ➡️ 展示列表让用户选
2. `gh issue view <number> --json title,body,labels`
3. Issue 标题作为需求摘要、正文作为背景描述、labels 作为标签。Issue 编号记录备用（后续写入 `.openspec.yaml`）。

⏭️ 下一步: [3/9] 需求对齐

### 🧠 [3/9] 需求对齐（brainstorming）

调用 `Skill("superpowers:brainstorming")` 对齐需求：

- 逐一提问澄清需求（一次一个问题）
- 提出 2-3 个方案，标注推荐方案和理由
- AskUserQuestion 让用户确认需求摘要

**⚠️ brainstorming 只做信息对齐，不产出任何文件。** 方案、设计思路保留在对话中即可，禁止写出到 `docs/superpowers/` 路径。最终产出统一走 [6/9] + [7/9] 的 OpenSpec 模板。

**探索代码前先预检：**

- 用 Grep/Glob 关键字快速检索需求涉及的文件名/关键词
- **新功能**（无匹配文件）➡️ 不需要读代码，只查 openspec INDEX 看规范冲突
- **修改已有功能**（有匹配文件）➡️ 列出匹配文件清单，AskUserQuestion 让用户确认要读哪些
- **禁止**一次性读取超过用户确认范围的文件

**反模式:** 用户说"简单"就跳过 brainstorming；读代码前不确认文件清单。

⏭️ 下一步: [4/9] 查阅规范索引

### 📚 [4/9] 查阅规范索引

需求已明确后，检查是否与已有规范冲突。

```bash
cat openspec/INDEX.md 2>/dev/null || echo "INDEX_NOT_FOUND"
```

如 INDEX.md 存在：

1. 根据已确认的需求提取 3-5 个关键词，与 INDEX.md 中各领域的「关键词」做匹配
2. 匹配规则: 关键词相似（含同义词、同领域术语）≥2 个即视为相关
3. 如匹配到相关领域:
   - 读取对应 `openspec/specs/<domain>/spec.md`（仅匹配到的领域）
   - 提取：已定义的 GIVEN/WHEN/THEN 需求、接口约定、数据模型规范
   - 检查冲突并提示：「`<domain>` 已规定 `<requirement>`，当前需求是否需修改此规范？」
4. 如无匹配: 跳过

如 INDEX.md 不存在：跳过。首次归档后 INDEX.md 会自动创建。

⏭️ 下一步: [5/9] 确定变更命名

### 🏷️ [5/9] 确定变更命名

读取 `openspec/config.yaml` 的 `rules.proposal` 确认命名规则。

**brainstorming 的输出仅供思路参考，禁止写出到 `docs/superpowers/`。** 最终产物统一走 [6/9] + [7/9] 的 OpenSpec 模板，产出以下 5 个制品到 `openspec/changes/<name>/`：

- `.openspec.yaml` — project/change/date/type/status/issue（可选）
- `proposal.md` — 动机、变更范围、非目标
- `design.md` — 技术方案、影响分析
- `tasks.md` — 按 Phase 组织，标注涉及文件、预计耗时
- `specs/<domain>/spec.md` — ## ADDED/MODIFIED/REMOVED + GIVEN/WHEN/THEN

⏭️ 下一步: [6/9] 创建变更目录

### 📁 [6/9] 创建变更目录 ⚠️ 强制执行

```bash
mkdir -p openspec/changes/<name>/specs/<domain>
```

同名变更存在时，询问继续还是新建。

⏭️ 下一步: [7/9] 写入全部制品

### ✍️ [7/9] 写入全部制品 ⚠️ 强制执行

**仅使用 OpenSpec 模板产出，禁止写出到 `docs/superpowers/` 路径。**

必须读取 `templates/` 目录下的对应模板文件，严格按模板结构填入内容：

1. 读取 `templates/.openspec.yaml` ➡️ 填入 `openspec/changes/<name>/.openspec.yaml`
2. 读取 `templates/proposal.md` ➡️ 填入 `openspec/changes/<name>/proposal.md`
3. 读取 `templates/design.md` ➡️ 填入 `openspec/changes/<name>/design.md`
4. 读取 `templates/tasks.md` ➡️ 填入 `openspec/changes/<name>/tasks.md`
5. 读取 `templates/spec.md` ➡️ 填入 `openspec/changes/<name>/specs/<domain>/spec.md`

模板文件位置：`skills/shadow-dev-propose/templates/`。不得跳过，不得遗漏。

⏭️ 下一步: [8/9] 展示结果

### 📊 [8/9] 展示结果

```
## 新需求已创建: <name>

- proposal.md — 为什么做
- design.md — 技术方案
- tasks.md — N 个实施步骤
- specs/ — 增量需求规格

接下来可以 "需求讨论" 细化方案，或直接 "开始执行"。
```

⏭️ 下一步: [9/9] 发布 GitHub Issue（可选）

### 🐙 [9/9] 发布 GitHub Issue（可选）

仅 "手动描述" 来源时生效。AskUserQuestion：

- "发布为 GitHub Issue" ➡️ `gh issue create --title "<proposal 标题>" --body "<proposal 摘要>" --label enhancement`
- "跳过"

创建成功后，将返回的 Issue 编号写入 `.openspec.yaml` 的 `issue` 字段。

---

✅ **propose 完成** — 下一步: "需求讨论" (`shadow-dev-discuss`) 或 "开始执行" (`shadow-dev-apply`)

---

## ⚡ ff 模式 — 快进生成

适用条件：单文件修改、输入输出明确、无架构影响、无需技术选型讨论。
复杂变更（多模块、数据模型变更、技术选型）应走 full 模式。

### 💬 [1/5] 快速对齐

不调用完整 brainstorming，只做一次 AskUserQuestion 确认需求和方案。

**⚠️ 快速对齐阶段不产出文件。** 最终产物统一走 [3/5] + [4/5] 的 OpenSpec 模板。

⏭️ 下一步: [2/5] 查阅规范索引

### 📚 [2/5] 查阅规范索引

执行与 Full 模式 [4/9] 相同的规范检查流程。

⏭️ 下一步: [3/5] 创建变更目录

### 📁 [3/5] 创建变更目录 ⚠️ 强制执行

遵循 `openspec/config.yaml` 命名规则，创建目录：

```bash
mkdir -p openspec/changes/<name>/specs/<domain>
```

同名变更存在时，询问继续还是新建。

⏭️ 下一步: [4/5] 写入全部制品

### ✍️ [4/5] 写入全部制品 ⚠️ 强制执行

**仅使用 OpenSpec 模板产出，禁止写出到 `docs/superpowers/` 路径。**

必须读取 `templates/` 目录下的对应模板文件，严格按模板结构填入内容：

1. 读取 `templates/.openspec.yaml` ➡️ 填入 `openspec/changes/<name>/.openspec.yaml`
2. 读取 `templates/proposal.md` ➡️ 填入 `openspec/changes/<name>/proposal.md`
3. 读取 `templates/design.md` ➡️ 填入 `openspec/changes/<name>/design.md`
4. 读取 `templates/tasks.md` ➡️ 填入 `openspec/changes/<name>/tasks.md`
5. 读取 `templates/spec.md` ➡️ 填入 `openspec/changes/<name>/specs/<domain>/spec.md`

模板文件位置：`skills/shadow-dev-propose/templates/`。不得跳过，不得遗漏。

⏭️ 下一步: [5/5] 展示结果

### 📊 [5/5] 展示结果

```
## 变更已快进生成: <name>

- proposal.md / design.md / tasks.md / specs/ 已全部生成
- 建议直接 "开始执行"。
```

AskUserQuestion（仅 "手动描述" 来源）: "发布为 GitHub Issue" / "跳过"。

---

✅ **propose 完成** — 建议直接 "开始执行" (`shadow-dev-apply`)
