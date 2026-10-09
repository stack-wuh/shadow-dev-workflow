---
title: 插件多宿主分发（Claude Code / Codex / zcode）
domain: 插件分发
keywords: [Codex, Claude Code, 插件清单, marketplace, hooks, 宿主适配, 打包分发, 技能加载]
scope: [.codex-plugin/, .claude-plugin/, .agents/, hooks/, adapters/, scripts/pack.mjs, skills/]
status: active
source:
  - changes/20261009-feature-codex-host-support/brief.md
verified: 2026-10-09
verified-depth: runtime
verified-scope: 本机 Codex CLI 0.160.1 实测——`codex plugin marketplace add D:/works/shadow-dev-workflow` 回 `Added marketplace shadow-dev-workflow-local`；`codex plugin add shadow-dev-workflow@shadow-dev-workflow-local` 落地 `~/.codex/plugins/cache/shadow-dev-workflow-local/shadow-dev-workflow/6.4.0`（8 技能 + menu/norms/knowledge/rules 齐备，逐文件哈希与源一致）；重启后技能表出现 `shadow-dev-workflow:shadow-dev-*` 命名空间条目；探针版 `commandWindows` 在 `codex exec --dangerously-bypass-hook-trust` 下输出 `hook: SessionStart` → `SessionStart Completed` 并落标记文件
---

# 插件多宿主分发（Claude Code / Codex / zcode）

## 当前结论

- **技能格式同源**：`SKILL.md` 的 `name` + `description` frontmatter 在 Claude Code 与 Codex 通用，技能本体不需改写即可跨宿主复用。
- **清单目录各异**：Claude Code 用 `.claude-plugin/plugin.json`；Codex 的规范形态是根 `plugin.json`（OpenAI 专有项进 `extensions.com.openai`）或兼容清单 `.codex-plugin/plugin.json`。Codex 虽接受 Claude 兼容清单，但其路径规则要求值以 `./` 开头且不得越出插件根，Claude 的 `"hooks": "hooks"`（目录形态）不合规。
- **hooks schema 差异**：Codex 只执行 `type: "command"` 与 `type: "mcp_tool"`；`timeout` 单位是秒；`prompt`/`agent` 被解析后跳过；Claude 侧的 `type: "process"` + `args` 不在支持集。Codex 原生注入 `PLUGIN_ROOT`/`PLUGIN_DATA`，并兼容注入 `CLAUDE_PLUGIN_ROOT`/`CLAUDE_PLUGIN_DATA`。Windows 用 `commandWindows` 做命令覆盖。
- **声明即替换**：Codex 清单显式声明 `hooks` 路径时**替换** `hooks/hooks.json` 的默认文件发现，不与默认文件叠加。因此同一插件可为不同宿主各备一份 hooks 文件，互不干扰。
- **marketplace 形态差异**：Codex 读 `$REPO_ROOT/.agents/plugins/marketplace.json` 或 `~/.agents/plugins/marketplace.json`，条目为 `source: {source: "local", path: "./x"}`（相对 marketplace 根即仓库根解析）；Claude Code 用 `marketplace.json` + `"source": "./"` 字符串形态。
- **两条分发路线的引用完整性不同**：插件路线把整包（`skills/` + `norms/` + `menu.md` + `knowledge/`）带入宿主插件 cache，技能正文的跨文件引用可解析；`shadow-dev workflow bind` 只复制 `skills/` 到宿主技能目录，引用会脱离产物根目录。
- **钩子需显式信任**：插件自带的 lifecycle hooks 属非托管钩子，装插件不等于信任；未信任时静默跳过（不报错、不阻塞会话）。带 lifecycle hooks 的插件不进公共 plugin directory，本地与 GitHub marketplace 安装不受影响。

## 执行约束

- 新增宿主 = 新增该宿主的清单目录 + 该宿主专属 hooks 文件 + `adapters/<host>.json` 描述符；**禁止改写既有宿主清单的语义**（如把 Claude 的 `type: "process"` 换成 `command`）。
- 新宿主清单目录必须同步进打包分发集（`scripts/pack.mjs` 的 `DIRS`），否则 release tarball 缺描述符，`workflow install` 路线拿不到清单。
- 各宿主 `plugin.json` 的 `version` 必须与 `package.json` 一致，由 `test/pack.test.mjs` 的三清单版本机检守护；版本改动只走 release 流程。
- 技能正文与 norms/rules 禁止出现宿主专有工具名与文件名（`AskUserQuestion`、`Grep`/`Glob`、`CLAUDE.md`），一律用宿主中立表述，否则跨宿主执行时指令落空。
- 依赖 bash 的 Windows 自举必须同时给出 `commandWindows` 覆盖与失败兜底（本仓走 Git Bash 优先链，且脚本恒 `exit 0` 不阻塞会话）。

## 适用边界

适用于「以插件目录形态向多个 agent 宿主分发同一套技能与生命周期钩」的场景。纯 CLI 分发（`shadow-dev workflow bind`）只需 `adapters/<host>.json`，不涉及清单与 hooks；MCP server 打包（`mcp.json` / `.mcp.json`）不在本卡范围。Codex 侧结论基于 CLI 0.160.1 与当期官方文档，宿主版本升级后须按「验证方式」重跑。

## 验证方式

1. `node -e 'JSON.parse(...)'` 逐个校验清单与 hooks 文件可解析。
2. `codex plugin marketplace add <本地目录>` → 应回 `Added marketplace <name>`；`codex plugin list` → 目标 marketplace 下出现 `<plugin>@<marketplace>`，且 stderr 无 `codex_core_plugins::manifest` 的字段级 WARN（WARN 会点名违规字段，如 `interface.defaultPrompt[0]: prompt must be at most 128 characters`）。
3. `codex plugin add <plugin>@<marketplace>` → 检查 `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` 内 `skills/`、`menu.md`、`norms/` 是否齐备（本机可用逐文件哈希与源目录比对）。
4. hooks 实机：临时把 hook 命令替换为写标记文件的探针，`codex exec --dangerously-bypass-hook-trust -s read-only` 观察 `hook: SessionStart` → `SessionStart Completed` 与标记文件，随后用源文件还原缓存副本并哈希比对。
5. `node --test test/pack.test.mjs` 校产物集与版本一致；`tar -tzf dist/shadow-dev-workflow-v<ver>.tar.gz` 校 release 包含新宿主清单（Windows 上用原生 `tar.exe`，Git Bash 的 tar 读不了 `D:\` 形态路径）。
## 关联知识

- 暂无同域卡片。本卡的 `verified-depth` 与命中记录遵循 `norms/knowledge-cards.md` 的验证深度分级；宿主侧一次性观察点存于 `shadow-docs/changes/20261009-feature-codex-host-support/brief.md` 的「结果」段，不随本卡沉淀。