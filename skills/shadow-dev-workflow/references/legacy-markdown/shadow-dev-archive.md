---
name: shadow-dev-archive
description: 文档归档 — 将 openspec 变更文档移到 archive/，同步 specs 到主规范。纯文档管理，不涉及 git 操作
---
# 💎 Archive — 文档归档

将 openspec 变更文档移到 archive/，同步 specs 到主规范。部分涉及 git 操作（状态更新 + 提交归档文档）。

## 📋 归档流程

### ✅ [1/6] 确认归档条件

审查结果必须为 ✓ 或用户对 ⚠ 明确决定归档。

⏭️ 下一步: [2/6] 验证 openspec 文档

### 🔬 [2/6] 验证 openspec 文档

在迁移目录之前，先验证文档结构和内容的正确性：

```bash
openspec validate <change-name>
```

验证内容：
- `.openspec.yaml` 格式正确
- `proposal.md` / `design.md` / `tasks.md` 结构完整
- `specs/` 增量规格格式正确（`## ADDED` / `## MODIFIED` / `## REMOVED`）
- 所有必需字段存在

**失败处理：** 验证失败则立即停止，展示错误信息，不继续归档。用户修复后重新执行 archive。

⏭️ 下一步: [3/6] 迁移 change 目录

### 🚚 [3/6] 迁移 change 目录

```bash
mv openspec/changes/<name> openspec/changes/archive/<name>
```

**更新状态：** 迁移后，将归档目录中 `.openspec.yaml` 的 `status` 更新为 `archived`：

```bash
# 手动修改 openspec/changes/archive/<name>/.openspec.yaml
# status: applied → status: archived
```

⏭️ 下一步: [4/6] 同步 specs

### 🔄 [4/6] 同步 specs

将 `openspec/changes/archive/<name>/specs/` 中的增量规格合并到 `openspec/specs/<domain>/`：
- `## ADDED` ➡️ 追加到对应 spec 文件
- `## MODIFIED` ➡️ 替换对应 Requirement
- `## REMOVED` ➡️ 删除对应 Requirement

⏭️ 下一步: [5/6] 更新规范索引 INDEX.md

### 🪄 [4b/6] 沉淀组件场景

归档前检查本次变更是否涉及 UI 组件改动，若有则更新组件场景库：

1. **读取 design.md 的复用分析：** 查看 `## 复用分析` 章节中使用了哪些组件。
2. **匹配现有场景：** 对照 `openspec/navigation-guide.yaml` 中对应组件的 `scenarios` 列表。
3. **判断沉淀需求：**
   - 仅使用已有 demo 覆盖的模式：跳过；
   - 新 props 组合、新布局结构或新交互方式：新增 demo。
4. **新建 demo（如需）：** 在 `openspec/specs/wuh.site/demo-<usage>/` 下创建 `index.md` 与 `demo.jsx`。
5. **更新 navigation-guide.yaml：** 将新 demo 追加到组件对应的 `scenarios`。

只沉淀新的使用模式，不为已有模式重复创建 demo；本步骤不改组件实现。

⏭️ 下一步: [5/6] 更新规范索引 INDEX.md

### 📑 [5/6] 更新规范索引 INDEX.md

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

- **领域已存在** ➡️ 替换该领域的条目（从 `## <domain>` 到下一个 `## ` 之间）
- **领域不存在** ➡️ 按字母顺序插入新条目：

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

⏭️ 下一步: [6/6] 验证归档结果

### ✔️ [6/6] 验证归档结果

```bash
ls openspec/changes/archive/<name>/
```

**输出:**

```
## 文档已归档 ✓

**变更:** <name>
**归档位置:** openspec/changes/archive/<name>/
**合并的 Specs:** <domain>
```

---

✅ **archive 完成** — 下一步: "提交代码" (`shadow-dev-commit`)
