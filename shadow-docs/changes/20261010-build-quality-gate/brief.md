---
{
  "schema": "shadow-dev/v1",
  "name": "20261010-build-quality-gate",
  "type": "build",
  "scope": "plugin-distribution",
  "status": "reviewed",
  "baseBranch": "refactor/20261010-refactor-domain-driven-workflow",
  "branch": "build/20261010-build-quality-gate",
  "files": [
    ".github/workflows/publish-release.yml",
    ".github/workflows/quality-gate.yml",
    "CLAUDE.md",
    "README.md",
    "knowledge/distribution-capability-contract.md",
    "knowledge/release-artifact-pipeline.md",
    "menu.md",
    "norms/verification.md",
    "package.json",
    "scripts/bump-version.mjs",
    "scripts/check-knowledge.mjs",
    "scripts/check-requires.mjs",
    "shadow-docs/changes/20261010-build-quality-gate/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "b2e7579a49415a86053e46c1194d552c18a5cc5f",
    "verifiedAt": "2026-10-10T00:06:13.439Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "28d7f52bd05741fb0c533a471f35e2a40f9a78aa795e38ee1b5e08009346cf51",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[build] 质量门上移 GitHub Actions + 版本与产物由 Release 控制",
      "titleRaw": "[build] 质量门上移 GitHub Actions + 版本与产物由 Release 控制",
      "supplement": "把 npm test / check:requires（strict）/ 知识治理门 / 版本一致性门搬进 quality-gate.yml；publish-release.yml 以 release tag 为版本权威，pack→资产契约断言→上传→隔离 HOME 消费冒烟。完整 brief：shadow-docs/changes/20261010-build-quality-gate/brief.md",
      "body": "## 动机\n三个已知故障源，全部来自上一个 change 的实证记录（`20261010-refactor-domain-driven-workflow` brief「遗留与后续」）：\n\n1. **本仓没有测试门。** `.github/workflows/` 只有 `archive-on-issue-close.yml`。`npm test`（11 例）与 `npm run check:requires` 全靠执行者本机口头自证——「验证强度与评级匹配不可议」在没有机器门时退化为承诺。本轮实证两次代价：`install-cli.test.mjs` 7 例在沙箱禁网下取不到证据（只能越权到有网环境跑），同轮 `workflow plan` 与 `npm test` 各遇一次 node 139 段错误。\n2. **CI 上的门会静默半绿。** `scripts/check-requires.mjs` 解析不到 CLI 命令目录时打印「（CLI 目录未参与断言）」并以 **0 退出**——三级包含断言在 CI 上退化成两级还判绿。该脚本自己的注释就写着「假绿的门比没有门更危险」。\n3. **发布链手工且已反复出血。** 产物资产名 `^shadow-dev-workflow-v[0-9][0-9.]*\\.tar\\.gz$` 是 CLI 侧 `workflow plan --release/--release latest` 的硬契约（CLI 仓 `lib/domains/workflow.mjs:102`），但没有任何自动化保证「tag 建了 → 三处 manifest 版本与 tag 一致 → 资产真的传上去了」。历史证据：`35bd029`、`a06849f`/`51a8eef` 两次专门补版本对齐，`20260925-fix-pack-adapters` 专门补产物缺资产。\n\n目标：把三类门从「AI 本机自证」上移到 GitHub Actions；把 Release 变成版本与产物的唯一权威发布点，人只剩 `bump → tag → gh release create` 一步之差。\n\n**前置依赖（跨上下文，已在文件集中声明）：** 本 change 基于**未合并**的 `refactor/20261010-refactor-domain-driven-workflow`（stacked 分支），因为要改的 `norms/verification.md` 与 `menu.md` 路由是那条分支改名后的产物；PR base 同样指向它，按序合并。\n\n## 引用规范\n- `knowledge/distribution-capability-contract.md`\n  - 当前结论: 兼容判定用**能力名**不用版本号；能力缺失只能响亮阻塞、禁止静默降级；声明与消费同源登记；跨仓演进顺序＝消费方先行兼容、生产方随后声明。\n  - 适用 scope: `scripts/check-requires.mjs`（strict 正是「禁止静默降级」纪律套到 CI 自身）、`.github/workflows/*`\n- `knowledge/multi-host-plugin-distribution.md`\n  - 当前结论: 新增宿主＝新增描述符；**禁止改写既有宿主清单语义**；hooks 声明即替换默认发现。\n  - 适用 scope: 本 change 只读两份清单的版本字段（bump 脚本内），不改结构语义\n- `norms/verification.md`\n  - 当前结论: L 级＝每条不变量一个可追溯观察点；本机取不到证据必须写明缺口与替代观察点（CI run 链接）；知识治理流程检查卡片字段/分区/source/路由/死链/过期执行依赖。\n  - 适用 scope: 本 change 把「知识治理流程」固化为脚本门，并让「CI run 链接」从抽象条款变成可执行证据形态\n- `norms/knowledge-cards.md`\n  - 当前结论: 一卡一知识单元；active 卡必须进 menu 路由；新增前按 `domain + keywords + scope` 查重；存量卡片不回溯迁移。\n  - 适用 scope: 新增 `knowledge/release-artifact-pipeline.md` 与 menu 路由\n- `rules/behavior.md` §2 / §3\n  - 当前结论: 只实现当前需要的，不为未来灵活性加参数；不碰没坏的代码。\n  - 适用 scope: strict 走「新增可选开关、默认保持旧行为」而非全量改语义；不动 pack 集合与清单结构\n- `shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md`（前置 change）\n  - 当前结论: 记有「本仓无 CI 测试门＝结构性弱点」，是本 change 的动机来源与依赖基线。\n  - 适用 scope: 前置/合并顺序\n\n## 决策\n- **选型:** 方案 A —— **断言式版本权威 + 一键 bump + CI 三门 + 发布冒烟**。\n  1. `scripts/check-requires.mjs` 增严格模式（`--strict` 或 `SHADOW_REQUIRE_CLI_CATALOG=1`）：命令目录解析不到 → 判红退出 1；非 strict 保持旧行为（本机开发不被迫装 CLI），输出补 `catalog=resolved|unresolved` 让降级可见。\n  2. 新增 `scripts/check-knowledge.mjs`：把上一 change 里我用一次性 python 手跑的**知识治理检查固化成门**——卡片字段/status 枚举/source 存在性/active 路由覆盖/引用死链/`--forbid` 残留 token/孤儿规范。\n  3. 新增 `scripts/bump-version.mjs` + `npm run check:version`：一次同步三处 manifest，`check:version` 在 CI 与发布前判一致性（消灭历史上反复出现的漏同步）。\n  4. 新增 `.github/workflows/quality-gate.yml`：`push: main` + `pull_request`；矩阵 `ubuntu/macos/windows × node 20/22`；步骤＝按 `cliVersion` 装 pin CLI（与 archive workflow 同款 `scripts/install-cli.sh install --version`）→ `npm test` → `check:requires` **strict** → `check-knowledge` → `check:version`；`concurrency` 按 ref 取消在跑的同类任务。\n  5. 新增 `.github/workflows/publish-release.yml`：`on: release.types: [published]`；先跑**版本权威判定**（`github.ref_name` 去 `v` 必须 == `package.json.version`，不一致响亮失败并打印 `bump-version.mjs` 修正命令）→ 同组门 → `node scripts/pack.mjs` → **资产契约断言**（文件名匹配 CLI 侧正则）→ `gh release upload --clobber` → **发布冒烟**：`HOME` 隔离下 `shadow-dev workflow plan --release <tag>` → `workflow execute` → `bind plan --host codex`，证明刚发布的产物真能被 v1.5.0 消费；`permissions: contents: write`。\n  6. 不做「tag 驱动 CI 自动 bump 回 main」：tag 与内容必须同源，产物取自 tag 的 tree，而 bump 提交落在 tag **之后**会让资产与 tag tree 不一致——等于把版本权威降级成「CI 事后修正」，可追溯性更差，还会再触发一轮 main push 门（自激风险）。\n- **对比方案:**\n  - **方案 B（纯 tag 驱动，CI 自动回写版本）**：未选，理由同上（资产与 tag tree 分裂）。但保留其诉求的替代实现：`bump-version.mjs` 让「先对齐再打 tag」成本降到一条命令，版本权威仍是 tag。\n  - **方案 C（只加 `npm test` 的 CI，不动门与发布链）**：未选。留下半绿门与手工传资产两个已知故障源，且完全不满足「用 release 控制版本号」。\n  - **方案 D（门并入 CLI 仓复用）**：未选。门断言的是**本仓产物语义**（skills 引用、卡片路由、清单版本），放进执行层就违反刚立的「依赖单向」结论。\n  - **矩阵只跑 ubuntu**：未选。`pack.mjs`/`install-cli.sh`/`tar` 的跨平台坑已被 CLI 仓用 `bash -c` 与 Windows bsdtar 注释实证；只跑 ubuntu 等于把可发现性最差的一类回归留在暗处。代价＝每次 PR 6 个 job。\n- **理由:** 三项故障源的共同点是「机器能判、却靠人自证」。strict 与版本权威判定都是把已有口头纪律变成非零退出；发布冒烟则是本 change 唯一能证明「Release 真的控制了版本号」的观察点——不冒烟就无法区分「资产名写对且可消费」与「传了个没人能装的文件」。\n\n## 任务\n### Phase 1 — 本机可全量自证的门\n- [ ] check-requires 严格模式 — `scripts/check-requires.mjs` — 命令目录不可解析时 strict 判红（非 strict 保持旧行为）；输出增 `catalog=resolved|unresolved`\n- [ ] 知识治理门 — `scripts/check-knowledge.mjs` — 卡片 8 字段与 status 枚举、`source` 存在性、active 卡 menu 路由覆盖、`norms|knowledge|rules|docs|adapters|scripts` 死链、`--forbid` 废弃 token、孤儿规范；无依赖纯 node 实现\n- [ ] 版本一致性与 bump — `scripts/bump-version.mjs`, `package.json` — `check:version` 判三处 manifest 同源；`bump-version.mjs <ver>` 一次写三处并打印变更；新增 `check:knowledge` script 聚合入口\n\n### Phase 2 — GitHub Actions\n- [ ] 质量门工作流 — `.github/workflows/quality-gate.yml` — push main + PR；矩阵 ubuntu/macos/windows × node 20/22；装 pin CLI → `npm test` → `check:requires --strict` → `check:knowledge` → `check:version`；concurrency 按 ref 取消\n- [ ] 发布工作流 — `.github/workflows/publish-release.yml` — release.published → 版本权威判定（不一致即失败并提示 bump）→ 同组门 → pack → 资产名契约断言 → `gh release upload --clobber` → 隔离 HOME 消费冒烟（plan --release / execute / bind plan）\n\n### Phase 3 — 口径与知识闭环\n- [ ] 验证口径更新 — `norms/verification.md` — 「替代观察点」段补明：本仓 `quality-gate` 与 `publish-release` 的 run 链接即合法 runtime 观察点；知识治理检查改由 `scripts/check-knowledge.mjs` 执行，AI 手跑仅作提交前预检\n- [ ] 发布链知识卡与路由 — `knowledge/release-artifact-pipeline.md`, `knowledge/distribution-capability-contract.md`, `menu.md` — 结论：版本权威＝release tag、资产名正则契约、发布冒烟三件套、strict 门禁止半绿；按 `domain + keywords + scope` 查重后新增并加 menu 路由；能力契约卡**原位更新**（追加「严格断言不得半绿」执行约束与第 5 项验证方式＝发布冒烟，并追加 source），不新建重复卡\n- [ ] 文档口径 — `README.md`, `CLAUDE.md` — 补 CI 与发布段、`scripts/` 三门清单；分层规则加一行「`scripts/` 机器门＝可重复验证的执法层，AI 口头自证不可替代」\n\n### Phase 4 — 取证与收口\n- [ ] 观察点执行与记录 — `shadow-docs/changes/20261010-build-quality-gate/brief.md` — 本机真实跑并记输出：`npm test`（11 例）、`check:requires` 非 strict 绿 + strict 在 `SHADOW_DEV_CLI` 指向空壳时**判红**（拒绝路径）、`check-knowledge` 当前绿 + 注入死链/废弃 token fixture 时**判红**后回滚、`check:version` 当前绿 + 人为改坏一处版本时判红后回滚、两个 workflow 的 YAML 解析校验（本机解析器；无则记缺口）；GitHub 侧（矩阵真跑、发布冒烟）缺口写明，待 PR/首次 release 的 run 链接回填\n\n## 补充\n把 npm test / check:requires（strict）/ 知识治理门 / 版本一致性门搬进 quality-gate.yml；publish-release.yml 以 release tag 为版本权威，pack→资产契约断言→上传→隔离 HOME 消费冒烟。完整 brief：shadow-docs/changes/20261010-build-quality-gate/brief.md\n\n完整 brief：shadow-docs/changes/20261010-build-quality-gate/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261010-build-quality-gate\",\"type\":\"build\",\"scope\":\"plugin-distribution\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"refactor/20261010-refactor-domain-driven-workflow\",\"briefPath\":\"shadow-docs/changes/20261010-build-quality-gate/brief.md\",\"cliVersion\":\"1.5.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "build"
      ]
    },
    "commit": {
      "files": [
        ".github/workflows/publish-release.yml",
        ".github/workflows/quality-gate.yml",
        "CLAUDE.md",
        "README.md",
        "knowledge/distribution-capability-contract.md",
        "knowledge/release-artifact-pipeline.md",
        "menu.md",
        "norms/verification.md",
        "package.json",
        "scripts/bump-version.mjs",
        "scripts/check-knowledge.mjs",
        "scripts/check-requires.mjs",
        "shadow-docs/changes/20261010-build-quality-gate/brief.md"
      ],
      "message": "build(ci): 质量门上移 GitHub Actions + 版本与产物由 Release 控制"
    },
    "release": {
      "files": [
        ".github/workflows/publish-release.yml",
        ".github/workflows/quality-gate.yml",
        "CLAUDE.md",
        "README.md",
        "knowledge/distribution-capability-contract.md",
        "knowledge/release-artifact-pipeline.md",
        "menu.md",
        "norms/verification.md",
        "package.json",
        "scripts/bump-version.mjs",
        "scripts/check-knowledge.mjs",
        "scripts/check-requires.mjs",
        "shadow-docs/changes/20261010-build-quality-gate/brief.md"
      ],
      "message": "build(ci): 质量门上移 GitHub Actions + 版本与产物由 Release 控制",
      "title": "20261010-build-quality-gate",
      "body": ""
    }
  },
  "knowledge": {
    "action": "新增",
    "target": "knowledge/release-artifact-pipeline.md",
    "reason": "新增「发布链版本权威与产物资产契约」卡（版本权威＝release tag、资产名正则契约、发布冒烟三件套、机器门禁止半绿）；原位更新 knowledge/distribution-capability-contract.md（追加机器门 strict 约束与验证方式第 5/6 项、追加 source、verified 2026-10-10）、norms/verification.md（替代观察点落到两条真实流水、知识治理改脚本执行）、menu.md（新增发布与质量门路由）。npm run ci rc=0 四门全绿、既有测试 11/11、三条负例（strict 判红 / 版本不同源 / forbid 命中）均 rc=1；GitHub 矩阵与发布冒烟为已知缺口，待 run 链接回填。门在本轮即抓到 2 张卡 source 归档死链与 1 次未登记的勾选状态，证明不是摆设。"
  }
}
---

# 质量门禁上移 GitHub Actions，版本与产物由 Release 控制

## 动机

三个已知故障源，全部来自上一个 change 的实证记录（`20261010-refactor-domain-driven-workflow` brief「遗留与后续」）：

1. **本仓没有测试门。** `.github/workflows/` 只有 `archive-on-issue-close.yml`。`npm test`（11 例）与 `npm run check:requires` 全靠执行者本机口头自证——「验证强度与评级匹配不可议」在没有机器门时退化为承诺。本轮实证两次代价：`install-cli.test.mjs` 7 例在沙箱禁网下取不到证据（只能越权到有网环境跑），同轮 `workflow plan` 与 `npm test` 各遇一次 node 139 段错误。
2. **CI 上的门会静默半绿。** `scripts/check-requires.mjs` 解析不到 CLI 命令目录时打印「（CLI 目录未参与断言）」并以 **0 退出**——三级包含断言在 CI 上退化成两级还判绿。该脚本自己的注释就写着「假绿的门比没有门更危险」。
3. **发布链手工且已反复出血。** 产物资产名 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$` 是 CLI 侧 `workflow plan --release/--release latest` 的硬契约（CLI 仓 `lib/domains/workflow.mjs:102`），但没有任何自动化保证「tag 建了 → 三处 manifest 版本与 tag 一致 → 资产真的传上去了」。历史证据：`35bd029`、`a06849f`/`51a8eef` 两次专门补版本对齐，`20260925-fix-pack-adapters` 专门补产物缺资产。

目标：把三类门从「AI 本机自证」上移到 GitHub Actions；把 Release 变成版本与产物的唯一权威发布点，人只剩 `bump → tag → gh release create` 一步之差。

**前置依赖（跨上下文，已在文件集中声明）：** 本 change 基于**未合并**的 `refactor/20261010-refactor-domain-driven-workflow`（stacked 分支），因为要改的 `norms/verification.md` 与 `menu.md` 路由是那条分支改名后的产物；PR base 同样指向它，按序合并。

## 复杂度评级

- **评级:** L
- **理由:** **契约变更**——新增/改写机器门语义（strict 判红、版本权威判定、资产名契约、发布冒烟），并修改所有后续 change 的取证口径（「替代观察点＝CI run」从空谈变成真实存在的能力）；**触及面**——CI 与发布链是本仓对外的分发入口，动 `scripts/` 三个门、`.github/workflows/` 两个新工作流、`package.json` scripts、`norms/verification.md` 与知识路由；**可发现性**——workflow YAML 的语义错误（矩阵、secrets、`tar`/bash 跨平台、`gh` 权限、并发组）在本机完全不暴露，必须等 PR 或 Release 真跑才炸，属最典型的「等特定运行时路径才可见」。
- **期望验证深度:** runtime。本机可全量自证的部分真实跑到（含 strict 与知识门的**拒绝路径**）；YAML 语义与发布链以 quality-gate / publish-release 的 run 链接为替代观察点，本轮取不到就写明缺口。

## 领域模型

- **限界上下文:** `plugin-distribution` — 产物分发与发布链。上游 `shadow-dev-cli`（执行层，消费 `--release`/资产名/能力断言），下游三宿主（`bind` 物化）。与 `workflow-governance`（流程技能）以文件为反腐边界：**本 change 不改任何 skills 语义**，只在 `norms/verification.md` 补一句「CI run 即合法观察点」的取证口径。**反腐约束：** 不新增/删除 `requiresCommands` 命令键，不改两份宿主清单的 `hooks`/`skills` 语义，不动 `scripts/pack.mjs` 的 FILES/DIRS 集合。
- **统一语言增量:**
  - **质量门 quality gate**：PR/main 上必须全绿的机器断言集合，取代执行者口头自证。
  - **严格断言 strict**：被依赖资源不可解析时**判红**，禁止静默降级为「未参与断言」。
  - **版本权威 version authority**：GitHub Release tag 是产物版本唯一真相；`tag ≠ package.json.version` 即判红，不做 CI 回写修正。
  - **资产契约 asset contract**：release 资产名必须匹配 CLI 侧解析正则；不匹配＝产物对消费者不存在。
  - **替代观察点 surrogate observation point**：本机不可取证时，以 CI run 链接形态存在的 runtime 证据。
  - **发布冒烟 release smoke**：发布后在隔离 HOME 里用真实 CLI 走完 `plan --release → execute → bind plan`，证明刚上传的产物可被消费。
- **聚合与不变量（每条须绑定观察点）:**
  - `分发产物`：`package.json.version == .claude-plugin.version == .codex-plugin.version == release tag 去 v`；产物含 `menu.md`/`README.md`/`skills`(8 个 `SKILL.md`)/`adapters/*`/`norms`/`rules`/`knowledge`/`docs`/`scripts`，不含 `test`/`shadow-docs`/`dist`/`.github`/`CLAUDE.md`/`.git`（与既有 pack 断言同源，不改语义）。
  - `一致性门`：`skills 引用 ⊆ requiresCommands ⊆ CLI 命令目录` 三级必须**全部参与断言**；CLI 命令目录不可解析时 strict 模式必须非零退出。
  - `知识治理`：active 卡必须出现在 `menu.md` 路由；卡片 8 字段齐全且 `status ∈ {active, deprecated}`；`source` 指向存在的 brief；`norms|knowledge|rules|docs|adapters|scripts` 路径引用零死链；`--forbid` 废弃 token 零残留；每个 `norms/*.md` 至少被一条路由或一处引用命中（无孤儿规范）。
  - `CI 语义`：两个 workflow 文件必须可被 YAML 解析器加载；质量门矩阵覆盖 ubuntu/macos/windows；`concurrency` 组按 ref 收敛不叠加；发布工作流 `permissions: contents: write` 且只由 `release.published` 触发。
- **领域事件:** PR opened/synchronize → 质量门；release published → 版本权威判定 → 三门 → pack → 资产契约断言 → 上传 → 消费冒烟；issue closed → 归档流（既有，不受影响）。

## 引用规范

- `knowledge/distribution-capability-contract.md`
  - 当前结论: 兼容判定用**能力名**不用版本号；能力缺失只能响亮阻塞、禁止静默降级；声明与消费同源登记；跨仓演进顺序＝消费方先行兼容、生产方随后声明。
  - 适用 scope: `scripts/check-requires.mjs`（strict 正是「禁止静默降级」纪律套到 CI 自身）、`.github/workflows/*`
- `knowledge/multi-host-plugin-distribution.md`
  - 当前结论: 新增宿主＝新增描述符；**禁止改写既有宿主清单语义**；hooks 声明即替换默认发现。
  - 适用 scope: 本 change 只读两份清单的版本字段（bump 脚本内），不改结构语义
- `norms/verification.md`
  - 当前结论: L 级＝每条不变量一个可追溯观察点；本机取不到证据必须写明缺口与替代观察点（CI run 链接）；知识治理流程检查卡片字段/分区/source/路由/死链/过期执行依赖。
  - 适用 scope: 本 change 把「知识治理流程」固化为脚本门，并让「CI run 链接」从抽象条款变成可执行证据形态
- `norms/knowledge-cards.md`
  - 当前结论: 一卡一知识单元；active 卡必须进 menu 路由；新增前按 `domain + keywords + scope` 查重；存量卡片不回溯迁移。
  - 适用 scope: 新增 `knowledge/release-artifact-pipeline.md` 与 menu 路由
- `rules/behavior.md` §2 / §3
  - 当前结论: 只实现当前需要的，不为未来灵活性加参数；不碰没坏的代码。
  - 适用 scope: strict 走「新增可选开关、默认保持旧行为」而非全量改语义；不动 pack 集合与清单结构
- `shadow-docs/changes/20261010-refactor-domain-driven-workflow/brief.md`（前置 change）
  - 当前结论: 记有「本仓无 CI 测试门＝结构性弱点」，是本 change 的动机来源与依赖基线。
  - 适用 scope: 前置/合并顺序

## 决策

- **选型:** 方案 A —— **断言式版本权威 + 一键 bump + CI 三门 + 发布冒烟**。
  1. `scripts/check-requires.mjs` 增严格模式（`--strict` 或 `SHADOW_REQUIRE_CLI_CATALOG=1`）：命令目录解析不到 → 判红退出 1；非 strict 保持旧行为（本机开发不被迫装 CLI），输出补 `catalog=resolved|unresolved` 让降级可见。
  2. 新增 `scripts/check-knowledge.mjs`：把上一 change 里我用一次性 python 手跑的**知识治理检查固化成门**——卡片字段/status 枚举/source 存在性/active 路由覆盖/引用死链/`--forbid` 残留 token/孤儿规范。
  3. 新增 `scripts/bump-version.mjs` + `npm run check:version`：一次同步三处 manifest，`check:version` 在 CI 与发布前判一致性（消灭历史上反复出现的漏同步）。
  4. 新增 `.github/workflows/quality-gate.yml`：`push: main` + `pull_request`；矩阵 `ubuntu/macos/windows × node 20/22`；步骤＝按 `cliVersion` 装 pin CLI（与 archive workflow 同款 `scripts/install-cli.sh install --version`）→ `npm test` → `check:requires` **strict** → `check-knowledge` → `check:version`；`concurrency` 按 ref 取消在跑的同类任务。
  5. 新增 `.github/workflows/publish-release.yml`：`on: release.types: [published]`；先跑**版本权威判定**（`github.ref_name` 去 `v` 必须 == `package.json.version`，不一致响亮失败并打印 `bump-version.mjs` 修正命令）→ 同组门 → `node scripts/pack.mjs` → **资产契约断言**（文件名匹配 CLI 侧正则）→ `gh release upload --clobber` → **发布冒烟**：`HOME` 隔离下 `shadow-dev workflow plan --release <tag>` → `workflow execute` → `bind plan --host codex`，证明刚发布的产物真能被 v1.5.0 消费；`permissions: contents: write`。
  6. 不做「tag 驱动 CI 自动 bump 回 main」：tag 与内容必须同源，产物取自 tag 的 tree，而 bump 提交落在 tag **之后**会让资产与 tag tree 不一致——等于把版本权威降级成「CI 事后修正」，可追溯性更差，还会再触发一轮 main push 门（自激风险）。
- **对比方案:**
  - **方案 B（纯 tag 驱动，CI 自动回写版本）**：未选，理由同上（资产与 tag tree 分裂）。但保留其诉求的替代实现：`bump-version.mjs` 让「先对齐再打 tag」成本降到一条命令，版本权威仍是 tag。
  - **方案 C（只加 `npm test` 的 CI，不动门与发布链）**：未选。留下半绿门与手工传资产两个已知故障源，且完全不满足「用 release 控制版本号」。
  - **方案 D（门并入 CLI 仓复用）**：未选。门断言的是**本仓产物语义**（skills 引用、卡片路由、清单版本），放进执行层就违反刚立的「依赖单向」结论。
  - **矩阵只跑 ubuntu**：未选。`pack.mjs`/`install-cli.sh`/`tar` 的跨平台坑已被 CLI 仓用 `bash -c` 与 Windows bsdtar 注释实证；只跑 ubuntu 等于把可发现性最差的一类回归留在暗处。代价＝每次 PR 6 个 job。
- **理由:** 三项故障源的共同点是「机器能判、却靠人自证」。strict 与版本权威判定都是把已有口头纪律变成非零退出；发布冒烟则是本 change 唯一能证明「Release 真的控制了版本号」的观察点——不冒烟就无法区分「资产名写对且可消费」与「传了个没人能装的文件」。

## 任务

### Phase 1 — 本机可全量自证的门
- [x] check-requires 严格模式 — `scripts/check-requires.mjs` — 命令目录不可解析时 strict 判红（非 strict 保持旧行为）；输出增 `catalog=resolved|unresolved`
- [x] 知识治理门 — `scripts/check-knowledge.mjs` — 卡片 8 字段与 status 枚举、`source` 存在性、active 卡 menu 路由覆盖、`norms|knowledge|rules|docs|adapters|scripts` 死链、`--forbid` 废弃 token、孤儿规范；无依赖纯 node 实现
- [x] 版本一致性与 bump — `scripts/bump-version.mjs`, `package.json` — `check:version` 判三处 manifest 同源；`bump-version.mjs <ver>` 一次写三处并打印变更；新增 `check:knowledge` script 聚合入口

### Phase 2 — GitHub Actions
- [x] 质量门工作流 — `.github/workflows/quality-gate.yml` — push main + PR；矩阵 ubuntu/macos/windows × node 20/22；装 pin CLI → `npm test` → `check:requires --strict` → `check:knowledge` → `check:version`；concurrency 按 ref 取消
- [x] 发布工作流 — `.github/workflows/publish-release.yml` — release.published → 版本权威判定（不一致即失败并提示 bump）→ 同组门 → pack → 资产名契约断言 → `gh release upload --clobber` → 隔离 HOME 消费冒烟（plan --release / execute / bind plan）

### Phase 3 — 口径与知识闭环
- [x] 验证口径更新 — `norms/verification.md` — 「替代观察点」段补明：本仓 `quality-gate` 与 `publish-release` 的 run 链接即合法 runtime 观察点；知识治理检查改由 `scripts/check-knowledge.mjs` 执行，AI 手跑仅作提交前预检
- [x] 发布链知识卡与路由 — `knowledge/release-artifact-pipeline.md`, `knowledge/distribution-capability-contract.md`, `menu.md` — 结论：版本权威＝release tag、资产名正则契约、发布冒烟三件套、strict 门禁止半绿；按 `domain + keywords + scope` 查重后新增并加 menu 路由；能力契约卡**原位更新**（追加「严格断言不得半绿」执行约束与第 5 项验证方式＝发布冒烟，并追加 source），不新建重复卡
- [x] 文档口径 — `README.md`, `CLAUDE.md` — 补 CI 与发布段、`scripts/` 三门清单；分层规则加一行「`scripts/` 机器门＝可重复验证的执法层，AI 口头自证不可替代」

### Phase 4 — 取证与收口
- [x] 观察点执行与记录 — `shadow-docs/changes/20261010-build-quality-gate/brief.md` — 本机真实跑并记输出：`npm test`（11 例）、`check:requires` 非 strict 绿 + strict 在 `SHADOW_DEV_CLI` 指向空壳时**判红**（拒绝路径）、`check-knowledge` 当前绿 + 注入死链/废弃 token fixture 时**判红**后回滚、`check:version` 当前绿 + 人为改坏一处版本时判红后回滚、两个 workflow 的 YAML 解析校验（本机解析器；无则记缺口）；GitHub 侧（矩阵真跑、发布冒烟）缺口写明，待 PR/首次 release 的 run 链接回填

## 结果

- 实际耗时: ≈35 分钟（含两次自我破坏的返工与一轮 139 抖动排查）
- 验证: **L 级＝每条不变量一个可追溯观察点**，全部为本机真实命令输出：

| # | 不变量 | 观察点与真实输出 |
|---|--------|------------------|
| I1 `分发产物` | 三处 manifest 与 release tag 同源；产物含新卡与新门脚本、8 skills、不含 `.github` | `node scripts/bump-version.mjs 6.7.0` → `· package.json / .claude-plugin / .codex-plugin → 6.7.0` + `✓ 版本 bump 完成: 6.7.0`；`npm run check:version` → `✓ 三处 manifest 版本同源: 6.7.0（3 个文件）`；`node scripts/pack.mjs` → `dist/shadow-dev-workflow-v6.7.0.tar.gz`，`tar -tzf` 关键项 **4/4**（`knowledge/release-artifact-pipeline.md`、`norms/verification.md`、`scripts/check-knowledge.mjs`、`scripts/bump-version.mjs`）、`skills=8`、`.github 条目=0`；资产名判定 `✓资产名契约: shadow-dev-workflow-v6.7.0.tar.gz`，负例 `✗ 拒绝 shadow-dev-workflow-6.7.0.tgz` |
| I2 `一致性门` | 三级包含全部参与断言；命令目录不可解析时 strict 必须判红 | 绿路：`npm run check:requires:strict` → `declared=29 skills-referenced=21 undeclared=[] cli-catalog=46 catalog=resolved strict=on missing-in-cli=[]` + `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`；拒绝路径：`SHADOW_DEV_CLI=/private/tmp/nope.mjs` → strict `rc=1`（`catalog=unresolved`），**非 strict 同条件 `rc=0` 且自曝「（CLI 目录未参与断言）」——半绿故障被复现并锁死**；`npm run ci` 整体 `rc=0` |
| I3 `知识治理` | 卡片字段/status/source（含归档兜底）/active 路由/死链/forbid 残留/孤儿规范/技能 frontmatter | `npm run check:knowledge` → `摘要: ok=4 warn=4 fail=0`（知识卡 5 张、技能 8 个、51 文件零死链、孤儿规范 0）；warn 明细＝2 张存量卡缺 `verified-depth`（豁免）+ 2 张卡 source 经归档兜底解析；拒绝路径：`--forbid 'bump-version'` → `rc=1`；CI 现行组合 `--forbid 'tdd-verification,▶ [TDD]'` → `rc=0` |
| I4 `CI 语义` | workflow 可解析；矩阵覆盖三平台；发布流水 9 步齐备 | `ruby -ryaml YAML.load_file` → 三个 yml 全部 `YAML 可解析`；`publish-release.yml` steps=9（tag tree checkout → 版本权威判定 → 装 pin CLI → 四门 → pack → 资产契约断言 → upload → 隔离 prefix 冒烟）；`quality-gate.yml` 矩阵 `ubuntu/macos/windows × node 20/22`、`concurrency` 按 ref 取消、`permissions: contents: read` |

- **GitHub 侧证据缺口（如实标注）**：矩阵真跑、`install-cli.sh` 在 runner 上的 pin 安装、发布冒烟三步均未在本机执行。替代观察点＝本 PR 的 `quality-gate` run 链接与首个 `publish-release` run 链接（新加的 workflow 文件在 `pull_request` 事件下由 PR 的 merge ref 提供，故**首个 PR 就会真跑**）。合并后回填本行。
- 过程记录（诚实，含四次自我破坏/环境坑）:
  1. **门自身的缺陷**：`check-requires.mjs` 原来对 `shadow-dev help --full --json` 的**整段 stdout** 做 `JSON.parse`——非 TTY 下 CLI 的 human 帮助层与 JSON 同流写出，解析必抛 → `catalog=unresolved`，即这条门在 CI/管道环境里**恒假红**（本机偶然判绿只是因为 shim 恰好回了纯 JSON）。修法：取最后一个 `{"ok"` 契约行 + `execFileSync` 加 `timeout`（默认 20s，`SHADOW_CLI_TIMEOUT_MS` 可调）。这是新门立项的第一个真实收益。
  2. `check-knowledge.mjs` 首版把 `walk()` 的 rel 拼成绝对式路径，`!rel.startsWith('shadow-docs')` 守卫失效 → 30 份归档 brief 被当 live 文件读，脚本 60+ 秒无输出挂死。修正 rel 语义后 **0.33s** 跑完。
  3. 新门立刻抓到两条**长期存在的数据缺陷**：两张跨项目卡的 `source` 指向 `changes/<name>/brief.md`，而对应 brief 已随 #36/#32 归档搬进 `changes/archive/`——按字面路径判红。门改成「向 archive 兜底解析 + 兜底成功打 warn」，并把「归档会搬迁 source」写进卡片与 `release-artifact-pipeline.md` 执行约束，避免下一张卡重踩。
  4. 两处编辑脚本因锚点与分支原文不符而 `assert` 中止（写入统一放末尾，未产生半成品）；一次 `echo ${PIPESTATUS[0]}` 在 zsh 下空值中断了 `&&` 证据批，改为落盘日志再取。
- 交付: 待 push / PR（本 change 为 stacked：base＝`refactor/20261010-refactor-domain-driven-workflow`）

## 知识评估

- **预期影响:** 新增 + 更新
- **候选卡片:** `knowledge/release-artifact-pipeline.md`（新增，版本权威/资产契约/发布冒烟/禁止半绿）、`knowledge/distribution-capability-contract.md`（原位更新：追加「同一纪律套在自己的机器门上」执行约束、验证方式第 5 项发布冒烟与第 6 项半绿负例、追加 source、`verified` 2026-10-10）、`norms/verification.md`（替代观察点条款具体化为两条流水；知识治理流程改为脚本执行）、`menu.md`（新增「发布与质量门」路由）
- **理由:** 「Release 是版本与产物的唯一权威 + 资产名正则契约 + 发布必须冒烟 + 机器门禁止半绿」是跨项目可复用的分发事实，值得独立成卡；「一致性门也要 strict」是既有能力契约卡的**加强**而非新事实，故原位更新并追加 source，不建重复卡（`norms/knowledge-cards.md` 查重条款）。`verified-depth` 现记 `unit`（本机四门 + 11 例测试 + 三处负例复现），待首个 `publish-release` run 的冒烟输出后再升 `runtime`——未达到的深度不虚报。


## 知识评估

- **预期影响:** 新增 + 更新
- **候选卡片:** `knowledge/release-artifact-pipeline.md`（新增）、`knowledge/distribution-capability-contract.md`（追加「严格断言不得半绿」与发布冒烟为验证方式第 5 项）、`norms/verification.md`（替代观察点条款具体化）、`menu.md`（新卡路由）
- **理由:** 「版本权威＝release tag + 资产名正则契约 + 发布冒烟」是跨项目可复用的分发事实，不属单次变更过程，故进 active 卡；`distribution-capability-contract.md` 的既有结论被本次工作**加强**（同一纪律套到 CI），属原位更新并追加 source 而非新建重复卡。`verified-depth` 按 Phase 4 实际达到值填写（本机门为 `unit`/`runtime`，GitHub 侧未取到证据前不得写 `runtime`）。
