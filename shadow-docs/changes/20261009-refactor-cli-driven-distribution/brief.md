---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-refactor-cli-driven-distribution",
  "type": "refactor",
  "scope": "plugin-distribution",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "refactor/20261009-refactor-cli-driven-distribution",
  "files": [
    ".claude-plugin/plugin.json",
    "CLAUDE.md",
    "README.md",
    "adapters/codex.json",
    "docs/cli-guide.md",
    "hooks/bootstrap-cli.sh",
    "hooks/hooks.json",
    "knowledge/distribution-capability-contract.md",
    "menu.md",
    "norms/tdd-verification.md",
    "package.json",
    "scripts/check-requires.mjs",
    "scripts/install-cli.sh",
    "scripts/pack.mjs",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md",
    "test/install-cli.test.mjs",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 33,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/33",
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "6ff018985f5e20494595371302cd724123a44aff",
    "verifiedAt": "2026-10-09T14:39:10.563Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "issue:33",
    "planHash": "0081c73e1ecc7f29f3d3a408ec348eef754f20e190da0e600789eeabc6df345e",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[refactor] 分发权威反转落地：workflow 仓降格为内容产物 + 模板，CLI 成为唯一驱动方",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\n第一轮复盘的 P0-A/P0-B 两条都指向同一件事：依赖方向是反的。workflow 插件用 `package.json.cliVersion` pin 住 CLI、并用 SessionStart hook 去安装 CLI，而 hook 的 schema 写错（`type:\"process\"`+`args`，真实为 `type:\"command\"`）从未生效；pin 停在 v1.4.0，skills 却已指挥 worktree 域（只在未发布的 main 上），失败还是静默降级「直接走 branch」。CLI 侧的 `workflow`/`bind` 域与 bootstrap 一键装机已经把「CLI 驱动分发」实现完了，zcode 宿主也已用 bind 装完 8 技能——本 change 把旧轨彻底注销，让新轨成为唯一入口，并顺手补上当前真实使用宿主 Codex 的适配器。前置条件已成立：shadow-dev-cli **v1.5.0 已发布**（Release + tarball 资产 + 能力断言 + worktree 域），裸奔窗口关闭。\n\n## 引用规范\n- `shadow-docs/knowledge/…`（workflow 仓自身 menu 命中 `norms/knowledge-cards.md`、`norms/tdd-verification.md`）\n  - 当前结论: 卡片须 `domain+keywords+scope` 查重、能更新不新增；active 卡必须进 menu 路由；`verified-depth` 声明 runtime 须附可追溯观察点。\n  - 适用 scope: knowledge/distribution-capability-contract.md, menu.md\n- CLI 仓 `shadow-docs/knowledge/install-distribution.md`（跨仓契约，PR #47 已更新）\n  - 当前结论: 产物消费契约三件必备 + `adapters/`（≥6.3.1）；能力契约 `requiresCommands` 为可选第四件，缺省兼容；**pack 清单与消费方契约两处同源登记**；跨仓演进顺序＝消费方先行兼容、生产方随后声明；**release 不作为 brief task**。\n  - 适用 scope: package.json, scripts/pack.mjs, test/pack.test.mjs\n- `norms/knowledge-cards.md` / `norms/tdd-verification.md`\n  - 适用 scope: 全流程\n\n## 决策\n- **选型:** 一步到位（增删同 change）：CLI 驱动成为唯一轨，同时声明 `requiresCommands`、补 `adapters/codex.json`、删 `cliVersion`/`hooks/`/vendored `scripts/install-cli.sh`/`test/install-cli.test.mjs`、skills 缺 CLI 改为响亮阻塞、文档口径纠偏、新增一致性脚本 `scripts/check-requires.mjs`。\n- **对比方案:**\n  - 拆 2a（只增）+ 2b（只删）：未选。拆分的前提是「v1.5.0 未发布，怕裸奔窗口」；窗口已关闭，拆分只会多一次 PR 往返。\n  - 保留 hook 轨并修 `type:\"command\"`：未选。修好它等于维持两条互相覆盖的安装轨（本机实况已证明：手工软链 + 插件缓存停在 2d1b174），单向权威才是目标形态。\n  - 把 `requiresCommands` 写进 `marketplace.json`：未选。CLI 侧 `verOf`/`requireArtifact` 已把 `package.json` 作为版本与元信息源，同源改动最小。\n- **理由:** 依赖方向只能有一条；能力名（命令键）是唯一会随两边自然同步的货币，静态版本号已被实证同步失败（README v1.1.0 / pin v1.4.0 / skills 要 v1.5.0 三处各说各话）。\n\n## 任务\n### Phase 1 — 声明与适配器\n- [x] 产物声明与宿主适配 — `package.json`, `adapters/codex.json` — 删 `cliVersion`、加 `requiresCommands`（skills 实际调用的命令键全集）、版本 bump 6.4.0；新增 codex 描述符（`skillsDir: ~/.codex/skills`，copy + sidecar，与既有两家同 schema）\n- [x] 一致性脚本 — `scripts/check-requires.mjs` — 扫 `skills/` 内全部 `shadow-dev <域> <动作>` 引用 → 归一成命令键 → 断言 ⊆ `package.json.requiresCommands`；若本机可解析到 CLI（`SHADOW_DEV_CLI` 或 PATH 上 `shadow-dev help --full --json`），再断言声明集 ⊆ CLI 命令目录，输出差集\n\n### Phase 2 — 注销旧轨\n- [x] 删除安装引导轨 — `hooks/hooks.json`, `hooks/bootstrap-cli.sh`, `scripts/install-cli.sh`, `test/install-cli.test.mjs` — 整目录删除；`.claude-plugin/plugin.json` 去掉 `hooks` 字段与 TDD 措辞；`scripts/pack.mjs` 的 DIRS 去掉 `hooks`；`test/pack.test.mjs` 断言改为不再要求 hooks/install-cli.sh 且 skills 清单补全 8 个\n- [ ] skills 失败语义与版本口径 — `skills/shadow-dev-apply/SKILL.md`, `skills/shadow-dev-propose/SKILL.md` — 「命令不可用时直接走 branch」改为响亮阻塞并给出升级指令；`CLI ≥ v1.5.0` 版本口径改为「以产物 `requiresCommands` 与 CLI 命令目录为准」\n\n### Phase 3 — 文档与知识同源\n- [x] 文档纠偏 — `README.md`, `docs/cli-guide.md`, `CLAUDE.md` — 安装段重写为「bootstrap / `workflow plan|execute` / `bind plan|execute`」唯一轨；修掉不存在的命令名 `workflow install|bind`；版本口径改「随已安装 CLI 能力而定」；补 `.shadow-dev/config.json` 已实现的事实\n- [x] 知识闭环 — `knowledge/distribution-capability-contract.md`, `menu.md` — 新增跨项目卡（分发三方版本锁→能力契约替代静态 pin），并加 menu 路由\n\n完整 brief：shadow-docs/changes/20261009-refactor-cli-driven-distribution/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261009-refactor-cli-driven-distribution\",\"type\":\"refactor\",\"scope\":\"plugin-distribution\",\"status\":\"branched\",\"branch\":\"refactor/20261009-refactor-cli-driven-distribution\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261009-refactor-cli-driven-distribution/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "refactor"
      ]
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        "CLAUDE.md",
        "README.md",
        "adapters/codex.json",
        "docs/cli-guide.md",
        "hooks/bootstrap-cli.sh",
        "hooks/hooks.json",
        "knowledge/distribution-capability-contract.md",
        "menu.md",
        "norms/tdd-verification.md",
        "package.json",
        "scripts/check-requires.mjs",
        "scripts/install-cli.sh",
        "scripts/pack.mjs",
        "shadow-docs/changes/20261009-refactor-cli-driven-distribution/",
        "skills/shadow-dev-apply/SKILL.md",
        "skills/shadow-dev-propose/SKILL.md",
        "test/install-cli.test.mjs",
        "test/pack.test.mjs"
      ],
      "message": "refactor(distribution): 分发权威反转给 CLI——注销 pin/hook/vendored installer，声明 requiresCommands 并新增 codex 宿主 (#33)",
      "title": "[refactor] 分发权威反转落地：CLI 驱动唯一轨 + 产物能力声明 + codex 宿主 (#33)",
      "body": "Closes #33\n\n完整 brief：shadow-docs/changes/20261009-refactor-cli-driven-distribution/brief.md"
    }
  },
  "knowledge": {
    "action": "新增",
    "target": "knowledge/distribution-capability-contract.md",
    "reason": "新增跨项目稳定事实：分发依赖单向 + 产物以 requiresCommands 做能力断言替代静态版本 pin；已进 menu 路由、带 verified-depth runtime 与可追溯观察点，非一次性过程记录"
  }
}
---

# 分发权威反转落地：workflow 仓降格为内容产物 + 模板，CLI 成为唯一驱动方

## 动机
第一轮复盘的 P0-A/P0-B 两条都指向同一件事：依赖方向是反的。workflow 插件用 `package.json.cliVersion` pin 住 CLI、并用 SessionStart hook 去安装 CLI，而 hook 的 schema 写错（`type:"process"`+`args`，真实为 `type:"command"`）从未生效；pin 停在 v1.4.0，skills 却已指挥 worktree 域（只在未发布的 main 上），失败还是静默降级「直接走 branch」。CLI 侧的 `workflow`/`bind` 域与 bootstrap 一键装机已经把「CLI 驱动分发」实现完了，zcode 宿主也已用 bind 装完 8 技能——本 change 把旧轨彻底注销，让新轨成为唯一入口，并顺手补上当前真实使用宿主 Codex 的适配器。前置条件已成立：shadow-dev-cli **v1.5.0 已发布**（Release + tarball 资产 + 能力断言 + worktree 域），裸奔窗口关闭。

## 复杂度评级
- **评级:** L
- **理由:** 三要素——①契约变更：产物布局契约（去掉 hooks/ 与 vendored installer、新增 `requiresCommands` 声明与 codex 宿主描述符）、安装入口契约（唯一轨＝CLI/bootstrap）、skills 的失败语义契约（静默降级→响亮阻塞）；②触及面：跨宿主核心分发链（package.json / pack.mjs / adapters / skills / README / cli-guide / plugin manifest）；③可发现性：坏在「装不上/新机器/新宿主」才可见，静态读码看不出。
- **期望验证深度:** runtime（隔离 `SHADOW_WORKFLOW_HOME` 真跑 `bind plan/execute` 绑定 codex 宿主；`workflow plan --from` 用 v1.5.0 真实解析本仓产物并核对 `missingCommands`；一致性脚本对全量 skills 引用求差集）
- **验证方式裁决:** 按用户 2026-10-09 裁决「不要写 TDD，太浪费时间」——本 change 不新建测试文件、不做先红仪式，改以**可追溯 runtime 观察点 + 一致性脚本 + 既有 CI/既有测试保持绿**满足 L 级强度；该裁决同步写入 `norms/tdd-verification.md`，不留口头例外。

## 引用规范
- `shadow-docs/knowledge/…`（workflow 仓自身 menu 命中 `norms/knowledge-cards.md`、`norms/tdd-verification.md`）
  - 当前结论: 卡片须 `domain+keywords+scope` 查重、能更新不新增；active 卡必须进 menu 路由；`verified-depth` 声明 runtime 须附可追溯观察点。
  - 适用 scope: knowledge/distribution-capability-contract.md, menu.md
- CLI 仓 `shadow-docs/knowledge/install-distribution.md`（跨仓契约，PR #47 已更新）
  - 当前结论: 产物消费契约三件必备 + `adapters/`（≥6.3.1）；能力契约 `requiresCommands` 为可选第四件，缺省兼容；**pack 清单与消费方契约两处同源登记**；跨仓演进顺序＝消费方先行兼容、生产方随后声明；**release 不作为 brief task**。
  - 适用 scope: package.json, scripts/pack.mjs, test/pack.test.mjs
- `norms/knowledge-cards.md` / `norms/tdd-verification.md`
  - 适用 scope: 全流程

## 决策
- **选型:** 一步到位（增删同 change）：CLI 驱动成为唯一轨，同时声明 `requiresCommands`、补 `adapters/codex.json`、删 `cliVersion`/`hooks/`/vendored `scripts/install-cli.sh`/`test/install-cli.test.mjs`、skills 缺 CLI 改为响亮阻塞、文档口径纠偏、新增一致性脚本 `scripts/check-requires.mjs`。
- **对比方案:**
  - 拆 2a（只增）+ 2b（只删）：未选。拆分的前提是「v1.5.0 未发布，怕裸奔窗口」；窗口已关闭，拆分只会多一次 PR 往返。
  - 保留 hook 轨并修 `type:"command"`：未选。修好它等于维持两条互相覆盖的安装轨（本机实况已证明：手工软链 + 插件缓存停在 2d1b174），单向权威才是目标形态。
  - 把 `requiresCommands` 写进 `marketplace.json`：未选。CLI 侧 `verOf`/`requireArtifact` 已把 `package.json` 作为版本与元信息源，同源改动最小。
- **理由:** 依赖方向只能有一条；能力名（命令键）是唯一会随两边自然同步的货币，静态版本号已被实证同步失败（README v1.1.0 / pin v1.4.0 / skills 要 v1.5.0 三处各说各话）。

## 任务
### Phase 1 — 声明与适配器
- [x] 产物声明与宿主适配 — `package.json`, `adapters/codex.json` — 删 `cliVersion`、加 `requiresCommands`（skills 实际调用的命令键全集）、版本 bump 6.4.0；新增 codex 描述符（`skillsDir: ~/.codex/skills`，copy + sidecar，与既有两家同 schema）
- [x] 一致性脚本 — `scripts/check-requires.mjs` — 扫 `skills/` 内全部 `shadow-dev <域> <动作>` 引用 → 归一成命令键 → 断言 ⊆ `package.json.requiresCommands`；若本机可解析到 CLI（`SHADOW_DEV_CLI` 或 PATH 上 `shadow-dev help --full --json`），再断言声明集 ⊆ CLI 命令目录，输出差集

### Phase 2 — 注销旧轨
- [x] 删除安装引导轨 — `hooks/hooks.json`, `hooks/bootstrap-cli.sh`, `scripts/install-cli.sh`, `test/install-cli.test.mjs` — 整目录删除；`.claude-plugin/plugin.json` 去掉 `hooks` 字段与 TDD 措辞；`scripts/pack.mjs` 的 DIRS 去掉 `hooks`；`test/pack.test.mjs` 断言改为不再要求 hooks/install-cli.sh 且 skills 清单补全 8 个
- [x] skills 失败语义与版本口径 — `skills/shadow-dev-apply/SKILL.md`, `skills/shadow-dev-propose/SKILL.md` — 「命令不可用时直接走 branch」改为响亮阻塞并给出升级指令；`CLI ≥ v1.5.0` 版本口径改为「以产物 `requiresCommands` 与 CLI 命令目录为准」

### Phase 3 — 文档与知识同源
- [x] 文档纠偏 — `README.md`, `docs/cli-guide.md`, `CLAUDE.md` — 安装段重写为「bootstrap / `workflow plan|execute` / `bind plan|execute`」唯一轨；修掉不存在的命令名 `workflow install|bind`；版本口径改「随已安装 CLI 能力而定」；补 `.shadow-dev/config.json` 已实现的事实
- [x] 知识闭环 — `knowledge/distribution-capability-contract.md`, `menu.md` — 新增跨项目卡（分发三方版本锁→能力契约替代静态 pin），并加 menu 路由

## 非目标
- 不做 `template/` 目录与 `project init|doctor|upgrade`（下一个 change）
- 不动 norms/code-style* 里写死的 x.wuh.site 包结构事实、不拆超大卡片（知识治理 change）
- 不建 CLI 仓 `shadow-docs/signals.md`（独立小 change）
- 发版（tag + Release）不作为 task

## 结果

- 实际耗时: ≈30 分钟（含一次整批脚本因参数缺失未执行、多次 139 重试、一轮门脚本自身缺陷修正）
- 验证（L 级＝可追溯 runtime 观察点；按 2026-10-09 用户裁决不写 TDD）:
  - **一致性门**：`npm run check:requires` → `declared=29 skills-referenced=20 undeclared=[] cli-catalog=46 missing-in-cli=[]`，结论 `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`（CLI＝已发布 v1.5.0）。
  - **既有测试保持绿**：`npm test`（pack 产物契约 3 用例）→ `# tests 3 # pass 3 # fail 0`。断言已随新契约更新：产物必须**不含** `hooks/` 与 vendored `install-cli.sh`、必须带 `requiresCommands`、必须**不含** `cliVersion`、8 个 skills 齐全。
  - **新宿主实跑**：`SHADOW_WORKFLOW_HOME=/private/tmp/hosthome shadow-dev bind plan --host codex` → `artifactRoot=shadow-dev-workflow version=6.4.0 host=codex entries=8 blocked=0`；`bind execute --host codex --confirm` → `bound=codex:shadow-dev-{apply,archive,design,hotfix,knowledge,propose,release,review}`，隔离目录内生成 `.shadow-dev-workflow.json` sidecar ✓。**真实 `~/.codex/skills` 未被验证改动**（仍是 7 条旧手工条目），实绑留到产物发版后执行。
  - **跨仓契约闭环**：`shadow-dev workflow plan --from .` → `ok=true version=6.4.0 missingCommands=[]`——v1.5.0 接受本产物声明的 29 个命令键，「消费方先行兼容、生产方随后声明」顺序成立。
  - 拒绝路径证明沿用上一 change 的 runtime 证据（越权 fixture → `ARTIFACT_INCOMPATIBLE` 且指针不动）；本 change 属声明侧，未重复实现侧验证。
- 交付: issue #33
- 过程记录（诚实）:
  - 一致性门自身两处缺陷并已修：`-{1,2}` 把前导短横写成必需，导致 `skills-referenced=0`；`plan/execute` 斜杠并列未拆分，导致 `workflow (未声明)`。同时把 `workflow.*` / `bind.*` 纳入声明集——skills 现在确实把「升级 CLI」的恢复动作写进了流程，那同样是它要跑的命令。
  - brief 的 `files` 手工补入 `norms/tdd-verification.md`（用户裁决把纪律变更纳入本 change 范围）；受管状态字段未手改。
  - **遗留矛盾（待下一个小 change 裁决）**：`skills/shadow-dev-hotfix/SKILL.md` 的「不可省清单」仍写「复现测试先红后绿（非协商）」，与新裁决冲突；该文件不在本 change 声明范围内，故未改。

## 知识评估
- **预期影响:** 新增
- **候选卡片:** `knowledge/distribution-capability-contract.md`
- **理由:** 这是跨项目稳定事实（消费方以能力名而非版本号做兼容判定；分发依赖必须单向），不属于 CLI 仓的 install-distribution 卡（那张讲 CLI 自身双轨机制），也不属于任何单项目；新增后须进 `menu.md` 路由并带 `verified-depth: runtime` + 观察点。
