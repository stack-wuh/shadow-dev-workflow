---
name: shadow-dev-archive
description: 文档归档 — 将 openspec 变更文档移到 archive/，同步 specs 到主规范。纯文档管理，不涉及 git 操作
---
# 📦 Archive — 文档归档

将 openspec 变更文档移到 archive/，同步 specs 到主规范。**纯文档管理，不涉及 git 操作。**

## 📋 归档流程

### 🔍 [1/5] 确认归档条件

审查结果必须为 ✓ 或用户对 ⚠ 明确决定归档。

→ 下一步: [2/5] 迁移 change 目录

### 📁 [2/5] 迁移 change 目录

```bash
mv openspec/changes/<name> openspec/changes/archive/<name>
```

→ 下一步: [3/5] 同步 specs

### ✍️ [3/5] 同步 specs

将 `openspec/changes/archive/<name>/specs/` 中的增量规格合并到 `openspec/specs/<domain>/`：
- `## ADDED` → 追加到对应 spec 文件
- `## MODIFIED` → 替换对应 Requirement
- `## REMOVED` → 删除对应 Requirement

→ 下一步: [4/5] 更新规范索引 INDEX.md

### 📚 [4/5] 更新规范索引 INDEX.md

归档完成后，更新 `openspec/INDEX.md`，维护各领域规范的关键词索引。

**4a. 确定受影响的领域**

从当前变更的 `specs/` 目录确定修改了哪些领域（即 specs 子目录名）。

**4b. 提取关键词**

从该领域的 `spec.md` 中提取：
- **领域名称:** specs 子目录名 + 简短中文描述
- **3-5 个关键词:** 用于检索的精准标签
- **需求列表:** 从 `### Requirement:` 提取所有需求名

**4c. 让用户确认**

AskUserQuestion 展示提取的内容，让用户确认：

```
领域: <domain>
关键词: [提取的关键词]
需求: [需求列表]
```

选项：「确认」「修改」

**4d. 更新 INDEX.md**

- **INDEX.md 不存在时**先创建：

```markdown
# OpenSpec 规范索引

> 新需求开始前，先查阅此索引了解当前系统规范，避免设计与已有规范冲突。
> 每个领域列出核心需求和关键词，匹配后可深入阅读对应 spec.md。

```

- **领域已存在** → 替换该领域的条目（从 `## <domain>` 到下一个 `## ` 之间）
- **领域不存在** → 按字母顺序插入新条目：

```markdown
## <domain> — <中文描述>
- **关键词:** <逗号分隔>
- **需求:** <需求列表>
- **路径:** `openspec/specs/<domain>/spec.md`
```

**4e. 验证条目**

```bash
grep -A 5 "^## <domain>" openspec/INDEX.md
```

→ 下一步: [5/5] 验证归档结果

### 📊 [5/5] 验证归档结果

```bash
ls openspec/changes/archive/<name>/
```

**输出:**

```
## 文档已归档

**变更:** <name>
**归档位置:** openspec/changes/archive/<name>/
**合并的 Specs:** <domain>
**索引:** INDEX.md 已更新
**下一步:** 建议执行 '提交' (commit/PR)
```

---

✅ **archive 完成** — 下一步: "提交" (`shadow-dev-commit`)
