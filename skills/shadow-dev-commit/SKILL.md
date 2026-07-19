---
name: shadow-dev-commit
description: Agent Loop 提交 — 从单一 .openspec.yaml 读取门禁、Issue 与发布状态，完成 PR 闭环
---
# 📦 Commit — Agent Loop 提交

## 输入边界

对 `schema: agent-loop/v1`，先读取 `.openspec.yaml`：

```yaml
change:
review:
archive:
commit:
runtime:
```

提交门禁只由 YAML 状态决定；归档产物仍由 `archive` 阶段维护。必要时可按 YAML `artifacts` 清单将归档目录、主 specs、场景 demo 和 INDEX 一起纳入 commit。若 schema 不是 `agent-loop/v1`，读取 `skills/shadow-dev-workflow/references/legacy-markdown/shadow-dev-commit.md` 后使用 legacy 规则。

## [1/5] 提交门禁

必须满足：

```yaml
review.status: passed
archive.status: completed
change.issue: <GitHub issue URL>
runtime.phase: commit
```

否则将 `commit.status: blocked` 和 `runtime.failure` 写回 YAML，停止。禁止在未验证、未归档、无 Issue 时创建 PR 或自动合并。

## [2/5] 预览与用户确认

展示：当前分支、`git status`、`git diff --stat`、变更 ID、Issue、review verification 摘要。得到用户确认后继续。

## [3/5] Commit

将 YAML 更新与代码一起提交，写入：

```yaml
commit:
  status: pending
  branch: <branch>
  commits:
    - hash: <hash>
      message: <message>
      at: <ISO-8601>
```

commit 失败时：

```yaml
runtime:
  phase: commit
  state: blocked
  failure:
    kind: retryable
    message: <git error>
  resume:
    command: 提交代码
```

## [4/5] Push 与 PR

从 `change.issue` 提取 Issue number。PR body 必须包含 `Closes #<number>`。创建/更新 PR 后回写：

```yaml
commit:
  pullRequest:
    number: <number>
    url: <url>
    state: open | merged
```

自动合并只在用户明确要求、所有 review verification 为 passed、且无 open warning/findings 时可启用。网络/API 失败按 circuit breaker 写入 YAML，不得直接假定完成。

## [5/5] 完成

PR 合并后：

```yaml
commit: { status: completed }
change: { status: committed }
runtime: { phase: commit, state: completed }
```

输出 commit、PR、Issue 关闭状态和当前分支。
