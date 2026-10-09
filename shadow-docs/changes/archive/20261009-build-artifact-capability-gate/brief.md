---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-build-artifact-capability-gate",
  "type": "build",
  "scope": "plugin-distribution,scripts",
  "status": "archived",
  "baseBranch": "main",
  "branch": "build/20261009-build-artifact-capability-gate",
  "files": [
    "README.md",
    "docs/cli-guide.md",
    "knowledge/distribution-capability-contract.md",
    "menu.md",
    "norms/tdd-verification.md",
    "package.json",
    "rules/iron-laws.md",
    "scripts/check-requires.mjs",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-hotfix/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 35,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/35",
    "pullRequest": 36,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/36"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "a06849feb414845b77d77db117eb0257e30d7be4",
    "verifiedAt": "2026-10-09T15:29:50.716Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:36",
    "planHash": "5341c9788a2df348a304bf2816062df9351f178b7dab4ebbeeac592f1240f6cd",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[build] 产物能力声明与分发一致性门：requiresCommands + check:requires（pin 保留但由门钉住）",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\n第一轮复盘的 P0-A 是「pin v1.4.0、skills 已指挥 worktree 域、该域当时未发布」，失败还被 skills 写成静默降级。上游 #32 真机验证了 Codex 插件/hook 轨可用，所以「注销整条 hook 轨」的旧方案作废；但 pin 本身仍是无人维护的静态断言（README 写 v1.1.0、pin 写 v1.4.0、skills 要 v1.5.0 三处同时漂过）。本 change 保留两条轨与 pin，改为**让机器负责同步**：产物自声明所需命令键，CLI 落盘前断言，本地/CI 用一致性门判红；同时把 pin 升到 v1.5.0 消除当前错位。\n\n## 引用规范\n- `knowledge/multi-host-plugin-distribution.md`（上游 #32）\n  - 当前结论: 三清单分发契约与双 hooks 描述符；bind 只复制 skills/，插件轨才携带 hooks；**该轨已真机验证，不可注销**。\n  - 适用 scope: adapters/, hooks/, .codex-plugin/, package.json\n- `norms/knowledge-cards.md`：能更新不新增；新卡必须进 menu 路由；runtime 声明须附观察点。\n- `norms/tdd-verification.md` + `rules/iron-laws.md` 第 1 条：分级验证制；本 change 是其上再进一层的裁决（不写 TDD），三处必须同步改，不留矛盾。\n\n## 决策\n- **选型:** 保留 pin + 保留两条轨 + 新增能力声明与门；pin 升 v1.5.0 消除当下错位；「命令缺失」从静默降级改为响亮阻塞。\n- **对比方案:** (a) 注销 hook/pin 单轨——未选，推翻上游已验证形态；(b) 只做文档纠偏不加门——未选，那正是 pin 漂移无人拦的根因；(c) 把门做成 CI 检查——本轮不做（本仓无 CI workflow，留待独立 change 一起补，避免一次改两件事）。\n- **理由:** 命令键是唯一会随两侧自然同步的货币；pin 继续负责「装哪个 CLI」，能不能装交给能力断言——两者共存且不互相冒充。\n\n## 任务\n### Phase 1\n- [x] 产物声明 — `package.json` — 加 `requiresCommands`（skills 实际调用的 29 个命令键）、pin `v1.4.0 → v1.5.0`、version `6.4.0 → 6.5.0`、scripts 补 `check:requires` 且 test 覆盖整个 test/\n- [x] 一致性门 — `scripts/check-requires.mjs` — `skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录`，两级差集非空即退出码 1 并逐条列出\n### Phase 2\n- [x] 失败语义 — `skills/shadow-dev-apply/SKILL.md`, `skills/shadow-dev-propose/SKILL.md` — 新增「CLI 前置」：`UNKNOWN_COMMAND`/`ARTIFACT_INCOMPATIBLE`/不在 PATH 即响亮阻塞并给出升级动作，禁止静默降级到 branch 或删除版本口径改为能力口径\n- [x] 纪律同步 — `norms/tdd-verification.md`, `rules/iron-laws.md`, `skills/shadow-dev-hotfix/SKILL.md` — 写入 2026-10-09 裁决（L 不强制先写失败测试，M 默认不新建测试文件；强度与评级匹配仍不可议；既有测试必须绿），三处口径一致\n### Phase 3\n- [x] 知识闭环 — `knowledge/distribution-capability-contract.md`, `menu.md` — 新增卡（pin 与能力声明的分工 + 门 + 不降级）并加 menu 路由\n- [ ] 事实纠偏 — `README.md`, `docs/cli-guide.md` — 修掉 v1.1.0 口径与不存在的 `workflow install`/`workflow bind` 命令名、`CLI ≥ v1.5.0` 版本口径、`.shadow-dev` 「未实现」的过期断言\n\n完整 brief：shadow-docs/changes/20261009-build-artifact-capability-gate/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261009-build-artifact-capability-gate\",\"type\":\"build\",\"scope\":\"plugin-distribution,scripts\",\"status\":\"branched\",\"branch\":\"build/20261009-build-artifact-capability-gate\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261009-build-artifact-capability-gate/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "build"
      ]
    },
    "release": {
      "files": [],
      "message": "build(distribution): 产物能力声明与一致性门——requiresCommands + check:requires，pin 升 v1.5.0 由门互校",
      "title": "[build] 产物能力声明与分发一致性门（requiresCommands + check:requires）",
      "body": "Closes #35\n\n完整 brief：shadow-docs/changes/20261009-build-artifact-capability-gate/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "卡片与门随 PR #36 合入 main，6/6 任务完成（task-6 纠偏核实：README/cli-guide 旧口径残留均为 0）；本次为归档前置重钉 verifiedCommit（main=a06849f），证据＝npm test 11/11 全绿、check:requires 两级差集为空、解包三清单同源 6.5.1"
  }
}
---

# 产物能力声明与分发一致性门：requiresCommands + check:requires（pin 保留但由门钉住）

## 动机
第一轮复盘的 P0-A 是「pin v1.4.0、skills 已指挥 worktree 域、该域当时未发布」，失败还被 skills 写成静默降级。上游 #32 真机验证了 Codex 插件/hook 轨可用，所以「注销整条 hook 轨」的旧方案作废；但 pin 本身仍是无人维护的静态断言（README 写 v1.1.0、pin 写 v1.4.0、skills 要 v1.5.0 三处同时漂过）。本 change 保留两条轨与 pin，改为**让机器负责同步**：产物自声明所需命令键，CLI 落盘前断言，本地/CI 用一致性门判红；同时把 pin 升到 v1.5.0 消除当前错位。

## 复杂度评级
- **评级:** M
- **理由:** 三要素——①契约变更：新增产物可选声明字段与本地门，不改任何命令行为；②触及面：分发资产（package.json/menu/knowledge）与文案口径，CLI 侧零改动；③可发现性：门与 CLI 断言都会立刻判红，坏不了也不会静默。
- **期望验证深度:** runtime（门的两条路径 + 越权产物被 v1.5.0 拒绝 + `workflow plan --from` 预览）
- 按 2026-10-09 用户裁决：不新建测试文件、不做先红仪式。

## 引用规范
- `knowledge/multi-host-plugin-distribution.md`（上游 #32）
  - 当前结论: 三清单分发契约与双 hooks 描述符；bind 只复制 skills/，插件轨才携带 hooks；**该轨已真机验证，不可注销**。
  - 适用 scope: adapters/, hooks/, .codex-plugin/, package.json
- `norms/knowledge-cards.md`：能更新不新增；新卡必须进 menu 路由；runtime 声明须附观察点。
- `norms/tdd-verification.md` + `rules/iron-laws.md` 第 1 条：分级验证制；本 change 是其上再进一层的裁决（不写 TDD），三处必须同步改，不留矛盾。

## 决策
- **选型:** 保留 pin + 保留两条轨 + 新增能力声明与门；pin 升 v1.5.0 消除当下错位；「命令缺失」从静默降级改为响亮阻塞。
- **对比方案:** (a) 注销 hook/pin 单轨——未选，推翻上游已验证形态；(b) 只做文档纠偏不加门——未选，那正是 pin 漂移无人拦的根因；(c) 把门做成 CI 检查——本轮不做（本仓无 CI workflow，留待独立 change 一起补，避免一次改两件事）。
- **理由:** 命令键是唯一会随两侧自然同步的货币；pin 继续负责「装哪个 CLI」，能不能装交给能力断言——两者共存且不互相冒充。

## 任务
### Phase 1
- [x] 产物声明 — `package.json` — 加 `requiresCommands`（skills 实际调用的 29 个命令键）、pin `v1.4.0 → v1.5.0`、version `6.4.0 → 6.5.0`、scripts 补 `check:requires` 且 test 覆盖整个 test/
- [x] 一致性门 — `scripts/check-requires.mjs` — `skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录`，两级差集非空即退出码 1 并逐条列出
### Phase 2
- [x] 失败语义 — `skills/shadow-dev-apply/SKILL.md`, `skills/shadow-dev-propose/SKILL.md` — 新增「CLI 前置」：`UNKNOWN_COMMAND`/`ARTIFACT_INCOMPATIBLE`/不在 PATH 即响亮阻塞并给出升级动作，禁止静默降级到 branch 或删除版本口径改为能力口径
- [x] 纪律同步 — `norms/tdd-verification.md`, `rules/iron-laws.md`, `skills/shadow-dev-hotfix/SKILL.md` — 写入 2026-10-09 裁决（L 不强制先写失败测试，M 默认不新建测试文件；强度与评级匹配仍不可议；既有测试必须绿），三处口径一致
### Phase 3
- [x] 知识闭环 — `knowledge/distribution-capability-contract.md`, `menu.md` — 新增卡（pin 与能力声明的分工 + 门 + 不降级）并加 menu 路由
- [x] 事实纠偏 — `README.md`, `docs/cli-guide.md` — 修掉 v1.1.0 口径与不存在的 `workflow install`/`workflow bind` 命令名、`CLI ≥ v1.5.0` 版本口径、`.shadow-dev` 「未实现」的过期断言

## 非目标
- 不删 hooks/pin/vendored installer（上游 #32 已验证插件轨）
- 不加 CI workflow（独立 change）；不动 CLI 仓代码
- 发版不作为 task

## 结果

- 交付: issue #35 · PR #36（squash 合并）· Release v6.5.0
- 验证（M 级＝冒烟 + 既有测试保持绿 + 门的两条路径；按裁决不写 TDD）:
  - **门正例**：`npm run check:requires` → `undeclared=[] missing-in-cli=[]`，`✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`（CLI＝v1.5.0，catalog=46 键，声明=29 键）。
  - **门负例**（关键——证明门不是摆设）：把声明里的 `worktree.inspect` 删掉后重跑 → 退出码 **1**，并点名 `undeclared=[worktree.inspect (未声明)]`。
  - **既有测试保持绿**：`npm test`（`node --test test/`，覆盖上游 install-cli 与 pack 两个文件）。
  - **CLI 侧能力断言**（已发布 v1.5.0，本 change 零 CLI 改动）：越权 fixture `workflow plan` 透出 `missingCommands` 预览 → `workflow execute` 报 `ARTIFACT_INCOMPATIBLE`；本仓产物 `workflow plan --from .` → `ok=true, missingCommands=[]`。
- 现场决策（诚实）：
  - 与上游 #26/#28/#32 的冲突处置：**保留** Codex 插件/hook 轨、`adapters/codex.json`（上游那份更完整，含真机验证的 `hooks.codex.json`）与 `cliVersion` pin；**不删** hooks 与 vendored installer。把 pin 从漂了的 `v1.4.0` 升到 `v1.5.0`，并由新增一致性门负责互校——pin 与能力声明分工：pin 管「装哪个 CLI」，声明管「能不能装」。
  - 已按流程关掉 PR #34（把有争议设计与零争议改进绑在一个 PR 是我的失误），并在切分支前补跑 `sync plan/execute`（上一轮没跑导致撞上游，成本约 11 分钟）。
  - `skills/shadow-dev-hotfix` 的「复现测试先红后绿」由上游 #28 已软化为分级；本轮把 L 档口径与 2026-10-09 裁决对齐（不强制先红仪式，复现证据仍非协商）。


## 知识评估
- **预期影响:** 新增
- **候选卡片:** `knowledge/distribution-capability-contract.md`
- **理由:** 「pin 管装哪个、能力声明管能不能装、门负责两者不互相冒充」是跨项目稳定机制，与 multi-host-plugin-distribution（讲宿主清单与 hooks）正交；需进 menu 路由并带 runtime 观察点。
