# Agent Loop Protocol (`agent-loop/v1`)

## Purpose

Agent Loop adds a single workflow-control record to the existing OpenSpec artifact model:

```text
openspec/changes/<change>/.openspec.yaml
```

It does **not** replace the fixed, human-readable OpenSpec artifacts:

```text
openspec/changes/<change>/proposal.md
openspec/changes/<change>/design.md
openspec/changes/<change>/tasks.md
openspec/changes/<change>/specs/<domain>/spec.md
```

The YAML file coordinates those artifacts: it records their paths, lifecycle status, short summaries, approved execution DAG, evidence, failures, required inputs, and resume checkpoints. The fixed artifacts remain the formal requirements, design, plan, and incremental specification documents.

## Control Plane And Artifact Plane

| Plane | Storage | Purpose |
|---|---|---|
| Control plane | `.openspec.yaml` | Phase state, artifact index, DAG, checkpoint, failures, review/commit metadata |
| Artifact plane | `proposal.md`, `design.md`, `tasks.md`, `specs/**/spec.md` | Human-readable, reviewable OpenSpec deliverables |
| Archive outputs | `openspec/specs/**`, demos, `navigation-guide.yaml`, `INDEX.md` | Long-lived product and component knowledge |

Agents MUST update the YAML control plane at every phase transition. They MUST NOT delete, replace, or silently bypass the fixed artifact plane.

## Required Top-Level Sections

```yaml
schema: agent-loop/v1
change: {}
artifacts: {}
proposal: {}
discuss: {}
apply: {}
review: {}
archive: {}
commit: {}
runtime: {}
```

`artifacts` must index the four fixed artifacts and their status:

```yaml
artifacts:
  proposal: { path: proposal.md, status: completed }
  design: { path: design.md, status: completed }
  tasks: { path: tasks.md, status: completed }
  specs:
    status: completed
    paths:
      - specs/<domain>/spec.md
```

## State Machine

```text
propose -> discuss -> apply -> review -> archive -> commit
                         ^        |
                         |--------| blocking review finding
```

- `change.status`: `proposed | discussed | applying | reviewing | archived | committed | blocked | failed`
- `runtime.phase`: `propose | discuss | apply | review | archive | commit`
- `runtime.state`: `idle | running | waiting_for_input | blocked | failed | completed`

A phase is complete only when its YAML phase status is complete **and** every required fixed artifact has the recorded completed status and exists at the registered path.

## Phase Ownership

| Phase | Fixed artifacts read/write | YAML responsibility |
|---|---|---|
| propose | writes `proposal.md`, `specs/<domain>/spec.md`; creates templates for design/tasks | indexes artifacts, records requirement summary, Issue and risks |
| discuss | reads proposal/spec; writes `design.md`, `tasks.md` | records decisions and projects tasks.md into `apply.workflow` |
| apply | loads only YAML-indexed proposal/discuss artifacts | task state, evidence, checkpoint, breaker state |
| review | loads only YAML-indexed fixed artifacts and task files | verification, findings, repair workflow |
| archive | moves change, merges incremental specs, creates demos, updates navigation/index | archive manifest and evidence |
| commit | stages all relevant artifact/archive outputs | branch, commits, PR and completion state |

## Apply Input Contract

For `schema: agent-loop/v1`, apply first reads only these YAML sections:

```yaml
change:    # identity and Issue metadata only
artifacts: # exact file paths to load
proposal:
discuss:
apply:
runtime:
```

It then loads only the registered fixed artifacts:

```text
artifacts.proposal.path
artifacts.specs.paths
artifacts.design.path
artifacts.tasks.path
```

Apply MUST NOT scan other documentation or rediscover a plan. `tasks.md` remains the approved human-readable plan; `apply.workflow` is its execution projection. The two must be kept consistent by discuss and review.

## Task Graph And Checkpoints

`discuss` derives `apply.workflow` from `tasks.md` after the user confirms the design:

```yaml
apply:
  workflow:
    - id: update-api
      title: Update API contract
      status: pending
      dependsOn: []
      files: []
      instructions: []
      verification: []
      requiredInputs: []
      attempts: 0
      maxAttempts: 2
      evidence: []
      failure: null
```

Allowed task status values: `pending | running | completed | blocked | failed | skipped`.

After every task attempt, persist its status, attempts, evidence and failure in YAML. On resume, start with the first dependency-ready `pending` task, or `runtime.resume.taskId`; never replay completed tasks.

## Circuit Breaker

Classify failures before continuing:

| Kind | Examples | Action |
|---|---|---|
| `missing_input` | environment value, approval, source Issue number | set `waiting_for_input`; record `requiredInputs`; ask only for those values |
| `retryable` | timeout, temporary network/API failure, unavailable service | retry up to task `maxAttempts`; then block |
| `verification` | tests/type check/lint fail | mark task failed; create focused repair task; route to apply |
| `permanent` | permission denied, contradiction, unsafe operation | block and wait for explicit user decision |

```yaml
runtime:
  phase: apply
  state: waiting_for_input
  resume:
    taskId: deploy-api
    command: 开始执行
  requiredInputs:
    - key: NEST_API_URL
      description: Nest API URL used by integration verification
      supplied: false
  failure:
    kind: missing_input
    message: Cannot run API verification without NEST_API_URL.
    occurredAt: 2026-07-19T00:00:00Z
```

Never silently continue past a blocker, failure, or missing required input.

## Review And Repair Loop

Review checks YAML-indexed fixed artifacts, task evidence and the code diff. It records structured verification and findings under `review`. Blocking findings create focused `apply.repairWorkflow` tasks tied to the finding ID; after repair, review re-runs.

## Archive

Archive preserves the existing OpenSpec output behavior:

1. Move the change directory to `openspec/changes/archive/<change>` when appropriate.
2. Merge `archive/<change>/specs/<domain>/spec.md` into `openspec/specs/<domain>/spec.md`, preserving `ADDED/MODIFIED/REMOVED` semantics.
3. Inspect `design.md` reuse analysis, create genuinely new component scenario demos, and update `navigation-guide.yaml`.
4. Update `openspec/INDEX.md` to point to the materialized main `openspec/specs/<domain>/spec.md`.
5. Record sources, targets, results and validation evidence in `archive.specSync`, `archive.componentScenarios`, and `archive.indexEntry`.

YAML is the archive manifest and state record. It is not a replacement for main specs, demos, navigation guide, or index assets.

## Legacy Compatibility

Changes without `schema: agent-loop/v1` use the preserved stage instructions under `references/legacy-markdown/`. Do not automatically migrate or mix legacy and Agent Loop semantics. A migration requires its own explicit change.
