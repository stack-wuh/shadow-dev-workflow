---
{
  "schema": "shadow-dev/v1",
  "name": "20261009-feature-codex-host-support",
  "type": "feature",
  "scope": "shadow-dev-workflow/adapters,hooks,skills,rules,scripts,test",
  "status": "published",
  "baseBranch": "main",
  "branch": "feature/20261009-feature-codex-host-support",
  "files": [
    ".agents/plugins/marketplace.json",
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "README.md",
    "adapters/codex.json",
    "hooks/hooks.codex.json",
    "knowledge/multi-host-plugin-distribution.md",
    "menu.md",
    "package.json",
    "rules/behavior.md",
    "rules/iron-laws.md",
    "scripts/pack.mjs",
    "shadow-docs/changes/20261009-feature-codex-host-support/brief.md",
    "shadow-docs/signals.md",
    "skills/shadow-dev-hotfix/SKILL.md",
    "skills/shadow-dev-release/SKILL.md",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 31,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/31",
    "pullRequest": 32,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/32"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "00efab66e107635c5c44a75e929b9bd185e54d39",
    "verifiedAt": "2026-10-09T07:49:49.669Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:32",
    "planHash": "e17e75dfa7a1f7a630e95eef67bd000b12748b007090a0f9cf39bd1766b10615",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] Codex 宿主支持——三清单分发契约与双 hooks 描述符",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\n本仓是 Claude Code 插件库，用户要求判断并落地「能否在 Codex 里使用」。实测结论：技能格式同源可直接复用，但 Codex 的插件清单目录（`.codex-plugin/`）、marketplace 形态（`.agents/plugins/marketplace.json` + `source:{source,path}`）与 hook handler schema（`type: command` + `timeout` 秒 + `commandWindows`）都与 Claude 形态不同；原 `hooks/hooks.json` 的 `type: \"process\"` + `args` + `timeoutMs` 在 Codex 侧属不支持 handler（`prompt`/`agent` 被解析后跳过，`process` 不在支持集）。技能正文还存在宿主绑定措辞（`AskUserQuestion`、`Grep/Glob`、`CLAUDE.md`），跨宿主会失效。目标是在**不动 Claude 侧任何字节**的前提下，让同一份产物被 Codex 原生消费。\n\n## 引用规范\n- `norms/tdd-verification.md`\n  - 当前结论: 分级制（S/M/L）验证强度与评级匹配非协商；M 级要求绿灯测试 + 走查；进度可见性四条款适用于一切 Phase 任务；分支纪律——先建功能分支，main 不接受直接 commit\n  - 适用 scope: 本 change 的测试与提交流程编排\n- `norms/knowledge-cards.md`\n  - 当前结论: 新事实建卡并进 menu 路由；`verified-depth: runtime` 必须附可追溯观察点；标题描述稳定领域事实，禁止用事件命名\n  - 适用 scope: 知识写回步骤（新增多宿主分发卡）\n- `norms/signals.md`\n  - 当前结论: 信号在 review 知识写回步骤双评估；负信号必须深度 runtime 且带退役条件，单次语境 weight ≤ 2\n  - 适用 scope: 本仓 `shadow-docs/signals.md` 两条新信号\n- `norms/code-style.md`\n  - 当前结论: 最小改动、不顺手重构无关内容；单一职责\n  - 适用 scope: hooks 采用双文件而非改写既有 `hooks.json`；措辞修正限于已确认的宿主绑定项，不重写正文\n\n## 决策\n- **选型:** 双清单 + 双 hooks 文件——新增 `.codex-plugin/plugin.json`（显式 `\"skills\": \"./skills/\"`、`\"hooks\": \"./hooks/hooks.codex.json\"`，路径带 `./` 前缀以过 Codex path rules），Claude 侧 `.claude-plugin/plugin.json` 与 `hooks/hooks.json` 保持原样；Codex 清单显式声明 hooks 即**替换**默认文件发现，因此 `hooks.json` 与 `hooks.codex.json` 互不干扰\n- **对比方案:** ① 改写单一 `hooks.json` 为 `type: command`——Claude Code 现用 `process` + `args` 语义，赌它同时接受 command 会破坏已发布宿主；② 只走 `adapters/codex.json` 的 bind 路线——bind 只复制 `skills/`，技能对 `norms/`、`menu.md` 的跨文件引用脱离产物根目录，等价性不足（该缺口三家宿主共有，属 `shadow-dev-cli` 的 bind 域职责，本 change 不越界修）\n- **理由:** 插件路线把整包（`menu.md`/`norms`/`knowledge`/`rules`）带入 `~/.codex/plugins/cache/`，引用完整；实测 Codex 已用同一形态分发 superpowers（`.claude-plugin` 与 `.codex-plugin` 并存），本仓沿用该模板即与宿主期望一致\n- **已知取舍:** Windows 自举依赖 bash。`install-cli.sh` 不识别 CLI 的 LINK 直通轨，信任 hook 后本机版本变更会额外 materialize 一份 pin 版（shim 仍优先 LINK，不影响双仓开发）；README 已写明可用 `SHADOW_CLI_HOOK_DISABLE=1` 关闭。跨仓库的 LINK 感知与 bind 的 `junction` 策略留待 CLI 侧后续 change\n\n## 任务\n### Phase 1 · 分发契约\n- [x] Codex 插件清单——`.codex-plugin/plugin.json` — skills/hooks 显式 `./` 路径 + interface 展示元数据\n- [x] Codex hooks 描述符——`hooks/hooks.codex.json` — `type: command` + `${PLUGIN_ROOT}` POSIX 命令 + `commandWindows` Git Bash 优先链\n- [x] Codex marketplace 目录——`.agents/plugins/marketplace.json` — `source: {source: local, path: ./}`，name 与 Claude marketplace 对齐\n- [x] bind 宿主描述符备档——`adapters/codex.json` — `skillsDir: ~/.codex/skills`，`--host auto` 可探测\n- [x] 打包分发集扩展——`scripts/pack.mjs` — DIRS 追加 `.agents`、`.codex-plugin`\n\n### Phase 2 · 机检与去宿主绑定\n- [x] 产物与版本机检——`test/pack.test.mjs` — 5 条新产物断言 + 三处 manifest 与 package.json 版本对齐机检\n- [x] 措辞去宿主绑定——`skills/shadow-dev-hotfix/SKILL.md`, `skills/shadow-dev-release/SKILL.md`, `rules/behavior.md`, `rules/iron-laws.md` — `AskUserQuestion`/`Grep/Glob`/`CLAUDE.md` 改中立表述\n- [x] 版本号同步 6.4.0——`package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` — 由新加的版本机检守护\n- [x] 宿主文档——`README.md` — 新增「Codex 宿主」小节（两条路线命令、hook 信任、Windows 自举注意）与依赖补项\n\n### Phase 3 · 知识写回\n- [x] 多宿主分发知识卡——`knowledge/multi-host-plugin-distribution.md` + `menu.md` 路由 — 稳定事实：三清单形态、hook schema 差异、引用完整性取决于路线\n- [x] 信号写回——`shadow-docs/signals.md` — 高分正向「先跑 codex plugin list/add 拿清单校验日志」+ 负向「pack.test 解包在 Windows 必失败」\n\n完整 brief：shadow-docs/changes/20261009-feature-codex-host-support/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261009-feature-codex-host-support\",\"type\":\"feature\",\"scope\":\"shadow-dev-workflow/adapters,hooks,skills,rules,scripts,test\",\"status\":\"branched\",\"branch\":\"feature/20261009-feature-codex-host-support\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261009-feature-codex-host-support/brief.md\",\"cliVersion\":\"1.4.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": []
    },
    "commit": {
      "files": [
        "shadow-docs/changes/20261009-feature-codex-host-support/brief.md"
      ],
      "message": "docs(shadow): review passed 与知识评估（新增多宿主分发卡 + SGN-009/010）——20261009-feature-codex-host-support"
    }
  },
  "knowledge": {
    "action": "新增",
    "target": "knowledge/multi-host-plugin-distribution.md",
    "reason": "Claude Code 与 Codex 的清单目录、marketplace 形态、hook handler schema 差异，以及 bind 与插件两路线的引用完整性差异，属可跨项目复用的稳定事实，本轮已达 runtime 深度（4 条可追溯观察点）；另按 norms/signals.md 写入本仓 SGN-009/010 两条信号"
  }
}
---

# Codex 宿主支持——三清单分发契约与双 hooks 描述符

## 动机

本仓是 Claude Code 插件库，用户要求判断并落地「能否在 Codex 里使用」。实测结论：技能格式同源可直接复用，但 Codex 的插件清单目录（`.codex-plugin/`）、marketplace 形态（`.agents/plugins/marketplace.json` + `source:{source,path}`）与 hook handler schema（`type: command` + `timeout` 秒 + `commandWindows`）都与 Claude 形态不同；原 `hooks/hooks.json` 的 `type: "process"` + `args` + `timeoutMs` 在 Codex 侧属不支持 handler（`prompt`/`agent` 被解析后跳过，`process` 不在支持集）。技能正文还存在宿主绑定措辞（`AskUserQuestion`、`Grep/Glob`、`CLAUDE.md`），跨宿主会失效。目标是在**不动 Claude 侧任何字节**的前提下，让同一份产物被 Codex 原生消费。

## 复杂度评级

- **评级:** M
- **理由:** 无契约变更（不改 CLI 命令域行为、哈希语义、协议或权限面），新增物全部是插件资产与打包脚本的局部扩展；触及面 17 个文件但集中在分发层；改坏可即时发现（`codex plugin add` 与加载技能表立刻可见），属「有行为但局部」
- **期望验证深度:** unit（绿灯测试 + 产物机检）+ runtime（Codex 实机安装、hook 执行观察）

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 分级制（S/M/L）验证强度与评级匹配非协商；M 级要求绿灯测试 + 走查；进度可见性四条款适用于一切 Phase 任务；分支纪律——先建功能分支，main 不接受直接 commit
  - 适用 scope: 本 change 的测试与提交流程编排
- `norms/knowledge-cards.md`
  - 当前结论: 新事实建卡并进 menu 路由；`verified-depth: runtime` 必须附可追溯观察点；标题描述稳定领域事实，禁止用事件命名
  - 适用 scope: 知识写回步骤（新增多宿主分发卡）
- `norms/signals.md`
  - 当前结论: 信号在 review 知识写回步骤双评估；负信号必须深度 runtime 且带退役条件，单次语境 weight ≤ 2
  - 适用 scope: 本仓 `shadow-docs/signals.md` 两条新信号
- `norms/code-style.md`
  - 当前结论: 最小改动、不顺手重构无关内容；单一职责
  - 适用 scope: hooks 采用双文件而非改写既有 `hooks.json`；措辞修正限于已确认的宿主绑定项，不重写正文

## 决策

- **选型:** 双清单 + 双 hooks 文件——新增 `.codex-plugin/plugin.json`（显式 `"skills": "./skills/"`、`"hooks": "./hooks/hooks.codex.json"`，路径带 `./` 前缀以过 Codex path rules），Claude 侧 `.claude-plugin/plugin.json` 与 `hooks/hooks.json` 保持原样；Codex 清单显式声明 hooks 即**替换**默认文件发现，因此 `hooks.json` 与 `hooks.codex.json` 互不干扰
- **对比方案:** ① 改写单一 `hooks.json` 为 `type: command`——Claude Code 现用 `process` + `args` 语义，赌它同时接受 command 会破坏已发布宿主；② 只走 `adapters/codex.json` 的 bind 路线——bind 只复制 `skills/`，技能对 `norms/`、`menu.md` 的跨文件引用脱离产物根目录，等价性不足（该缺口三家宿主共有，属 `shadow-dev-cli` 的 bind 域职责，本 change 不越界修）
- **理由:** 插件路线把整包（`menu.md`/`norms`/`knowledge`/`rules`）带入 `~/.codex/plugins/cache/`，引用完整；实测 Codex 已用同一形态分发 superpowers（`.claude-plugin` 与 `.codex-plugin` 并存），本仓沿用该模板即与宿主期望一致
- **已知取舍:** Windows 自举依赖 bash。`install-cli.sh` 不识别 CLI 的 LINK 直通轨，信任 hook 后本机版本变更会额外 materialize 一份 pin 版（shim 仍优先 LINK，不影响双仓开发）；README 已写明可用 `SHADOW_CLI_HOOK_DISABLE=1` 关闭。跨仓库的 LINK 感知与 bind 的 `junction` 策略留待 CLI 侧后续 change

## 任务

### Phase 1 · 分发契约
- [x] Codex 插件清单——`.codex-plugin/plugin.json` — skills/hooks 显式 `./` 路径 + interface 展示元数据
- [x] Codex hooks 描述符——`hooks/hooks.codex.json` — `type: command` + `${PLUGIN_ROOT}` POSIX 命令 + `commandWindows` Git Bash 优先链
- [x] Codex marketplace 目录——`.agents/plugins/marketplace.json` — `source: {source: local, path: ./}`，name 与 Claude marketplace 对齐
- [x] bind 宿主描述符备档——`adapters/codex.json` — `skillsDir: ~/.codex/skills`，`--host auto` 可探测
- [x] 打包分发集扩展——`scripts/pack.mjs` — DIRS 追加 `.agents`、`.codex-plugin`

### Phase 2 · 机检与去宿主绑定
- [x] 产物与版本机检——`test/pack.test.mjs` — 5 条新产物断言 + 三处 manifest 与 package.json 版本对齐机检
- [x] 措辞去宿主绑定——`skills/shadow-dev-hotfix/SKILL.md`, `skills/shadow-dev-release/SKILL.md`, `rules/behavior.md`, `rules/iron-laws.md` — `AskUserQuestion`/`Grep/Glob`/`CLAUDE.md` 改中立表述
- [x] 版本号同步 6.4.0——`package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` — 由新加的版本机检守护
- [x] 宿主文档——`README.md` — 新增「Codex 宿主」小节（两条路线命令、hook 信任、Windows 自举注意）与依赖补项

### Phase 3 · 知识写回
- [x] 多宿主分发知识卡——`knowledge/multi-host-plugin-distribution.md` + `menu.md` 路由 — 稳定事实：三清单形态、hook schema 差异、引用完整性取决于路线
- [x] 信号写回——`shadow-docs/signals.md` — 高分正向「先跑 codex plugin list/add 拿清单校验日志」+ 负向「pack.test 解包在 Windows 必失败」

## 结果

- 实际耗时: 约 50 分钟（含官方文档核对与 Codex 实机验证）
- 偏差修正: Phase 3 任务 11 文案的「高分正向」为提案期表述，实际入库 SGN-009 为 positive weight 2（单次语境不拔高），SGN-010 为 negative weight 2 + runtime 深度 + 退役条件，符合 `norms/signals.md` 护栏 2；任务文案不回改（勾选记录即执行记录），以本行为准
- 提交走查: 18 文件 +364/-10（`git show --stat 6a68c80`），与 brief `files` 与 `--files` 列表逐项一致；`git diff --name-only main HEAD -- hooks/hooks.json .claude-plugin/marketplace.json skills/shadow-dev-propose` 为空，证实「不动 Claude 侧语义」的决策成立
- 验证（unit + runtime，命令与真实输出见下）:
  - `npm test` → `# tests 7 / # pass 7 / # fail 0`（`install-cli.test.mjs` 全绿）
  - `node --test test/pack.test.mjs` → `# tests 4 / # pass 2 / # fail 2`；新增的「三处 manifest 版本对齐」通过；2 条失败均在**解包步骤**（`bash -c 'tar -xzf "D:\\..."'` 被 MSYS 当 `host:path`，回 `Cannot connect to D: resolve failed`），与本 change 无关的既有环境限制——未改动的「产物存在」用例同样挂在该步，已手工复现同一条失败
  - 打包内容以原生 `tar -tzf dist/shadow-dev-workflow-v6.4.0.tar.gz` 核对（60 条目）→ `hooks/hooks.codex.json`、`adapters/codex.json`、`.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json`、`knowledge/multi-host-plugin-distribution.md`、`menu.md` 逐项命中
  - JSON 结构校验 `node -e JSON.parse` ×7 全 OK（package.json、两份宿主清单、hooks.json、hooks.codex.json、marketplace、adapters/codex）；`node --check test/pack.test.mjs` 通过
  - Knowledge 治理扫描：新卡 9 个必填字段齐、5 个分节齐、source 指向本 brief 且存在、`status: active` 已被 `menu.md` 路由覆盖、无一次性验证输出泄漏
  - `shadow-dev index rebuild` → `shadow-docs/INDEX.md` 收录本 change（状态 branched）
  - 进度收口对账：开工报数 N=15（install-cli 7 + pack 4 + JSON 4 + runtime 3）；实际执行 19 项——JSON 校验按清单实有 7 份展开、治理扫描与 index 重建为新增，runtime 观察点由 3 增至 4（版本升 6.4.0 后重装复核）。数目差异为报数低估，无遗漏项
  - Codex runtime 观察点：① `codex plugin marketplace add D:\works\shadow-dev-workflow` → `Added marketplace shadow-dev-workflow-local`；② `codex plugin add shadow-dev-workflow@shadow-dev-workflow-local` → 安装根 `~\.codex\plugins\cache\shadow-dev-workflow-local\shadow-dev-workflow\6.3.1`，8 技能与 `menu.md`/`norms`/`knowledge`/`rules` 齐备，重启后技能表出现 `shadow-dev-workflow:shadow-dev-*` 命名空间条目；③ 临时把 `commandWindows` 换成写标记文件的探针后 `codex exec --dangerously-bypass-hook-trust` → 日志 `hook: SessionStart` → `SessionStart Completed` 且标记文件落地，随后以源文件还原缓存副本并哈希一致；④ 版本升 6.4.0 后重跑 `plugin add` → 新缓存根 `...\6.4.0`，与源目录逐文件哈希一致（含新增知识卡）
- 未尽事项: ① 本机 CLI 走 LINK 直通轨（`LINK=D:\works\shadow-dev-cli`），`install-cli.sh` 不识别 LINK，信任 hook 后 pin 变更会额外 materialize 一份，建议本机 `SHADOW_CLI_HOOK_DISABLE=1`（跨仓库的 LINK 感知留待 CLI 侧后续 change）；② bind 路线只复制 `skills/` 造成引用断链，属 `shadow-dev-cli` bind 域职责，本 change 只备档 `adapters/codex.json`；③ PR 合并后走 `shadow-dev archive` 归档

## 知识评估

- **预期影响:** 新增
- **候选卡片:** `knowledge/multi-host-plugin-distribution.md`
- **理由:** 「Claude Code 与 Codex 的清单目录、marketplace 形态、hook handler schema 差异，以及 bind 与插件两路线的引用完整性差异」是可跨项目复用的稳定事实，本轮已做到 runtime 深度（三条可追溯观察点），应进知识库而非只留在 brief；另按 `norms/signals.md` 补两条本仓级信号
