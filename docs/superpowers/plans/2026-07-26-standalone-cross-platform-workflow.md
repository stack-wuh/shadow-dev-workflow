# Shadow Dev Workflow 独立跨平台技能包 Implementation Plan

> **For agentic workers:** REQUIRED INTERNAL SKILL: Use the packaged `subagent-driven-development` skill or execute this plan inline task-by-task. Do not invoke external `superpowers:*`, `ui-ux-pro-max`, `debugging-workflow`, `code-review`, or `simplify` skills. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `shadow-dev-workflow` 改造为不依赖外部流程技能、内置 UI/UX 和高置信度单 Agent Review、支持 OpenSpec 降级并可适配 Claude Code、Codex CLI、Gemini CLI 的开箱即用技能包。

**Architecture:** 采用渐进式解耦。先建立平台无关 Core 和静态依赖门禁，再让内部基础 Skills 自包含；之后独立落地 Code Review、UI/UX、OpenSpec fallback，最后补齐三个平台适配器和安装入口。现有六阶段用户入口保持不变，每个阶段完成后立即删除已被替代的外部引用。

**Tech Stack:** Markdown Skills、Node.js 20+ 标准库、Node.js built-in test runner、OpenSpec Markdown/YAML 制品、Claude Code Plugin metadata、Codex `AGENTS.md`、Gemini `GEMINI.md`。

---

## 文件结构与职责

### Core

- Create: `core/capabilities.md` — 平台无关能力名称、必需性和降级定义。
- Create: `core/workflow-state-machine.md` — 六阶段状态、进入条件和转换规则。
- Create: `core/artifact-contract.md` — OpenSpec 固定制品与 `review-report.yaml` 合同。
- Create: `core/review-protocol.md` — 单 Agent、diff-only、高置信度 Review 流程。
- Create: `core/bug-prevention-protocol.md` — Bug 漏检回溯与规则沉淀协议。
- Create: `core/degradation-policy.md` — 平台和 CLI 能力缺失时的显式降级规则。

### Internal skills

现有基础 Skills 保持用户不可见的内部能力定位，但继续使用当前 `skills/<name>/SKILL.md` 目录，以兼容 Claude Code 插件发现机制。六阶段只引用本仓库内的短名称，不引用外部命名空间。

- Modify: `skills/brainstorming/SKILL.md`
- Modify: `skills/writing-plans/SKILL.md`
- Modify: `skills/using-git-worktrees/SKILL.md`
- Modify: `skills/test-driven-development/SKILL.md`
- Modify: `skills/dispatching-parallel-agents/SKILL.md`
- Modify: `skills/subagent-driven-development/SKILL.md`
- Modify: `skills/verification-before-completion/SKILL.md`
- Modify: `skills/receiving-code-review/SKILL.md`
- Create: `skills/systematic-debugging/SKILL.md`

### Review

- Modify: `skills/shadow-dev-review/SKILL.md` — 内置 verification + 单 Agent Review + Bug 回溯。
- Create: `references/review/checklist.md` — 八个核心维度与按 diff 启用的专项维度。
- Create: `references/review/finding-contract.md` — finding 必填字段、严重级别和过滤规则。
- Create: `references/review/universal-prevention-rules.md` — 用户确认后的通用防复发规则。
- Create: `references/review/review-report.schema.json` — `review-report.yaml` 的结构合同。
- Create: `scripts/validate-review-report.mjs` — 无第三方 YAML 依赖的最小报告校验器。

### UI/UX

- Modify: `skills/shadow-dev-discuss/SKILL.md` — UI/UX 条件触发和检索结果写入 design。
- Create: `references/ui-ux/data/*.csv` — 迁入 product/style/typography/color/landing/chart/UX/prompt 知识。
- Create: `references/ui-ux/stacks/*.csv` — 迁入技术栈知识。
- Create: `references/ui-ux/checklists/*.md` — 视觉、交互、响应式、无障碍验收规则。
- Create: `references/ui-ux/presets/wuh-site/*.md` — 当前 `x.wuh.site` 风格预设。
- Create: `scripts/uiux-search.mjs` — Node.js 本地检索。
- Create: `scripts/lib/csv.mjs` — CSV 解析与转义。
- Create: `scripts/lib/search.mjs` — 关键词归一化、评分和结果裁剪。

### OpenSpec fallback

- Create: `scripts/openspec-fallback.mjs` — 命令入口。
- Create: `scripts/lib/openspec.mjs` — change 扫描、状态推导、校验和归档逻辑。
- Create: `scripts/lib/simple-yaml.mjs` — 支持项目制品所需 YAML 子集的解析与序列化。

### Platform adapters and installers

- Create: `adapters/claude-code.md`
- Create: `adapters/codex-cli.md`
- Create: `adapters/gemini-cli.md`
- Create: `scripts/install/claude-code.mjs`
- Create: `scripts/install/codex-cli.mjs`
- Create: `scripts/install/gemini-cli.mjs`

### Tests and fixtures

- Create: `tests/package-contract.test.mjs`
- Create: `tests/review-report.test.mjs`
- Create: `tests/uiux-search.test.mjs`
- Create: `tests/openspec-fallback.test.mjs`
- Create: `tests/installers.test.mjs`
- Create: `tests/fixtures/*`

---

## Phase 1：Core 与外部依赖门禁

### Task 1: 建立平台无关 Core 文档

**Files:**
- Create: `core/capabilities.md`
- Create: `core/workflow-state-machine.md`
- Create: `core/artifact-contract.md`
- Create: `core/review-protocol.md`
- Create: `core/bug-prevention-protocol.md`
- Create: `core/degradation-policy.md`
- Reference: `docs/superpowers/specs/2026-07-26-standalone-cross-platform-workflow-design.md`

- [ ] **Step 1: 创建能力协议**

在 `core/capabilities.md` 定义以下固定能力表：

```markdown
# Capability Protocol

| Capability | Required | Fallback |
|---|---:|---|
| read_file | yes | none |
| search_files | yes | none |
| edit_file | yes | none |
| run_command | yes | none |
| ask_user | yes | plain_text_question |
| spawn_agent | no | inline_execution |
| parallel_agents | no | sequential_agents |
| browser_verify | no | mark_unverified |
| invoke_internal_skill | no | read_internal_module |

Every fallback MUST be recorded in the phase result under `degradations`.
```

- [ ] **Step 2: 创建六阶段状态机文档**

`core/workflow-state-machine.md` 明确：

```text
propose -> discuss -> apply -> review -> archive -> commit
review(blocked) -> apply
review(advisory) -> user decision
```

每个阶段列出 required artifacts、entry condition、success condition、next phase 和禁止动作。

- [ ] **Step 3: 创建制品合同**

`core/artifact-contract.md` 固定：

```text
.openspec.yaml
proposal.md
specs/**/spec.md
design.md
tasks.md
review-report.yaml
```

并定义 `review-report.yaml` 顶层字段：

```yaml
version: 1
change: example-change
conclusion: pass | advisory | blocked
findings: []
verification: []
degradations: []
preventionRuleCandidates: []
```

- [ ] **Step 4: 创建 Review、Bug 与降级协议**

将已确认设计中的八个 Review 维度、Bug 五问、规则双层沉淀和显式降级要求分别写入对应 Core 文档。禁止出现 Claude Code、Codex 或 Gemini 的具体工具名。

- [ ] **Step 5: 运行 Core 平台无关检查**

Run:

```bash
! grep -R -nE 'Skill\(|Agent\(|AskUserQuestion|EnterWorktree|mcp__|superpowers:' core
```

Expected: exit 0，无输出。

- [ ] **Step 6: 检查文档格式并提交**

Run:

```bash
git diff --check
```

Expected: exit 0。

Commit:

```bash
git add core
git commit -m "docs(core): define platform-neutral workflow contracts"
```

---

### Task 2: 实现技能包静态合同检查

**Files:**
- Create: `scripts/validate-package.mjs`
- Create: `tests/package-contract.test.mjs`
- Create: `tests/fixtures/package-contract/valid/skills/example/SKILL.md`
- Create: `tests/fixtures/package-contract/external-reference/skills/example/SKILL.md`
- Create: `tests/fixtures/package-contract/missing-internal/skills/example/SKILL.md`
- Create: `tests/fixtures/package-contract/platform-name/core/capabilities.md`

- [ ] **Step 1: 写失败测试**

测试必须覆盖：

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validatePackage } from '../scripts/validate-package.mjs'

test('rejects forbidden external skill references', async () => {
  const result = await validatePackage('tests/fixtures/package-contract/external-reference')
  assert.equal(result.passed, false)
  assert.match(result.errors.join('\n'), /superpowers:/)
})

test('rejects missing internal skill references', async () => {
  const result = await validatePackage('tests/fixtures/package-contract/missing-internal')
  assert.equal(result.passed, false)
  assert.match(result.errors.join('\n'), /missing internal skill/i)
})

test('rejects platform-specific names in core', async () => {
  const result = await validatePackage('tests/fixtures/package-contract/platform-name')
  assert.equal(result.passed, false)
  assert.match(result.errors.join('\n'), /platform-specific/i)
})

test('accepts a self-contained package', async () => {
  const result = await validatePackage('tests/fixtures/package-contract/valid')
  assert.equal(result.passed, true)
})
```

- [ ] **Step 2: 确认测试失败**

Run:

```bash
node --test tests/package-contract.test.mjs
```

Expected: FAIL，提示无法导入 `validate-package.mjs`。

- [ ] **Step 3: 实现最小检查器**

`scripts/validate-package.mjs` 导出：

```js
export async function validatePackage(root) {
  return { passed, errors }
}
```

规则：

```js
const FORBIDDEN_REFERENCES = [
  /superpowers:/,
  /ui-ux-pro-max/,
  /debugging-workflow/,
  /Skill\(["'](?:code-review|simplify)["']\)/,
]

const PLATFORM_NAMES = [
  /AskUserQuestion/,
  /EnterWorktree/,
  /mcp__/,
  /Skill\(/,
  /Agent\(/,
]
```

扫描 `.md`、`.json`、`.mjs`，跳过 `.git/`、`docs/superpowers/specs/` 和测试的 intentional-invalid fixtures。解析 Markdown 中反引号包裹的内部技能名，并验证对应 `skills/<name>/SKILL.md` 存在。

CLI 输出 JSON：

```bash
node scripts/validate-package.mjs --root . --json
```

- [ ] **Step 4: 确认测试通过**

Run:

```bash
node --test tests/package-contract.test.mjs
```

Expected: 4 tests passed。

- [ ] **Step 5: 对当前仓库运行基线扫描**

Run:

```bash
node scripts/validate-package.mjs --root . --json
```

Expected: FAIL，并列出现存外部引用；保存输出作为 Phase 2 的清理清单，不把基线失败误报为脚本失败。

- [ ] **Step 6: 提交**

```bash
git add scripts/validate-package.mjs tests/package-contract.test.mjs tests/fixtures/package-contract
git commit -m "test(package): add self-contained dependency contract"
```

---

## Phase 2：内部基础 Skills 自包含

### Task 3: 清理基础 Skill 的外部命名空间引用

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Modify: `skills/writing-plans/SKILL.md`
- Modify: `skills/using-git-worktrees/SKILL.md`
- Modify: `skills/test-driven-development/SKILL.md`
- Modify: `skills/dispatching-parallel-agents/SKILL.md`
- Modify: `skills/subagent-driven-development/SKILL.md`
- Modify: `skills/verification-before-completion/SKILL.md`
- Modify: `skills/receiving-code-review/SKILL.md`
- Modify: `skills/subagent-driven-development/code-quality-reviewer-prompt.md`
- Test: `tests/package-contract.test.mjs`

- [ ] **Step 1: 增加仓库级禁止引用测试**

在测试中加入：

```js
test('repository has no external workflow skill references after migration', async () => {
  const result = await validatePackage('.')
  assert.equal(result.passed, true, result.errors.join('\n'))
})
```

临时用 `test.skip` 标记，直到 Task 5 完成所有阶段 Skill 清理；基础 Skill 清理完成后先运行 targeted grep 验证本任务范围。

- [ ] **Step 2: 修改 writing-plans 的执行交接**

将：

```text
superpowers:subagent-driven-development
superpowers:executing-plans
superpowers:using-git-worktrees
```

替换为：

```text
packaged subagent-driven-development
inline task-by-task execution
packaged using-git-worktrees
```

计划头部不再要求外部命名空间。

- [ ] **Step 3: 修改 subagent-driven-development 的关联能力**

删除对不存在的：

```text
superpowers:requesting-code-review
superpowers:finishing-a-development-branch
superpowers:executing-plans
```

改为直接引用 Core 协议和现有内部 Skill：

```text
using-git-worktrees
writing-plans
test-driven-development
verification-before-completion
receiving-code-review
```

最终代码审查改为读取 `core/review-protocol.md`，最多启动一个 Review Agent。

- [ ] **Step 4: 清理其余基础 Skill 的外部前缀**

对每个文件执行最小替换，不改变其核心流程。所有“调用外部 Skill”表述改为“调用包内 Skill；平台不支持 Skill 调用时读取该模块”。

- [ ] **Step 5: 修复 code quality reviewer prompt**

删除对 `requesting-code-review/code-reviewer.md` 的引用，改为：

```text
Follow core/review-protocol.md and references/review/finding-contract.md.
Return only findings that include a concrete failure scenario.
```

- [ ] **Step 6: 验证基础 Skills**

Run:

```bash
! grep -R -nE 'superpowers:|ui-ux-pro-max|debugging-workflow|Skill\(["'"'](?:code-review|simplify)["'"']\)' \
  skills/brainstorming \
  skills/writing-plans \
  skills/using-git-worktrees \
  skills/test-driven-development \
  skills/dispatching-parallel-agents \
  skills/subagent-driven-development \
  skills/verification-before-completion \
  skills/receiving-code-review
```

Expected: exit 0，无输出。

- [ ] **Step 7: 提交**

```bash
git add skills/brainstorming skills/writing-plans skills/using-git-worktrees \
  skills/test-driven-development skills/dispatching-parallel-agents \
  skills/subagent-driven-development skills/verification-before-completion \
  skills/receiving-code-review
git commit -m "refactor(skills): make internal workflow capabilities self-contained"
```

---

### Task 4: 新增内置 systematic-debugging

**Files:**
- Create: `skills/systematic-debugging/SKILL.md`
- Create: `skills/systematic-debugging/root-cause-template.md`
- Modify: `rules/iron-laws.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 写 internal skill 存在性失败测试**

在 package contract fixture 中创建引用 `systematic-debugging` 但没有对应 Skill，运行：

```bash
node --test tests/package-contract.test.mjs --test-name-pattern="missing internal"
```

Expected: PASS fixture 的拒绝行为，证明缺失引用能被检测。

- [ ] **Step 2: 创建 debugging Skill**

`SKILL.md` 固定四阶段：

```text
1. Reproduce — 记录最小复现和失败证据
2. Trace — 从错误边界向输入追踪，不猜测式修改
3. Hypothesize — 一次只验证一个根因假设
4. Fix and regress — 先失败测试，再最小修复，再回归验证
```

Bug 结束时必须产出：

```yaml
symptom:
rootCause:
whyExistingReviewMissed:
regressionVerification:
preventionRuleCandidate:
```

- [ ] **Step 3: 创建根因模板**

`root-cause-template.md` 使用明确章节：

```markdown
## Symptom
## Reproduction
## Evidence
## Root Cause
## Why Existing Review Missed It
## Regression Verification
## Prevention Rule Candidate
```

- [ ] **Step 4: 更新规则引用**

`rules/iron-laws.md` 和 `CLAUDE.md` 将 `debugging-workflow` 改为包内 `systematic-debugging`。

- [ ] **Step 5: 验证**

Run:

```bash
! grep -R -n 'debugging-workflow' rules CLAUDE.md skills/systematic-debugging
node scripts/validate-package.mjs --root . --json
```

Expected: 第一条 exit 0；第二条不再报告 debugging 外部依赖，但可能仍报告 Phase 3/4 尚未清理的 UI/UX 引用。

- [ ] **Step 6: 提交**

```bash
git add skills/systematic-debugging rules/iron-laws.md CLAUDE.md
git commit -m "feat(debugging): package systematic root-cause workflow"
```

---

### Task 5: 让六阶段 Skill 只引用包内能力

**Files:**
- Modify: `skills/shadow-dev-propose/SKILL.md`
- Modify: `skills/shadow-dev-discuss/SKILL.md`
- Modify: `skills/shadow-dev-apply/SKILL.md`
- Modify: `skills/shadow-dev-review/SKILL.md`
- Modify: `skills/shadow-dev-archive/SKILL.md`
- Modify: `skills/shadow-dev-commit/SKILL.md`
- Modify: `skills/shadow-dev-workflow/SKILL.md`
- Modify: `skills/shadow-dev-workflow/references/agent-loop-protocol.md`
- Modify: `skills/shadow-dev-workflow/references/legacy-markdown/*.md`
- Test: `tests/package-contract.test.mjs`

- [ ] **Step 1: 更新阶段调用名称**

阶段 Skill 使用以下包内名称：

```text
brainstorming
writing-plans
using-git-worktrees
test-driven-development
dispatching-parallel-agents
subagent-driven-development
verification-before-completion
receiving-code-review
systematic-debugging
```

平台不支持 invoke 时，按 `core/capabilities.md` 读取对应模块。

- [ ] **Step 2: 暂时保留 UI/UX 协议占位但移除外部 Skill 调用**

`shadow-dev-discuss` 和 workflow 总入口先改为：

```text
当 UI/UX 条件命中时，执行内置 UI/UX 检索协议；Phase 4 完成前如果知识库未就绪，记录 required input，不调用外部技能。
```

禁止出现 `ui-ux-pro-max`。

- [ ] **Step 3: 清理 legacy references**

legacy 文档只能引用包内短名称，并在顶部标记：

```markdown
> Deprecated reference. Runtime behavior is defined by core/ and current phase SKILL.md files.
```

- [ ] **Step 4: 启用仓库级合同测试**

移除 Task 3 添加的 `test.skip`，让全仓库外部依赖扫描成为正式测试。

- [ ] **Step 5: 验证全部外部 Skill 引用归零**

Run:

```bash
node --test tests/package-contract.test.mjs
node scripts/validate-package.mjs --root . --json
```

Expected: tests passed；CLI 输出 `passed: true`。

- [ ] **Step 6: 提交**

```bash
git add skills/shadow-dev-* tests/package-contract.test.mjs
git commit -m "refactor(workflow): route all phases through packaged skills"
```

---

## Phase 3：内置单 Agent Code Review

### Task 6: 定义 Review checklist、finding 与 report 合同

**Files:**
- Create: `references/review/checklist.md`
- Create: `references/review/finding-contract.md`
- Create: `references/review/universal-prevention-rules.md`
- Create: `references/review/review-report.schema.json`
- Create: `scripts/validate-review-report.mjs`
- Create: `tests/review-report.test.mjs`
- Create: `tests/fixtures/review-report/pass.yaml`
- Create: `tests/fixtures/review-report/missing-failure-scenario.yaml`
- Create: `tests/fixtures/review-report/duplicate-root-cause.yaml`

- [ ] **Step 1: 写失败测试**

覆盖：

```js
test('accepts an empty passing review report', ...)
test('rejects findings without failureScenario', ...)
test('rejects unsupported severity', ...)
test('rejects duplicate findings for the same root cause', ...)
test('requires bug prevention candidates to declare scope', ...)
```

Run:

```bash
node --test tests/review-report.test.mjs
```

Expected: FAIL，校验器不存在。

- [ ] **Step 2: 创建 finding contract**

`finding-contract.md` 明确必填字段：

```yaml
severity: blocker | high | medium | low
category: correctness | security | performance | contract | test | maintainability
file: relative/path
line: positive integer
summary: concise defect
failureScenario: concrete input/state -> wrong result
evidence: changed code evidence
suggestion: minimum fix direction
rootCauseKey: stable dedup key
```

禁止“建议增加错误处理”“可能存在性能问题”等无证据描述。

- [ ] **Step 3: 创建 checklist 和通用规则文件**

checklist 包含八个核心维度及按 diff 启用的 UI、framework、database、deployment 专项。`universal-prevention-rules.md` 初始只包含格式说明和空规则列表，不预置未经用户确认的规则。

- [ ] **Step 4: 创建 schema 和最小 YAML 校验器**

`review-report.schema.json` 用 JSON Schema 表达结构；`validate-review-report.mjs` 使用 `scripts/lib/simple-yaml.mjs`（Task 12 会完善；本任务先实现 report 所需子集）解析报告并校验字段、enum、行号和 rootCauseKey 唯一性。

CLI：

```bash
node scripts/validate-review-report.mjs <review-report.yaml> --json
```

- [ ] **Step 5: 运行测试**

```bash
node --test tests/review-report.test.mjs
```

Expected: 5 tests passed。

- [ ] **Step 6: 提交**

```bash
git add references/review scripts/validate-review-report.mjs scripts/lib/simple-yaml.mjs \
  tests/review-report.test.mjs tests/fixtures/review-report
git commit -m "feat(review): define high-confidence finding contract"
```

---

### Task 7: 重写 shadow-dev-review 为单 Agent diff-only 流程

**Files:**
- Modify: `skills/shadow-dev-review/SKILL.md`
- Create: `skills/shadow-dev-review/review-agent-prompt.md`
- Create: `skills/shadow-dev-review/review-report-template.yaml`
- Modify: `skills/receiving-code-review/SKILL.md`

- [ ] **Step 1: 编写 Review Agent prompt**

prompt 明确：

```text
Input: git diff, requirement summary, minimal context, project review rules, matched universal rules.
Use one pass for eight dimensions.
Return only high-confidence findings.
Every finding must include concrete failureScenario and evidence from the diff.
Do not report style preferences, existing unrelated issues, or speculative risks.
```

- [ ] **Step 2: 重写 Review 阶段流程**

固定六步：

```text
1. Determine committed + uncommitted diff
2. Read proposal/spec/design/tasks and minimal context
3. Run installed verification commands only
4. Launch at most one Review Agent
5. Verify/deduplicate findings inline
6. Write review-report.yaml and concise user report
```

删除多 Agent、多维并行、外部 simplify 和空章节报告。

- [ ] **Step 3: 实现 Bug 模式**

读取 `.openspec.yaml type`：

- `P`：普通 Review；
- `B`：要求 root cause、regression verification、Why Existing Review Missed It；缺失即 blocked。

Bug 候选规则只进入 `preventionRuleCandidates`，状态默认 `pending-user-approval`。

- [ ] **Step 4: 更新 review feedback Skill**

`receiving-code-review` 只处理已经通过 finding contract 的意见；修改后重新运行 verification 并更新 report，不重新启动多 Agent。

- [ ] **Step 5: 静态验证单 Agent 约束**

Run:

```bash
COUNT=$(grep -c 'spawn_agent\|Agent(' skills/shadow-dev-review/SKILL.md || true); test "$COUNT" -le 1
! grep -R -nE 'simplify|code-review|parallel.*Agent|four.*Agent|4.*Agent' skills/shadow-dev-review
```

Expected: exit 0。

- [ ] **Step 6: 验证模板**

```bash
node scripts/validate-review-report.mjs skills/shadow-dev-review/review-report-template.yaml --json
```

Expected: `passed: true`。

- [ ] **Step 7: 提交**

```bash
git add skills/shadow-dev-review skills/receiving-code-review
git commit -m "feat(review): use one diff-only high-confidence reviewer"
```

---

### Task 8: 实现 Bug 防复发规则候选与归档同步

**Files:**
- Modify: `skills/shadow-dev-archive/SKILL.md`
- Modify: `core/bug-prevention-protocol.md`
- Modify: `scripts/lib/openspec.mjs`（Task 12 完成基础实现后回填此步骤；若按顺序执行，本任务先定义纯函数文件）
- Create: `scripts/lib/prevention-rules.mjs`
- Create: `tests/prevention-rules.test.mjs`
- Create: `tests/fixtures/prevention-rules/project-report.yaml`
- Create: `tests/fixtures/prevention-rules/universal-report.yaml`

- [ ] **Step 1: 写规则分类失败测试**

```js
test('syncs accepted project rules to code-review spec', ...)
test('syncs accepted universal rules to package references', ...)
test('ignores pending and rejected candidates', ...)
test('deduplicates rules by name', ...)
```

Expected: 初次运行 FAIL。

- [ ] **Step 2: 实现规则分类纯函数**

导出：

```js
export function acceptedPreventionRules(report) {
  return report.preventionRuleCandidates.filter((rule) => rule.status === 'accepted')
}

export function renderProjectReviewRequirements(rules) { ... }
export function mergeUniversalRules(markdown, rules) { ... }
```

项目规则渲染为 GIVEN/WHEN/THEN；通用规则保留 YAML code block 和解释。

- [ ] **Step 3: 更新 archive Skill**

Archive 在执行同步前：

1. 读取 `review-report.yaml`；
2. 只选 `accepted` 候选；
3. `scope: project` 同步到项目 `openspec/specs/code-review/spec.md`；
4. `scope: universal` 同步到包内 reference；
5. 更新 INDEX；
6. 未确认规则不写入。

- [ ] **Step 4: 运行测试**

```bash
node --test tests/prevention-rules.test.mjs
```

Expected: 4 tests passed。

- [ ] **Step 5: 提交**

```bash
git add skills/shadow-dev-archive core/bug-prevention-protocol.md \
  scripts/lib/prevention-rules.mjs tests/prevention-rules.test.mjs tests/fixtures/prevention-rules
git commit -m "feat(review): persist approved bug prevention rules"
```

---

## Phase 4：内置 UI/UX

### Task 9: 迁移 UI/UX 知识库并建立来源清单

**Files:**
- Create: `references/ui-ux/data/*.csv`
- Create: `references/ui-ux/stacks/*.csv`
- Create: `references/ui-ux/SOURCES.md`
- Source: `/Users/wuhong/.claude/skills/ui-ux-pro-max/data/*.csv`
- Source: `/Users/wuhong/.claude/skills/ui-ux-pro-max/data/stacks/*.csv`

- [ ] **Step 1: 复制知识数据**

复制以下数据集并保持原列名：

```text
charts.csv
colors.csv
landing.csv
products.csv
prompts.csv
styles.csv
typography.csv
ux-guidelines.csv
stacks/*.csv
```

不要复制 Python 脚本、`__pycache__` 或外部 Skill 文件。

- [ ] **Step 2: 创建来源和许可清单**

`SOURCES.md` 记录：

```markdown
# UI/UX Knowledge Sources

- Source: local ui-ux-pro-max installation
- Imported datasets: ...
- Import date: 2026-07-26
- Runtime dependency: none
- Python source code was not imported
```

若上游数据许可证无法确认，本任务阻塞发布，必须在 SOURCES 中记录明确许可后才能继续。

- [ ] **Step 3: 校验文件完整性**

Run:

```bash
test -f references/ui-ux/data/products.csv
test -f references/ui-ux/data/ux-guidelines.csv
test -f references/ui-ux/stacks/nextjs.csv
! find references/ui-ux -name '*.py' -o -name '__pycache__'
```

Expected: exit 0。

- [ ] **Step 4: 提交**

```bash
git add references/ui-ux
git commit -m "feat(uiux): vendor searchable design knowledge data"
```

---

### Task 10: 实现 Node.js UI/UX 搜索

**Files:**
- Create: `scripts/lib/csv.mjs`
- Create: `scripts/lib/search.mjs`
- Create: `scripts/uiux-search.mjs`
- Create: `tests/uiux-search.test.mjs`
- Create: `tests/fixtures/uiux-search/sample.csv`

- [ ] **Step 1: 写 CSV 解析失败测试**

覆盖 quoted commas、escaped quotes、CRLF、空字段：

```js
test('parses quoted CSV fields without dependencies', ...)
```

- [ ] **Step 2: 写检索失败测试**

覆盖：

```js
test('ranks exact keyword matches before partial matches', ...)
test('limits results', ...)
test('returns compact JSON', ...)
test('returns fallback keywords when no result matches', ...)
```

Run:

```bash
node --test tests/uiux-search.test.mjs
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 CSV parser**

`scripts/lib/csv.mjs` 导出：

```js
export function parseCsv(text) { ... }
```

状态机只处理 RFC 4180 所需的 comma、quote、CRLF，不引入第三方包。

- [ ] **Step 4: 实现评分函数**

`scripts/lib/search.mjs` 导出：

```js
export function tokenize(value) { ... }
export function scoreRecord(record, terms) { ... }
export function searchRecords(records, query, limit) { ... }
```

评分：完整短语命中 10 分、所有 term 命中 5 分、单 term 命中 1 分；同分按原数据顺序。

- [ ] **Step 5: 实现 CLI**

支持：

```text
<keyword>
--domain product|style|typography|color|landing|chart|ux|prompt
--stack <name>
--preset <name>
-n <1-20>
--root <repo-root>
```

输出：

```json
{"query":"...","source":"...","results":[],"fallbackKeywords":[]}
```

- [ ] **Step 6: 运行测试和真实查询**

```bash
node --test tests/uiux-search.test.mjs
node scripts/uiux-search.mjs "portfolio editorial" --domain style -n 3
node scripts/uiux-search.mjs "responsive accessibility" --stack nextjs -n 3
```

Expected: tests passed；两条查询返回合法 JSON 且 results 非空。

- [ ] **Step 7: 提交**

```bash
git add scripts/lib/csv.mjs scripts/lib/search.mjs scripts/uiux-search.mjs \
  tests/uiux-search.test.mjs tests/fixtures/uiux-search
git commit -m "feat(uiux): add dependency-free Node search"
```

---

### Task 11: 提取 wuh-site preset 并接入 discuss

**Files:**
- Create: `references/ui-ux/presets/wuh-site/identity.md`
- Create: `references/ui-ux/presets/wuh-site/tokens.md`
- Create: `references/ui-ux/presets/wuh-site/typography.md`
- Create: `references/ui-ux/presets/wuh-site/components.md`
- Create: `references/ui-ux/presets/wuh-site/motion.md`
- Create: `references/ui-ux/presets/wuh-site/responsive.md`
- Create: `references/ui-ux/checklists/visual-quality.md`
- Create: `references/ui-ux/checklists/interaction.md`
- Create: `references/ui-ux/checklists/responsive.md`
- Create: `references/ui-ux/checklists/accessibility.md`
- Modify: `skills/shadow-dev-discuss/SKILL.md`
- Modify: `scripts/uiux-search.mjs`
- Test: `tests/uiux-search.test.mjs`
- Source project: `/Users/wuhong/shadow-desktop/github/x.wuh.site`

- [ ] **Step 1: 定向检索 x.wuh.site 设计来源**

只读取以下已知规范和实现入口，不全仓扫描：

```text
openspec/specs/design-system/spec.md
openspec/specs/icon-system/spec.md
openspec/specs/blog-detail/spec.md
packages/wuh.site.next/app/styles/**
packages/wuh.site.next/app/layout.tsx
packages/components/icons/** public exports
```

如路径变化，先搜索对应关键词并列出替代文件，再读取最小文件集。

- [ ] **Step 2: 编写 preset**

六个文件分别定义：

- identity：editorial、纸张风、酒红/素雅主题定位；
- tokens：三层 CSS variables 和主题复用规则；
- typography：标题、正文、元信息和代码排版；
- components：优先复用组件库、Outline 图标和状态设计；
- motion：150–300ms、禁止布局位移、`prefers-reduced-motion`；
- responsive：320/768/1024/1440、无横向滚动和 fixed 遮挡。

不得复制业务代码；只记录设计合同和来源路径。

- [ ] **Step 3: 编写通用 checklist**

四个 checklist 保留原 UI/UX 包中的完整视觉、交互、响应式、无障碍要求，并删除 Tailwind 专属假设；技术栈特例从 stack 搜索结果读取。

- [ ] **Step 4: 添加 preset 自动识别测试**

```js
test('detects wuh-site from project directory name', ...)
test('detects wuh-site from CLAUDE.md', ...)
test('explicit preset overrides auto detection', ...)
```

- [ ] **Step 5: 实现自动识别**

`uiux-search.mjs` 检查：

```text
basename(root) === x.wuh.site
CLAUDE.md contains project heading x.wuh.site
package metadata contains wuh.site
```

优先级：explicit preset > auto preset > domain search。

- [ ] **Step 6: 接入 discuss**

`shadow-dev-discuss` 在 UI/UX 条件命中时执行最少查询：

```text
1 product
1 style
1 stack
1 UX/accessibility
optional preset
```

将结果综合进 design.md 的“UI/UX 设计约束”，不把原始完整 JSON 粘贴进制品。

- [ ] **Step 7: 验证**

```bash
node --test tests/uiux-search.test.mjs
node scripts/uiux-search.mjs --root /Users/wuhong/shadow-desktop/github/x.wuh.site --preset auto
! grep -R -n 'ui-ux-pro-max' skills references scripts
```

Expected: tests passed；返回 `preset: wuh-site`；grep exit 0。

- [ ] **Step 8: 提交**

```bash
git add references/ui-ux/presets references/ui-ux/checklists \
  skills/shadow-dev-discuss/SKILL.md scripts/uiux-search.mjs tests/uiux-search.test.mjs
git commit -m "feat(uiux): embed wuh-site aware discuss guidance"
```

---

## Phase 5：OpenSpec Node.js 降级

### Task 12: 实现 simple YAML 与 OpenSpec list/status/instructions

**Files:**
- Modify: `scripts/lib/simple-yaml.mjs`
- Create: `scripts/lib/openspec.mjs`
- Create: `scripts/openspec-fallback.mjs`
- Create: `tests/openspec-fallback.test.mjs`
- Create: `tests/fixtures/openspec/blocked/openspec/changes/example/.openspec.yaml`
- Create: `tests/fixtures/openspec/discuss/**`
- Create: `tests/fixtures/openspec/apply/**`
- Create: `tests/fixtures/openspec/review/**`
- Create: `tests/fixtures/openspec/archive/**`

- [ ] **Step 1: 写 simple YAML 测试**

覆盖 workflow 实际使用的：

```text
string/number/boolean/null
nested map
sequence
quoted scalar
multiline literal
```

明确不支持 anchors、aliases、custom tags；遇到时返回清晰错误。

- [ ] **Step 2: 写状态推导失败测试**

```js
test('blocked when proposal or specs are missing', ...)
test('discuss when proposal and specs exist but design/tasks do not', ...)
test('apply when tasks contain unchecked boxes', ...)
test('review when all tasks are checked and no passing report exists', ...)
test('archive when review conclusion is pass', ...)
test('completed when change is under archive', ...)
```

- [ ] **Step 3: 实现 change 扫描和状态推导**

`scripts/lib/openspec.mjs` 导出：

```js
export async function listChanges(root) { ... }
export async function changeStatus(root, name) { ... }
export async function phaseInstructions(root, action, name) { ... }
```

`instructions` 返回：

```json
{
  "phase":"apply",
  "contextFiles":[],
  "writableFiles":[],
  "successCriteria":[],
  "nextPhase":"review",
  "forbiddenActions":[]
}
```

- [ ] **Step 4: 实现 CLI**

支持：

```bash
node scripts/openspec-fallback.mjs list --root <path>
node scripts/openspec-fallback.mjs status --change <name> --root <path>
node scripts/openspec-fallback.mjs instructions --action apply --change <name> --root <path>
```

所有输出为 JSON；错误写 stderr 并使用非零 exit。

- [ ] **Step 5: 运行测试**

```bash
node --test tests/openspec-fallback.test.mjs
```

Expected: 状态与 instructions 测试全部通过。

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/simple-yaml.mjs scripts/lib/openspec.mjs scripts/openspec-fallback.mjs \
  tests/openspec-fallback.test.mjs tests/fixtures/openspec
git commit -m "feat(openspec): add dependency-free status fallback"
```

---

### Task 13: 实现 OpenSpec validate 与 archive

**Files:**
- Modify: `scripts/lib/openspec.mjs`
- Modify: `scripts/openspec-fallback.mjs`
- Modify: `tests/openspec-fallback.test.mjs`
- Create: `tests/fixtures/openspec/invalid-bug/**`
- Create: `tests/fixtures/openspec/archive-with-rules/**`

- [ ] **Step 1: 写 validate 失败测试**

覆盖：

```js
bug missing Root Cause -> fail
bug missing Regression Verification -> fail
spec missing GIVEN/WHEN/THEN -> fail
tasks missing checkbox -> fail
UI/UX change missing design constraints -> fail
```

- [ ] **Step 2: 写 archive 失败测试**

在临时复制的 fixture 中断言：

```text
change moves to openspec/changes/archive/
main domain spec receives approved deltas
accepted project review rules enter openspec/specs/code-review/spec.md
INDEX contains code-review entry
pending candidates are not written
no git files are modified by archive logic
```

- [ ] **Step 3: 实现 validate**

导出：

```js
export async function validateChange(root, name) {
  return { passed, errors, warnings }
}
```

根据 type、UI/UX marker 和固定制品合同执行检查。

- [ ] **Step 4: 实现 archive**

导出：

```js
export async function archiveChange(root, name) {
  return { archivedPath, syncedSpecs, syncedReviewRules, indexUpdated }
}
```

使用临时文件 + rename 保证单文件原子写入；在所有校验通过前不移动目录。禁止执行 shell 或 git。

- [ ] **Step 5: 扩展 CLI**

```bash
node scripts/openspec-fallback.mjs validate --change <name> --root <path>
node scripts/openspec-fallback.mjs archive --change <name> --root <path>
```

- [ ] **Step 6: 运行测试**

```bash
node --test tests/openspec-fallback.test.mjs tests/prevention-rules.test.mjs
```

Expected: 全部通过。

- [ ] **Step 7: 使用真实项目做只读一致性验证**

```bash
node scripts/openspec-fallback.mjs list --root /Users/wuhong/shadow-desktop/github/x.wuh.site
```

若 OpenSpec CLI 可用，对一个活跃变更比较 status；只读检查，不执行 archive。

- [ ] **Step 8: 提交**

```bash
git add scripts/lib/openspec.mjs scripts/openspec-fallback.mjs \
  tests/openspec-fallback.test.mjs tests/fixtures/openspec
git commit -m "feat(openspec): validate and archive without CLI"
```

---

### Task 14: 将六阶段接入 CLI-first fallback

**Files:**
- Modify: `skills/shadow-dev-propose/SKILL.md`
- Modify: `skills/shadow-dev-discuss/SKILL.md`
- Modify: `skills/shadow-dev-apply/SKILL.md`
- Modify: `skills/shadow-dev-review/SKILL.md`
- Modify: `skills/shadow-dev-archive/SKILL.md`
- Modify: `skills/shadow-dev-commit/SKILL.md`
- Modify: `core/degradation-policy.md`

- [ ] **Step 1: 定义统一调用模板**

每个阶段使用：

```text
1. Run the corresponding openspec CLI command.
2. If executable is missing, exits non-zero due to CLI failure, or returns incompatible output, run the packaged Node fallback.
3. Record `{ capability: "openspec", reason, fallback: "node" }` in degradations.
4. Do not install or upgrade OpenSpec automatically.
```

业务校验失败不得误判为 CLI 故障；只有命令不可用、崩溃或输出协议不兼容才降级。

- [ ] **Step 2: 更新各阶段命令映射**

```text
propose/discuss/apply/review/commit -> list/status/instructions/validate
archive -> validate then archive
```

- [ ] **Step 3: 添加静态检查**

Run:

```bash
for file in skills/shadow-dev-{propose,discuss,apply,review,archive,commit}/SKILL.md; do
  grep -q 'openspec-fallback.mjs' "$file" || exit 1
done
```

Expected: exit 0。

- [ ] **Step 4: 提交**

```bash
git add skills/shadow-dev-* core/degradation-policy.md
git commit -m "feat(workflow): fall back when OpenSpec CLI is unavailable"
```

---

## Phase 6：跨平台适配与安装

### Task 15: 定义三个平台适配器

**Files:**
- Create: `adapters/claude-code.md`
- Create: `adapters/codex-cli.md`
- Create: `adapters/gemini-cli.md`
- Create: `tests/adapters.test.mjs`

- [ ] **Step 1: 写能力覆盖失败测试**

每个 adapter 必须声明所有 Core capabilities：

```js
const REQUIRED = [
  'read_file', 'search_files', 'edit_file', 'run_command', 'ask_user',
  'spawn_agent', 'parallel_agents', 'browser_verify', 'invoke_internal_skill',
]
```

测试缺失能力、缺失 fallback 和静默降级。

- [ ] **Step 2: 编写 Claude Code adapter**

说明 plugin/skills、文件工具、Agent、结构化提问和浏览器验证映射。平台专属名称只允许出现在 adapter 中。

- [ ] **Step 3: 编写 Codex adapter**

说明 `AGENTS.md`、skills 目录和原生工具映射；不支持的能力使用 Core fallback。

- [ ] **Step 4: 编写 Gemini adapter**

说明 `GEMINI.md`、skills 和工具映射；Skill 调用不可用时读取内部模块。

- [ ] **Step 5: 运行测试**

```bash
node --test tests/adapters.test.mjs
```

Expected: all adapters cover every capability and fallback。

- [ ] **Step 6: 提交**

```bash
git add adapters tests/adapters.test.mjs
git commit -m "feat(adapters): define Claude Codex and Gemini mappings"
```

---

### Task 16: 实现三个原生安装入口

**Files:**
- Create: `scripts/install/shared.mjs`
- Create: `scripts/install/claude-code.mjs`
- Create: `scripts/install/codex-cli.mjs`
- Create: `scripts/install/gemini-cli.mjs`
- Create: `tests/installers.test.mjs`
- Create: `tests/fixtures/install-target/`

- [ ] **Step 1: 写安装失败测试**

使用临时目录测试：

```js
test('Claude installer copies plugin metadata, skills, core, references, adapters and scripts', ...)
test('Codex installer writes AGENTS.md integration without overwriting existing content', ...)
test('Gemini installer writes GEMINI.md integration without overwriting existing content', ...)
test('installers are idempotent', ...)
test('installers support --dry-run', ...)
```

- [ ] **Step 2: 实现 shared installer**

导出：

```js
export async function install({ platform, sourceRoot, targetRoot, dryRun }) { ... }
```

要求：

- 只复制本包文件；
- 已存在同内容文件跳过；
- 不同内容文件默认报冲突，不覆盖；
- `--force` 才允许覆盖本包管理文件；
- 用户项目的 `AGENTS.md`/`GEMINI.md` 通过带 marker 的区块增量更新；
- 不运行包管理器。

- [ ] **Step 3: 实现三个 CLI 包装器**

统一参数：

```text
--target <path>
--dry-run
--force
--json
```

- [ ] **Step 4: 运行测试**

```bash
node --test tests/installers.test.mjs
```

Expected: all installer tests passed。

- [ ] **Step 5: 运行 dry-run 冒烟测试**

```bash
node scripts/install/claude-code.mjs --target /tmp/shadow-claude --dry-run --json
node scripts/install/codex-cli.mjs --target /tmp/shadow-codex --dry-run --json
node scripts/install/gemini-cli.mjs --target /tmp/shadow-gemini --dry-run --json
```

Expected: 每条输出计划文件列表，不写磁盘。

- [ ] **Step 6: 提交**

```bash
git add scripts/install tests/installers.test.mjs tests/fixtures/install-target
git commit -m "feat(install): add native setup for three agent platforms"
```

---

### Task 17: 更新插件元数据、README 和全局规则

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `rules/behavior.md`（仅当需要说明平台降级；否则不改）
- Modify: `rules/iron-laws.md`

- [ ] **Step 1: 更新插件描述和主版本**

plugin description 改为：

```text
Self-contained six-stage OpenSpec workflow with packaged planning, TDD, debugging, review, UI/UX guidance, and cross-platform adapters.
```

主版本升级到 `6.0.0`，marketplace metadata 同步。

- [ ] **Step 2: 重写 README 安装部分**

明确三个入口：

```text
Claude Code plugin install
Codex native installer
Gemini native installer
```

依赖表只保留 Node.js 20+；OpenSpec CLI 和 `gh` 按功能标记为 optional/conditional。说明 Python 非必需、OpenSpec fallback 和平台降级。

- [ ] **Step 3: 更新内置技能清单**

列出九个内部能力并说明不需安装外部 Skills。删除 “superpowers 技能”措辞。

- [ ] **Step 4: 更新 CLAUDE.md 触发表**

Bug 使用 `systematic-debugging`；UI/UX 由 discuss 内置处理，不再列出外部 Skill。

- [ ] **Step 5: 文档引用验证**

Run:

```bash
! grep -R -nE 'superpowers:|ui-ux-pro-max|debugging-workflow|external simplify|external code-review' \
  README.md CLAUDE.md rules .claude-plugin skills core adapters references scripts \
  --exclude='SOURCES.md'
```

Expected: exit 0。

- [ ] **Step 6: 提交**

```bash
git add .claude-plugin README.md CLAUDE.md rules
git commit -m "docs: publish self-contained cross-platform workflow v6"
```

---

## Phase 7：完整验证和迁移清理

### Task 18: 增加场景 Fixtures 和端到端合同测试

**Files:**
- Create: `tests/workflow-scenarios.test.mjs`
- Create: `tests/fixtures/scenarios/feature-happy-path/**`
- Create: `tests/fixtures/scenarios/bug-missing-root-cause/**`
- Create: `tests/fixtures/scenarios/bug-with-prevention-rule/**`
- Create: `tests/fixtures/scenarios/uiux-wuh-site/**`
- Create: `tests/fixtures/scenarios/openspec-cli-unavailable/**`
- Create: `tests/fixtures/scenarios/platform-degradation/**`

- [ ] **Step 1: 定义场景断言**

```js
feature happy path -> archive state
bug missing root cause -> review blocked
bug accepted project rule -> archive writes code-review spec
wuh-site project -> UI/UX preset detected
CLI unavailable -> Node fallback with degradation entry
browser unavailable -> workflow continues with mark_unverified
```

- [ ] **Step 2: 写失败测试并确认失败**

```bash
node --test tests/workflow-scenarios.test.mjs
```

Expected: FAIL，因为场景 runner 尚未实现。

- [ ] **Step 3: 实现场景 runner**

在测试文件内组合公开的纯函数：

```text
changeStatus
validateChange
validateReviewReport
acceptedPreventionRules
uiux preset detection
adapter fallback lookup
```

不模拟 LLM，不依赖联网工具。

- [ ] **Step 4: 运行场景测试**

```bash
node --test tests/workflow-scenarios.test.mjs
```

Expected: 6 scenarios passed。

- [ ] **Step 5: 提交**

```bash
git add tests/workflow-scenarios.test.mjs tests/fixtures/scenarios
git commit -m "test(workflow): cover cross-platform lifecycle scenarios"
```

---

### Task 19: 删除废弃引用并运行完整验证

**Files:**
- Delete only if no references remain: `skills/shadow-dev-workflow/references/legacy-markdown/*.md`
- Modify: `scripts/update.sh`（如其安装逻辑与新 installer 冲突）
- Modify: `README.md`（仅根据验证结果修正命令）

- [ ] **Step 1: 查引用后决定 legacy 文件**

Run:

```bash
grep -R -n 'legacy-markdown' . --exclude-dir=.git
```

如果只有 legacy 自引用或无引用，删除整个目录；如果仍有有效引用，迁移调用方到 Core 后再删除。不得先删后猜。

- [ ] **Step 2: 检查 update.sh**

如果脚本复制旧目录或要求外部技能，改为调用 `scripts/install/claude-code.mjs`；否则保持不动。

- [ ] **Step 3: 运行完整 Node 测试**

```bash
node --test tests/*.test.mjs
```

Expected: 0 failures。

- [ ] **Step 4: 运行包合同和制品检查**

```bash
node scripts/validate-package.mjs --root . --json
git diff --check
```

Expected: `passed: true`；diff check exit 0。

- [ ] **Step 5: 执行三个安装器真实临时目录冒烟测试**

```bash
TMP_ROOT=$(mktemp -d)
node scripts/install/claude-code.mjs --target "$TMP_ROOT/claude" --json
node scripts/install/codex-cli.mjs --target "$TMP_ROOT/codex" --json
node scripts/install/gemini-cli.mjs --target "$TMP_ROOT/gemini" --json
node scripts/validate-package.mjs --root "$TMP_ROOT/claude" --json
```

Expected: 三次安装成功；Claude 安装产物通过合同检查。测试完成后删除仅由本步骤创建的 `TMP_ROOT`。

- [ ] **Step 6: 验证仓库状态和提交范围**

```bash
git status --short
git diff --stat main...HEAD
```

Expected: 只有本计划相关文件；无生成缓存、Python `__pycache__` 或临时 fixture 输出。

- [ ] **Step 7: 提交清理**

```bash
git add -A
git commit -m "chore: remove deprecated workflow dependencies"
```

---

### Task 20: 最终 Review 与发布准备

**Files:**
- Modify: `docs/superpowers/specs/2026-07-26-standalone-cross-platform-workflow-design.md`（仅实际实现与设计不同且经确认时）
- Create: `docs/releases/6.0.0.md`

- [ ] **Step 1: 使用新内置 Review 审查自身 diff**

输入范围：

```bash
git diff main...HEAD
git diff HEAD
```

最多启动一个 Review Agent；只报告满足 finding contract 的问题。将结果写入临时 `review-report.yaml` 并通过：

```bash
node scripts/validate-review-report.mjs review-report.yaml --json
```

- [ ] **Step 2: 修复阻塞 finding 并重新验证**

每个修复必须运行对应 targeted test；随后重新运行：

```bash
node --test tests/*.test.mjs
node scripts/validate-package.mjs --root . --json
git diff --check
```

Expected: 全部通过。

- [ ] **Step 3: 编写发布说明**

`docs/releases/6.0.0.md` 必须包含：

- 外部 Skill 依赖移除；
- 内置 Review 行为变化；
- Bug 防复发规则；
- UI/UX 与 `wuh-site` preset；
- OpenSpec fallback；
- 三个平台安装方式；
- breaking changes 和迁移说明。

- [ ] **Step 4: 最终提交**

```bash
git add docs/releases/6.0.0.md
git commit -m "docs(release): prepare standalone workflow 6.0.0"
```

- [ ] **Step 5: 最终证据**

Run:

```bash
node --test tests/*.test.mjs
node scripts/validate-package.mjs --root . --json
git diff --check
git status --short
```

Expected:

```text
all tests pass
package contract passed: true
git diff --check exit 0
working tree clean
```

不 push、不创建 PR，除非用户在 commit 阶段明确要求。
