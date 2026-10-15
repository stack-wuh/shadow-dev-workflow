---
{
  "schema": "shadow-dev/v1",
  "name": "20261015-feature-tdd-debug-skills",
  "type": "feature",
  "scope": "shadow-dev-workflow/skills",
  "status": "published",
  "baseBranch": "main",
  "branch": null,
  "files": [
    ".gitignore",
    "CLAUDE.md",
    "README.md",
    "shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md",
    "skills/shadow-dev-debug/SKILL.md",
    "skills/shadow-dev-tdd/SKILL.md",
    "skills/shadow-dev-tdd/implementer-prompt.md",
    "skills/shadow-dev-tdd/scripts/plan-graph",
    "skills/shadow-dev-tdd/scripts/review-package",
    "skills/shadow-dev-tdd/scripts/task-brief",
    "skills/shadow-dev-tdd/scripts/task-worktree",
    "skills/shadow-dev-tdd/scripts/tdd-workspace",
    "skills/shadow-dev-tdd/task-reviewer-prompt.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 67,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/67",
    "pullRequest": 68,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/68"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "3e6d26243d7ad31c601b6078af7406aa47d7e656",
    "verifiedAt": "2026-10-15T06:26:49.896Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:68",
    "planHash": "bd8470512fac4adcd7b02540b0f482a0dae03942b59448c313e61cfecba4e08b",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] 新增 shadow-dev-tdd 计划执行调度与 shadow-dev-debug 根因调查技能",
      "titleRaw": "[feature] 新增 shadow-dev-tdd 计划执行调度与 shadow-dev-debug 根因调查技能",
      "supplement": "",
      "body": "## 动机\n三件事共同触发本次技能族演进：①TDD 计划执行的调度器（原 `subagent-driven-development`）墙钟时间被串行模型拖长——审查独占流水线、独立任务不并行、低风险任务也付完整审查轮次；②技能族基准收敛为 `shadow-dev-*`，替代件必须落进本仓库随插件分发，而不是留在用户级技能目录；③「系统调试」在技能表中没有承接者（`systematic-debugging` 磁盘不存在），需以仓库既有调试纪律为锚补齐。用户 2026-10-15 逐项裁定四个优化方向与替换动作，并明示所有处理只落在本仓库。\n\n## 引用规范\n- `rules/iron-laws.md`\n  - 当前结论: 渐进式加载与验证强度按评级匹配；未根因即改代码属 review 驳回项\n  - 适用 scope: `skills/`、本 change 的「结果」段取证\n- `norms/verification.md`\n  - 当前结论: M 级 = 冒烟 + 被触及不变量各一个观察点 + 走查；调试按 `knowledge/bug-investigation.md` 在单一上下文追根因\n  - 适用 scope: 两个新技能的方法论正文与取证\n\n## 决策\n- **选型:** 两个技能都作为独立 `skills/<name>/` 目录随插件分发；调度脚本住 `scripts/` 子目录（先例：worktree 集成同款布局）；TDD 纪律按 `norms/verification.md` 分级制定位（断言优先为可选取证策略，提交前全量套件绿是本流程的任务级门槛），不触 CI 禁项措辞、不使用已被制度占用的「SDD」缩写指代本技能。\n- **对比方案:** ①继续留在用户级技能目录改英文版（否——用户明示以 `shadow-dev-*` 为基准）；②新建 `shadow-dev-sdd` 命名（否——SDD 已被规格驱动开发占用，会撞名）；③把调试能力并入 `shadow-dev-apply`（否——apply 是 brief 执行流程，调试是跨流程的调查态技能）。\n- **明确不做:** 不补装 `test-driven-development` 技能（磁盘不存在；TDD 纪律由 implementer 模板的 RED/GREEN 证据契约承载，SKILL.md 已注明该技能可缺省）；不动 `requiresCommands` 与版本 pin；不触碰 `.coo` 侧其它技能。\n\n## 任务\n- [ ] task-1 — `skills/shadow-dev-tdd/**` — 调度技能落盘（SKILL + 双模板 + 5 脚本），scripts 冒烟通过\n- [ ] task-2 — `skills/shadow-dev-debug/SKILL.md` — 根因调查技能落盘（8 步流程 + 红线），与既有调试纪律锚定\n- [ ] task-3 — `README.md,CLAUDE.md,.gitignore` — 技能族清单、触发表与忽略项同步\n- [ ] task-4 — 观察点取证 — 门禁六项 + 脚本冒烟 + RED/GREEN 验证记录\n\n完整 brief：shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261015-feature-tdd-debug-skills\",\"type\":\"feature\",\"scope\":\"shadow-dev-workflow/skills\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md\",\"cliVersion\":\"1.7.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "feature"
      ]
    },
    "release": {
      "files": [
        ".gitignore",
        "CLAUDE.md",
        "README.md",
        "shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md",
        "skills/shadow-dev-debug/SKILL.md",
        "skills/shadow-dev-tdd/SKILL.md",
        "skills/shadow-dev-tdd/implementer-prompt.md",
        "skills/shadow-dev-tdd/scripts/plan-graph",
        "skills/shadow-dev-tdd/scripts/review-package",
        "skills/shadow-dev-tdd/scripts/task-brief",
        "skills/shadow-dev-tdd/scripts/task-worktree",
        "skills/shadow-dev-tdd/scripts/tdd-workspace",
        "skills/shadow-dev-tdd/task-reviewer-prompt.md"
      ],
      "message": "feat(skills): 新增 shadow-dev-tdd 与 shadow-dev-debug 技能",
      "title": "feat(skills): 新增 shadow-dev-tdd 与 shadow-dev-debug 技能",
      "body": "## 变更\n- `skills/shadow-dev-tdd/`（新增）：计划执行调度技能——波次并行、审查重叠、分级审查、测试提速纪律四机制，含 `implementer-prompt.md` 与 `task-reviewer-prompt.md` 两份派发模板和 5 个调度脚本（`plan-graph`、`task-worktree`、`review-package`、`task-brief`、`tdd-workspace`）。\n- `skills/shadow-dev-debug/SKILL.md`（新增）：根因调查技能——复现固定、假设至少两个逐个实验证伪、最小修复、同源扫描、同上下文回归的 8 步流程与 8 条红线，锚定 `norms/verification.md` 调试节与 `knowledge/bug-investigation.md`。\n- `README.md`、`CLAUDE.md`：技能族清单与触发表补两个技能（含与 apply 并列不互替的边界说明）；`.gitignore`：`.tdd/` 工作区忽略项。\n- `shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md`：本 change 载体（M 级，5 个观察点闭合）。\n\n## 影响\n- 行为/触发面变化：独立 plan 的执行获得调度技能（原用户级 `subagent-driven-development` 退役，替代件随插件分发）；Bug 调查获得根因流程技能，未根因即改代码的修复仍按既有纪律 review 驳回。\n- 明确不受影响的范围：不改 CLI 命令面、不改任何 `scripts/` 门判定集、不动 `requiresCommands` 与 `cliVersion` pin（v1.7.0）；`shadow-dev-apply`、`shadow-dev-hotfix` 主流程不变。\n- 存量交叠（明说）：与休眠在途 change `20261010-build-quality-gate`、`20261010-refactor-domain-driven-workflow` 在 `CLAUDE.md`/`README.md` 声明文件集有交叠（两者均无 PR、被 brief 契约门豁免）；本 PR 为两行增量，后续其推进时留意合入即可。\n- 回滚方式：revert 本 PR 即移除两个技能目录与三处文档增量；无跨仓副作用。\n\n## 验证\n- `npm run check:knowledge -- --forbid 'tdd-verification,▶ [TDD],既有测试保持绿,测试总数,相关测试,或 CI 全绿链接'`（与 `quality-gate.yml:56` 同源）→ `技能 11 个` 校验通过、6 个废弃 token 零命中、引用扫描 66 文件零死链，`ok=12 warn=15 fail=0`。\n- `npm run check:requires:strict` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；`npm run check:version` → 三处 manifest 同源 7.1.1；`npm run check:brief` → 4 份在途 brief 契约全绿。\n- `npm test` → 30/30 通过；`npm run check:smoke` → `checks=4 fail=0 deferred=1`。\n- 调度脚本在临时 git 仓冒烟：波次渲染、scope 重叠拒绝（exit 4）、未知任务拒绝（exit 3）、worktree 生命周期、pathspec 审查包排除兄弟提交全过——并修复 `review-package` 的 `--` 解析真 bug。\n- 两个技能各留 RED/GREEN 验证记录（含「无技能对照直接成功」的诚实定位修正），详见 brief「结果」段。\n- 未覆盖项（明说）：`check:smoke` 离线物化腿本机 deferred（CLI 的 `bash -c tar` Windows 反斜杠路径缺陷，已登记 shadow-dev-cli），三平台矩阵判定交给本 PR 的 Actions。\n\n## 关联\n- Closes #67\n- brief: shadow-docs/changes/20261015-feature-tdd-debug-skills/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": "knowledge/bug-investigation.md",
    "reason": "两个新技能是既有结论的执行形态载体（单一上下文根因调查、分级验证制），不改变跨项目结论；技能自述与 frontmatter 门禁承载执行细节，卡片不重复散文"
  }
}
---

# 20261015-feature-tdd-debug-skills

## 复杂度评级
- **评级:** M
- **理由:** ①只改技能文本与调度脚本，不改 CLI 命令面、不改任何 `scripts/` 门判定集、不动 `cliVersion` pin；②触及面跨 2 个技能（1 个含 5 个调度脚本与 2 份派发模板）+ 3 处仓级文档 + brief，属可发现性中等的技能族演进；③新建的是技能与调度脚本，不是套件断言文件，故不升 L。
- **期望验证深度:** code-read

## 领域模型

- **限界上下文:** `workflow-governance` — 技能族演进、执行调度模型与既有规范的对齐。上游：`norms/verification.md` 的分级验证制与 `knowledge/bug-investigation.md` 的单一上下文约束；下游：独立 plan 场景的调度执行与 Bug 调查场景。反腐边界：不改 `requiresCommands`、不改 `cliVersion` pin、不改任何 `scripts/` 门判定集。
- **统一语言增量:**
  - **波次（wave）**：文件 scope 不相交、无声明依赖、无共享独占资源的 task 并行分组；scope 判不出的任务单任务波串行，禁止靠猜制造并行。
  - **审查分级（review tier）**：`review`/`deferred` 两档决定是否派独立审查者；deferred 由 scope 对账 + 全分支终审兜底；鉴权、资金、并发、共享状态、公共契约永不 deferred。
  - **根因流程**：复现固定 → 假设清单（≥2）→ 最小实验逐个证伪 → 根因解释全部症状 → 最小修复 → 同源扫描 → 同上下文回归；未根因就改代码 review 直接驳回。
- **被触及既有不变量:**
  - `check-knowledge` 技能清单：每个 `skills/<dir>/SKILL.md` 必有 `name` + `description`，且 name 与目录同名。
  - CI 废弃 token 扫描的覆盖集含 `skills/*/SKILL.md`：6 个禁项串零命中。
  - `check:requires` 严格门：skills ⊆ requiresCommands ⊆ CLI 命令目录——新技能不引入未声明的 CLI 命令依赖。
  - 仓库引用死链归零：新技能与文档引用的仓内路径全部真实存在。

## 引用规范
- `rules/iron-laws.md`
  - 当前结论: 渐进式加载与验证强度按评级匹配；未根因即改代码属 review 驳回项
  - 适用 scope: `skills/`、本 change 的「结果」段取证
- `norms/verification.md`
  - 当前结论: M 级 = 冒烟 + 被触及不变量各一个观察点 + 走查；调试按 `knowledge/bug-investigation.md` 在单一上下文追根因
  - 适用 scope: 两个新技能的方法论正文与取证

## 动机

三件事共同触发本次技能族演进：①TDD 计划执行的调度器（原 `subagent-driven-development`）墙钟时间被串行模型拖长——审查独占流水线、独立任务不并行、低风险任务也付完整审查轮次；②技能族基准收敛为 `shadow-dev-*`，替代件必须落进本仓库随插件分发，而不是留在用户级技能目录；③「系统调试」在技能表中没有承接者（`systematic-debugging` 磁盘不存在），需以仓库既有调试纪律为锚补齐。用户 2026-10-15 逐项裁定四个优化方向与替换动作，并明示所有处理只落在本仓库。

## 覆盖范围

- `skills/shadow-dev-tdd/`（新增）：计划执行调度技能——SKILL.md（波次并行 / 审查重叠 / 分级审查 / 测试提速纪律）、`implementer-prompt.md` 与 `task-reviewer-prompt.md`（含兄弟任务安全契约与冻结 diff 说明）、5 个调度脚本（`task-brief` / `tdd-workspace` / `plan-graph` / `task-worktree` / `review-package`）。
- `skills/shadow-dev-debug/SKILL.md`（新增）：根因调查技能——8 步流程与红线，锚定 `norms/verification.md` 调试节与 `knowledge/bug-investigation.md`（引用不重述）。
- `README.md`：架构树补两行；`CLAUDE.md`：Skill 触发表补两行（含与 apply 并列不互替的边界说明）。
- `.gitignore`：`.tdd/` 工作区（技能运行的暂存目录）忽略项。
- 仓外上下文（不在本 change 文件集）：用户级 `AGENTS.md` 技能表已另行重建为 shadow-dev-* 基准。

## 决策

- **选型:** 两个技能都作为独立 `skills/<name>/` 目录随插件分发；调度脚本住 `scripts/` 子目录（先例：worktree 集成同款布局）；TDD 纪律按 `norms/verification.md` 分级制定位（断言优先为可选取证策略，提交前全量套件绿是本流程的任务级门槛），不触 CI 禁项措辞、不使用已被制度占用的「SDD」缩写指代本技能。
- **对比方案:** ①继续留在用户级技能目录改英文版（否——用户明示以 `shadow-dev-*` 为基准）；②新建 `shadow-dev-sdd` 命名（否——SDD 已被规格驱动开发占用，会撞名）；③把调试能力并入 `shadow-dev-apply`（否——apply 是 brief 执行流程，调试是跨流程的调查态技能）。
- **明确不做:** 不补装 `test-driven-development` 技能（磁盘不存在；TDD 纪律由 implementer 模板的 RED/GREEN 证据契约承载，SKILL.md 已注明该技能可缺省）；不动 `requiresCommands` 与版本 pin；不触碰 `.coo` 侧其它技能。

## 任务
- [x] task-1 — `skills/shadow-dev-tdd/**` — 调度技能落盘（SKILL + 双模板 + 5 脚本），scripts 冒烟通过
- [x] task-2 — `skills/shadow-dev-debug/SKILL.md` — 根因调查技能落盘（8 步流程 + 红线），与既有调试纪律锚定
- [x] task-3 — `README.md,CLAUDE.md,.gitignore` — 技能族清单、触发表与忽略项同步
- [x] task-4 — 观察点取证 — 门禁六项 + 脚本冒烟 + RED/GREEN 验证记录

## 结果

评级 M。取证 = 冒烟 + 被触及不变量各一个观察点 + 走查；全部门禁只作门槛。

- **观察点 A（技能清单门）**：`npm run check:knowledge -- --forbid 'tdd-verification,▶ [TDD],既有测试保持绿,测试总数,相关测试,或 CI 全绿链接'`（与 `quality-gate.yml:56` 同源）→ `[ok] 技能 11 个：name/description 与目录一致性检查完成`，`摘要: ok=12 warn=15 fail=0`。
- **观察点 B（禁项与死链）**：同一门的 6 个废弃 token 零命中（fail=0 即零命中）；`[ok] 引用扫描 66 个文件、路径断言 零死链`（warn 集全部为既有归档来源提示，与本 change 无关）。
- **观察点 C（能力一致性）**：`npm run check:requires:strict` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；`npm run check:version` → `✓ 三处 manifest 版本同源: 7.1.1（3 个文件）`。
- **观察点 D（调度脚本冒烟，临时 git 仓）**：`plan-graph` 合法波次渲染 `wave 1: task 1 task 2 / wave 2: task 3`、同波 scope 重叠拒绝（exit 4）、未知任务拒绝（exit 3）；`task-worktree` 创建 / 重复创建拒绝 / 清理全过；`review-package -- <pathspec>` 正确排除交错提交的兄弟文件（限定包 2 commits 不含 unrelated，全量包 3 commits 含）——冒烟抓出 `--` 解析后多余 `shift` 触发 `set -e` 静默退出的真 bug，修复后重测通过。
- **观察点 E（RED/GREEN 验证，writing-skills 铁律）**：`shadow-dev-tdd` 的 RED 基线（无技能）记录三缺口（并行任务共用工作树不提交、主控自审自判、无 BASE/台账），GREEN 带技能后难点判定正确（无可配的不相交任务时 reviewer 正确单独跑、与在飞任务同 scope 的任务正确后置波次、deferred 占比 2/5 如实记录）；`shadow-dev-debug` 的 RED 基线对照代理直接根因修复（诚实记录：简单夹具上该失败模式对强模型不成立，技能定位为纪律固化与困难场景护栏），GREEN 完整产出 8 步流程证据（3 假设带证伪实验、探针清理、同源双 bug 扫描确认无第三处、双次回归、一句话根因）。
- **门槛**：`npm test` → tests 30 / pass 30 / fail 0；`npm run check:smoke` → `smoke checks=4 fail=0 deferred=1`（离线物化腿本机 deferred，与既有先例同因）；`npm run check:brief` → `✅ brief 契约门：4 份在途 brief 的规格段与对账闭合成立`（`摘要: briefs=4 ok=2 warn=2 fail=0`）。
- **未验证项（明说）**：`check:smoke` 的离线物化腿未在本机跑实（CLI 的 `bash -c tar` 在 Windows 收到反斜杠绝对路径，execution-layer 缺陷已登记 shadow-dev-cli）；三平台矩阵判定交给 PR 的 Actions。
