---
name: shadow-dev-archive
description: Agent Loop 归档 — 保留 OpenSpec specs 合并和组件场景沉淀，并将归档进度写入 .openspec.yaml
---
# 💎 Archive — 固定产物归档 + Agent Loop 控制

## 核心约束

对 `schema: agent-loop/v1`：

- `.openspec.yaml` 是归档的控制面、清单和恢复记录；
- `proposal.md`、`design.md`、`tasks.md`、`specs/<domain>/spec.md` 仍是固定产物；
- Archive 必须保留原有语义：移动 change、将增量 specs 合并到 `openspec/specs/<domain>/spec.md`、沉淀组件使用场景、更新 `navigation-guide.yaml` 与 `openspec/INDEX.md`。

YAML 不替代这些归档资产；它记录它们的路径、状态、同步结果和验证证据。

Legacy change 继续使用 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-archive.md`。

## [1/7] 归档门禁

仅当：

- `review.status: passed`；或
- `review.status: warnings` 且用户已经明确接受，并写入 YAML evidence；

才可归档。若 `runtime.state` 是 `blocked | waiting_for_input | failed`，停止并展示 `failure` / `requiredInputs`。

## [2/7] 读取固定产物清单

读取 YAML `artifacts`，仅加载登记的：

```yaml
artifacts:
  proposal: { path: proposal.md, status: completed }
  design: { path: design.md, status: completed }
  tasks: { path: tasks.md, status: completed }
  specs:
    paths:
      - specs/<domain>/spec.md
```

缺失、未完成或路径不存在时，写入 `runtime.failure.kind: permanent`，设 `archive.status: blocked`，等待用户修复；不得猜测规格内容。

## [3/7] 迁移变更目录

保持原有目录约定：

```bash
mv openspec/changes/<name> openspec/changes/archive/<name>
```

迁移后更新 YAML 中 artifact paths 为归档后的相对路径，并记录 `archive.movedAt`。若目录已归档，视为可恢复状态，继续下一步。

## [4/7] 同步 Specs

保持原有 OpenSpec 合并逻辑。对每个登记的 `specs/<domain>/spec.md`：

- `## ADDED`：追加对应 Requirement；
- `## MODIFIED`：替换同名 Requirement；
- `## REMOVED`：删除对应 Requirement；
- 主规范不存在时：创建 `openspec/specs/<domain>/spec.md`。

每个同步结果必须写入：

```yaml
archive:
  specSync:
    - domain: <domain>
      source: specs/<domain>/spec.md
      target: openspec/specs/<domain>/spec.md
      result: created | updated | unchanged
      evidence:
        - command: <validation command>
          result: passed
          at: <ISO-8601>
```

## [5/7] 沉淀组件场景

保持你原有的组件使用场景沉淀逻辑。数据来源是 `design.md` 的复用分析，并用 `discuss.reuse` 作为索引：

1. 对照 `openspec/navigation-guide.yaml` 的 `scenarios`；
2. 已有 demo 覆盖时记录 `decision: existing`；
3. 出现新 props 组合、新布局或新交互时，创建 `openspec/specs/wuh.site/demo-<usage>/index.md` 和 `demo.jsx`；
4. 更新 `navigation-guide.yaml`；
5. 将路径、决策和验证写入 `archive.componentScenarios`。

本阶段不改组件业务实现。

## [6/7] 更新 INDEX

保持原有 `INDEX.md` 格式和领域入口。条目必须继续指向主规范：

```markdown
## <domain> — <中文描述>
- **关键词:** <domain keywords>
- **需求:** <Requirement 名称列表>
- **路径:** `openspec/specs/<domain>/spec.md`
```

将最终条目记录到 `archive.indexEntry`。

## [7/7] 冻结状态与输出

只有 specs 同步、场景沉淀和 INDEX 更新均有 evidence 时：

```yaml
archive:
  status: completed
  archivedAt: <ISO-8601>
change:
  status: archived
runtime:
  phase: commit
  state: completed
```

输出归档目录、同步的 specs、组件场景结果、INDEX 条目和下一步“提交代码”。
