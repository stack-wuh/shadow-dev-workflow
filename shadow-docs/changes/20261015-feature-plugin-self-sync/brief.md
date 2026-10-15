---
{
  "schema": "shadow-dev/v1",
  "name": "20261015-feature-plugin-self-sync",
  "type": "feature",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "feature/20261015-feature-plugin-self-sync",
  "files": [
    "README.md",
    "adapters/claude-code.json",
    "docs/cli-guide.md",
    "hooks/bootstrap.mjs",
    "hooks/hooks.codex.json",
    "hooks/hooks.json",
    "knowledge/multi-host-plugin-distribution.md",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261015-feature-plugin-self-sync/brief.md",
    "test/bootstrap.test.mjs",
    "test/install-cli.test.mjs",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 70,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/70",
    "pullRequest": 71,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/71"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "4984ed64526875742389df91fb8c2564c6ac8d9d",
    "verifiedAt": "2026-10-15T07:48:18.381Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:71",
    "planHash": "704cc168ee626d99c345e5788338b054421885c9a6c3e91c47466cb0968efa09",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] SessionStart 自举 node 化并接入本机插件自同步",
      "titleRaw": "[feature] SessionStart 自举 node 化并接入本机插件自同步",
      "supplement": "",
      "body": "## 动机\n用户问「如何做到自动更新」时暴露两层问题：①本机 ZCode 安装停在 6.3.1 数日（v7.0–v7.2 三个版本未流入），且 SessionStart 自举数日未把 CLI pin v1.7.0 装到位；②宿主日志 `hook.run.failed` ×11 无原因，深挖后实锤根因——ZCode 的 process hook 直接 spawn `command`，Windows 上裸 `bash` 先命中 `WindowsApps\\bash.exe`（WSL 入口桩），未启用子系统时只打印安装提示、不执行脚本，hook 形同不存在（仓库在 Codex 侧早已用 `commandWindows` 绕过该缺陷，ZCode 侧漏配）。修复方向写进装配契约：入口统一 node 形态（宿主 PATH 稳定可达），bash 只在入口内部经 `scripts/resolve-bash.mjs` 显式解析；顺带把「本机安装随发版自动更新」落进自举入口，终结手工 `plugins update`。\n\n## 引用规范\n- `rules/iron-laws.md`\n  - 当前结论: 验证强度按评级匹配；静默降级是本仓所有门与装配逻辑的共同禁项\n  - 适用 scope: `hooks/`、`test/`、本 change 的「结果」段取证\n- `norms/verification.md`\n  - 当前结论: L 级每条不变量一个可追溯观察点，覆盖拒绝路径与状态不变量；取证策略 assert-first 须断言先红后绿\n  - 适用 scope: 四条 INV 的取证设计与「结果」段\n- `knowledge/multi-host-plugin-distribution.md`\n  - 当前结论: 直 spawn 型宿主上裸 bash 会命中 WSL 入口桩；入口统一 node 形态、内部经 resolve-bash 解析可信 bash\n  - 适用 scope: hooks 装配与宿主兼容性\n\n## 决策\n- **入口选 node 而非修 bash 解析**：直接在 hook 里做 bash 路径覆盖（如 Codex 的 commandWindows）需要逐宿主适配且换宿主即漏配；node 是宿主 PATH 的最稳定共识项（本仓硬前提 node>=20），一处入口三宿主统一，bash 降级为实现细节并复用既有唯一口径 `resolve-bash.mjs`。\n- **自同步只进 ZCode 插件形态、只认目录型源**：GitHub 型 marketplace 的刷新语义归宿主自身，插件不代管；`bind` 形态无安装记录，直接跳过。三条件门宁窄勿宽——误同步开发态版本的代价（本机被塞入未发布代码）远高于一次手工命令。\n- **源仓必须停在 main**：目录型源的「版本」就是工作树里的 plugin.json，开发分支上的 bump 属开发态，静默跳过。\n- **新建套件文件而非塞进既有文件**：自举入口是新表面，其契约（触发/拒绝/失败语义）应与既有 install-cli/pack 套件解耦；L 级 + assert-first 满足 INV-4 边界。\n- **明确不做**：不动 `requiresCommands`/`cliVersion`；不把 host 更新逻辑放进 shadow-dev CLI（属宿主管理域，非本仓产物职责）；不为一次修正新建知识卡片（按 norms 更新既有 distribution 卡）。\n\n## 任务\n- [x] task-1 — `hooks/bootstrap.mjs,hooks/hooks.json,hooks/hooks.codex.json` — node 形态入口 + 插件自同步落盘\n- [x] task-2 — `test/bootstrap.test.mjs,test/install-cli.test.mjs,test/pack.test.mjs,package.json` — 契约断言先红后绿，套件纳入 test 脚本\n- [x] task-3 — `README.md,docs/cli-guide.md,adapters/claude-code.json` — 入口形态与自同步说明同步\n- [x] task-4 — `knowledge/multi-host-plugin-distribution.md` — 装配约束与自同步结论更新，source/verified 同步\n- [x] task-5 — 观察点取证 — 四条 INV 真实命令输出 + 宿主环境模拟 + 拒绝路径\n\n完整 brief：shadow-docs/changes/20261015-feature-plugin-self-sync/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261015-feature-plugin-self-sync\",\"type\":\"feature\",\"scope\":\"distribution\",\"status\":\"branched\",\"branch\":\"feature/20261015-feature-plugin-self-sync\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261015-feature-plugin-self-sync/brief.md\",\"cliVersion\":\"1.7.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "feature"
      ]
    },
    "release": {
      "files": [
        "README.md",
        "adapters/claude-code.json",
        "docs/cli-guide.md",
        "hooks/bootstrap.mjs",
        "hooks/hooks.codex.json",
        "hooks/hooks.json",
        "knowledge/multi-host-plugin-distribution.md",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261015-feature-plugin-self-sync/brief.md",
        "test/bootstrap.test.mjs",
        "test/install-cli.test.mjs",
        "test/pack.test.mjs"
      ],
      "message": "feat(distribution): SessionStart 自举 node 化并接入本机插件自同步",
      "title": "feat(distribution): SessionStart 自举 node 化并接入本机插件自同步",
      "body": "## 变更\n- `hooks/bootstrap.mjs`（新增）：SessionStart 自举入口（node 形态）——CLI 锁版本自举（内部经 `scripts/resolve-bash.mjs` 调 `bootstrap-cli.sh`）+ 本机插件自同步；成功静默、失败仅 stderr、恒 exit 0。\n- `hooks/hooks.json`、`hooks/hooks.codex.json`：入口命令切 node 形态；Codex 侧删除不再需要的 `commandWindows` bash 绕行。\n- `test/bootstrap.test.mjs`（新增）及 `test/install-cli.test.mjs`、`test/pack.test.mjs`、`package.json`：自同步触发与三条拒绝路径、失败语义、去桩告警的契约断言；装配静态契约同步 node 形态；打包集断言补新入口与解析器依赖。\n\n## 影响\n- 行为/触发面变化：三宿主 SessionStart 自举入口统一 node 形态——修复 ZCode（直 spawn 型宿主）上裸 `bash` 命中 WindowsApps 的 WSL 入口桩导致 hook 恒失败（本机实证 `hook.run.failed` ×11、CLI pin 数日未自举）；ZCode 插件形态新增「本机安装随发版自动同步」（目录型 marketplace 源仓在 main 且版本领先时自动 `marketplace update` + `plugins update`，重启生效）。\n- 明确不受影响的范围：`skills/**`、`norms/**`、`rules/**` 未触碰；`requiresCommands` 与 `cliVersion`（v1.7.0）不动；失败兜底语义不变（仅 stderr 告警、恒 exit 0、不阻塞会话）。\n- 回滚方式：revert 本 PR 即回退 bash 入口（Windows 直 spawn 宿主恢复为自举失败态，需 `SHADOW_CLI_HOOK_DISABLE=1` 或手动更新插件）。\n\n## 验证\n- `npm run ci` exit 0：版本同源 7.2.0 / `check:requires:strict` ✓ / `check:knowledge` fail=0 / `check:brief` fail=0 / `check:smoke` fail=0 / `npm test` 35 pass 0 fail。\n- 四条不变量逐条观察点（含拒绝路径）见 brief「结果」段：装配契约先红后绿（`'node' !== 'bash'`）、自同步三条件门 stub 调用日志精确匹配、宿主环境模拟（纯用户/机器 PATH）`stdout+stderr=[]` 且 exit 0、解析器落 `git-bin` 去 WSL 桩。\n- 未覆盖项（明说）：真实自同步端到端待 7.3.0 发版 + 宿主重启后首个会话回填。\n\n## 关联\n- Closes #70\n- brief: shadow-docs/changes/20261015-feature-plugin-self-sync/brief.md"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/multi-host-plugin-distribution.md",
    "reason": "宿主 hook 装配的 bash 陷阱（直 spawn 宿主 + Windows WSL 入口桩）与 node 形态入口/本机自同步纪律属长期有效事实，已原位更新卡片约束并追加 source"
  }
}
---

# 20261015-feature-plugin-self-sync

## 复杂度评级
- **评级:** L
- **理由:** ①触及套件断言文件（新建 `test/bootstrap.test.mjs` + 同步两份既有测试的装配契约断言），按 INV-4 套件变更只能在 L 级；②改变宿主启动行为语义（SessionStart hook 的入口形态与新增自同步动作），属跨会话可感知的行为变更；③触及面跨 hooks/测试/文档/知识卡片/打包断言。取 evidence 强度：每条不变量真实命令 + 真实输出，覆盖拒绝路径。
- **期望验证深度:** runtime——宿主环境模拟（纯用户/机器 PATH）+ 套件全绿 + 拒绝路径实测
- **取证策略:** assert-first（装配契约断言先红后绿：hooks.json 切 node 前，既有静态契约测试实测红 `'node' !== 'bash'`）

## 领域模型

- **限界上下文:** `distribution` — 分发一致性与宿主装配：产物、插件清单、SessionStart 自举与本机安装的版本同源。上游：`knowledge/multi-host-plugin-distribution.md` 的宿主差异结论；下游：本机 ZCode/Claude Code/Codex 安装的日常使用。反腐边界：不改 `shadow-dev` CLI 命令面、不动 `requiresCommands` 与 `cliVersion` pin、不改技能正文语义。
- **统一语言增量:**
  - **node 形态自举入口**：SessionStart hook 的 `command` 固定为 `node`、指向 `hooks/bootstrap.mjs`；bash 只作为入口内部经可信解析器调用的实现细节，不再出现在宿主直接 spawn 的位置。
  - **本机插件自同步（self-sync）**：目录型 marketplace 源仓版本领先于已装插件版本时，由自举入口自动完成 marketplace 刷新与插件更新，重启宿主生效。
- **聚合与不变量:**
  - INV-1 装配契约：SessionStart 入口为 node 形态且 `args` 指向 `hooks/bootstrap.mjs`；`.claude-plugin/plugin.json` 的 hooks 声明不变——静态契约测试钉住，回退 bash 形态即判红。
  - INV-2 自同步三条件门：仅当 ZCode 插件形态（`ZCODE_PLUGIN_ID` 存在）∧ marketplace 为目录型且源仓版本 ≠ 已装版本 ∧ 源仓处于 `main` 时，才执行 `plugins marketplace update` + `plugins update`；任一不满足则零副作用（不触 zcode CLI）。
  - INV-3 失败语义恒不阻塞：任何失败路径（bash 不可用、zcode CLI 缺失、子命令非零退出）只产生 stderr 告警，hook stdout 恒空、exit 恒 0，绝不阻塞会话。
  - INV-4 可信 bash 去桩：宿主 PATH 上 bash 仅命中 WSL 入口桩时，解析器判不可用并指名告警；`SHADOW_DEV_BASH` 显式指向无效路径同样拒绝，禁止静默改用其它解释器。
- **被触及既有不变量:** 打包集必须含新入口与解析器依赖；`check:knowledge` 引用零死链；CI 废弃 token 扫描零命中。

## 引用规范
- `rules/iron-laws.md`
  - 当前结论: 验证强度按评级匹配；静默降级是本仓所有门与装配逻辑的共同禁项
  - 适用 scope: `hooks/`、`test/`、本 change 的「结果」段取证
- `norms/verification.md`
  - 当前结论: L 级每条不变量一个可追溯观察点，覆盖拒绝路径与状态不变量；取证策略 assert-first 须断言先红后绿
  - 适用 scope: 四条 INV 的取证设计与「结果」段
- `knowledge/multi-host-plugin-distribution.md`
  - 当前结论: 直 spawn 型宿主上裸 bash 会命中 WSL 入口桩；入口统一 node 形态、内部经 resolve-bash 解析可信 bash
  - 适用 scope: hooks 装配与宿主兼容性

## 动机

用户问「如何做到自动更新」时暴露两层问题：①本机 ZCode 安装停在 6.3.1 数日（v7.0–v7.2 三个版本未流入），且 SessionStart 自举数日未把 CLI pin v1.7.0 装到位；②宿主日志 `hook.run.failed` ×11 无原因，深挖后实锤根因——ZCode 的 process hook 直接 spawn `command`，Windows 上裸 `bash` 先命中 `WindowsApps\bash.exe`（WSL 入口桩），未启用子系统时只打印安装提示、不执行脚本，hook 形同不存在（仓库在 Codex 侧早已用 `commandWindows` 绕过该缺陷，ZCode 侧漏配）。修复方向写进装配契约：入口统一 node 形态（宿主 PATH 稳定可达），bash 只在入口内部经 `scripts/resolve-bash.mjs` 显式解析；顺带把「本机安装随发版自动更新」落进自举入口，终结手工 `plugins update`。

## 覆盖范围

- `hooks/bootstrap.mjs`（新增）：SessionStart 自举入口（node）——CLI 锁版本自举（调 bootstrap-cli.sh）+ 本机插件自同步；成功静默、失败仅 stderr、恒 exit 0。
- `hooks/hooks.json`、`hooks/hooks.codex.json`：入口命令切 node 形态；Codex 侧删除已无必要的 `commandWindows` bash 绕行。
- `test/bootstrap.test.mjs`（新增）：自同步触发/三条拒绝路径 + 失败语义 + 去桩告警的契约断言；`test/install-cli.test.mjs`：装配静态契约断言同步为 node 形态；`test/pack.test.mjs`：打包集补 `bootstrap.mjs` 与 `resolve-bash.mjs` 断言。`package.json`：test 脚本纳入新套件。
- `README.md`、`docs/cli-guide.md`、`adapters/claude-code.json`：自举入口形态与自同步说明同步。
- `knowledge/multi-host-plugin-distribution.md`：装配约束从「bash + commandWindows 绕行」更新为「node 形态入口 + 内部可信解析」；补自同步结论；source 追加本 brief、verified 更新。
- `shadow-docs/INDEX.md`：登记本 change（index rebuild）。

## 决策

- **入口选 node 而非修 bash 解析**：直接在 hook 里做 bash 路径覆盖（如 Codex 的 commandWindows）需要逐宿主适配且换宿主即漏配；node 是宿主 PATH 的最稳定共识项（本仓硬前提 node>=20），一处入口三宿主统一，bash 降级为实现细节并复用既有唯一口径 `resolve-bash.mjs`。
- **自同步只进 ZCode 插件形态、只认目录型源**：GitHub 型 marketplace 的刷新语义归宿主自身，插件不代管；`bind` 形态无安装记录，直接跳过。三条件门宁窄勿宽——误同步开发态版本的代价（本机被塞入未发布代码）远高于一次手工命令。
- **源仓必须停在 main**：目录型源的「版本」就是工作树里的 plugin.json，开发分支上的 bump 属开发态，静默跳过。
- **新建套件文件而非塞进既有文件**：自举入口是新表面，其契约（触发/拒绝/失败语义）应与既有 install-cli/pack 套件解耦；L 级 + assert-first 满足 INV-4 边界。
- **明确不做**：不动 `requiresCommands`/`cliVersion`；不把 host 更新逻辑放进 shadow-dev CLI（属宿主管理域，非本仓产物职责）；不为一次修正新建知识卡片（按 norms 更新既有 distribution 卡）。

## 任务
- [x] task-1 — `hooks/bootstrap.mjs,hooks/hooks.json,hooks/hooks.codex.json` — node 形态入口 + 插件自同步落盘
- [x] task-2 — `test/bootstrap.test.mjs,test/install-cli.test.mjs,test/pack.test.mjs,package.json` — 契约断言先红后绿，套件纳入 test 脚本
- [x] task-3 — `README.md,docs/cli-guide.md,adapters/claude-code.json` — 入口形态与自同步说明同步
- [x] task-4 — `knowledge/multi-host-plugin-distribution.md` — 装配约束与自同步结论更新，source/verified 同步
- [x] task-5 — 观察点取证 — 四条 INV 真实命令输出 + 宿主环境模拟 + 拒绝路径

## 结果

评级 L，取证策略 assert-first；每条不变量一个可追溯观察点（真实命令 + 真实输出），覆盖拒绝路径。

| 不变量 | 观察点 |
|--------|--------|
| INV-1 | 观察点：先红——`npm run ci` 首跑装配静态契约判红 `AssertionError [ERR_ASSERTION]: 'node' !== 'bash'`（test/install-cli.test.mjs:176）；后绿——`hooks/hooks.json` 与契约断言同步 node 形态后 `npm test` 35/35 通过，`node --test test/install-cli.test.mjs` 断言 `command=node`、args→`bootstrap.mjs`、`bootstrap.mjs` 与 `bootstrap-cli.sh` 双双存在 |
| INV-2 | 观察点：`node --test test/bootstrap.test.mjs` 5/5——不一致+main 用例的 stub zcode CLI 调用日志恰为 `plugins marketplace update mkt` 与 `plugins update shadow-dev-workflow` 两行且 stderr 报 `已同步：1.0.0 → 9.9.9`；三条拒绝路径（版本一致 / 源仓在 feature 分支 / 非 ZCode 形态）stub 调用数恒 0 |
| INV-3 | 观察点：同套件逐用例断言 `stdout === ''` 且 `status === 0`；宿主环境模拟（PowerShell 置纯用户/机器 PATH）`node hooks/bootstrap.mjs` → `stdout+stderr=[]`、`exit=0`；负例 `SHADOW_DEV_BASH=…\WindowsApps\bash.exe` → 仅 stderr 指名告警、`exit=0` |
| INV-4 | 观察点：宿主 PATH 下解析器实测 `{"path":"C:\\Program Files\\Git\\bin\\bash.exe","source":"git-bin"}`（WindowsApps 桩被跳过）；负例断言 stderr 含 `已被判定无效` |

- 门槛：`npm run ci` exit 0——版本同源 7.2.0、`check:requires:strict` ✓、`check:knowledge` fail=0、`check:brief` fail=0、`check:smoke` fail=0、`npm test` 35 pass / 0 fail。
- 未验证项（明说）：真实自同步端到端（发版 7.3.0 后由宿主重启后的首个会话自动完成本机安装更新）尚未发生；本 change 的验证止于「宿主环境模拟 + 套件断言 + 拒绝路径」，发布后的实链路届时以宿主会话证据回填。
