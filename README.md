# Shadow Dev Workflow v6

自包含的 Knowledge 驱动开发工作流。

## 架构

```text
skills/
├── shadow-dev-propose/     # 需求对齐、方案设计、知识影响预评估
├── shadow-dev-design/      # UI 设计大师：高保真视觉提案与布局交互打磨
├── shadow-dev-apply/       # 加载 active Knowledge，执行与验证
├── shadow-dev-review/      # 质量门禁和最终知识评估
├── shadow-dev-release/     # Knowledge 闭环 + 提交 + PR
├── shadow-dev-archive/     # 归档 merged change + 重建 INDEX
├── shadow-dev-knowledge/   # 精确查询 active Knowledge
└── shadow-dev-hotfix/      # 紧急修复快车道：最小修复直达 PR

norms/                      # 跨项目硬规则与工程规范
├── knowledge-cards.md
├── ui-patterns.md
├── api-design.md
├── interaction.md
├── code-style.md
├── domain-model.md
└── verification.md

knowledge/                  # 跨项目经验与协作知识
menu.md                     # 任务到规范和 Knowledge 的路由
rules/                      # 行为准则与铁律
hooks/                      # SessionStart 自举：确保锁版本 shadow-dev-cli 就位
scripts/install-cli.sh      # vendored CLI 仓库安装器（hook 与手工共用）
```

项目使用：

```text
shadow-docs/
├── INDEX.md
├── menu.md
├── knowledge/              # 项目当前执行真相
└── changes/
    ├── <name>/brief.md
    └── archive/<name>/brief.md
```

## 知识职责

| 位置 | 职责 |
|------|------|
| `norms/` | 跨项目硬规则与工程规范 |
| `knowledge/` | 跨项目经验和协作知识 |
| 项目 `shadow-docs/knowledge/` | 项目独有的 active 执行真相 |
| `menu.md` | 精确路由，不全文读取所有卡片 |
| change brief / INDEX | 变更过程与历史追溯，不覆盖 active Knowledge |

项目外 memory 不作为执行依据。代码与 Knowledge 冲突时，先用可重复验证确认代码是有意变更、回归还是卡片过期。

## 工作流

```text
propose → apply → review → release → archive
```

- **propose：** 按 menu 读取和引用 active Knowledge，做领域对齐（限界上下文 / 不变量），记录预期知识影响。
- **apply：** 按引用约束执行，以 brief 的不变量为验收对象逐条留观察点；冲突时暂停并查明原因。
- **review：** 验证实现、约束、模型一致性和卡片检查方法，给出最终知识动作。
- **release：** 新增、原位更新、废弃卡片或记录无需变更，然后提交发布 PR。
- **archive：** PR merged 后将 brief 移到 archive/ 并重建 INDEX；也可由 GitHub Actions 在 issue close 时自动触发。

## brief

一个变更一个 `brief.md`，记录动机、引用规范、决策、任务、结果和知识评估。Knowledge 记录“现在应怎么做”，brief 记录“这次发生了什么”。

## 历史迁移说明

早期流程曾使用 OpenSpec 多制品结构；该信息仅供历史追溯，不是当前入口或兼容层。当前只执行 shadow-dev v6。

## Deterministic CLI

CLI 独立分发于 [stack-wuh/shadow-dev-cli](https://github.com/stack-wuh/shadow-dev-cli)（纯脚手架实现：brief、INDEX、Git 与 GitHub 写操作的确定性执行层）。插件不再内置或 vendored CLI，而是通过 **SessionStart hook 自动安装锁版本 CLI**：

- `package.json` 的 `cliVersion` 字段锁定 CLI 版本（当前 `v1.5.0`），与插件版本配对发布，兼容配对由 manifest 机检；此外产物用 `requiresCommands` 自声明所需命令键，CLI 在物化/直通落盘前断言（缺失即 `ARTIFACT_INCOMPATIBLE`，指针不动）。
- 首次会话自动安装到 `~/.local/share/shadow-dev-cli/shadow-dev-cli-<ver>/`（版本化目录 + `CURRENT`/`PREVIOUS` 指针），并在 `~/.local/bin/shadow-dev` 生成托管 shim；此后每次会话幂等秒退（不触网）。
- hook 永不阻塞会话：安装失败仅 stderr 警告；CLI 未就位时 skills 中 `shadow-dev` 命令不可用。
- `SHADOW_CLI_HOOK_DISABLE=1` 跳过自举（双仓开发时保护手动 `--channel main` / `--from` 安装）。

手动管理（vendored 安装器随插件分发）：

```bash
bash scripts/install-cli.sh install                       # 装锁版本（同 hook 行为）
bash scripts/install-cli.sh install --version v1.5.0      # 显式锁版本
bash scripts/install-cli.sh rollback                      # 切回上一版（离线）
bash scripts/install-cli.sh status                        # 查看当前/上一版本指针
```

排障：

- `shadow-dev: command not found`：确认 `~/.local/bin` 在 PATH（`export PATH="$HOME/.local/bin:$PATH"`）。
- 升级 CLI 与更新 pin：CLI 仓库发新版 → 验证 → 本仓库改 `cliVersion` 并同步 `scripts/install-cli.sh`，随插件发版；**改完必须跑 `npm run check:requires`**——它判 `skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录`，pin 与能力声明不再靠人记忆同步。

示例：

```bash
shadow-dev --help
shadow-dev repo inspect --json
shadow-dev branch plan --name <name> --json
shadow-dev branch execute --name <name> --confirm --json
```

brief、INDEX、Git 和 GitHub 写操作由 CLI 统一管理。写操作需要 `--confirm`；plan/execute 重新验证 planHash；commit 只接受明确文件列表；archive 仅在 GitHub API 证明 PR merged 后执行。完整命令参考与典型工作流见 [docs/cli-guide.md](docs/cli-guide.md)。

## 安装

原生宿主是 **Claude Code**（本插件为其开发），Codex 以 `.codex-plugin/` 清单 + `hooks/hooks.codex.json` 原生消费，zcode 等兼容宿主可直接消费同一产物。安装入口正从「插件引导 CLI」反转为「CLI 驱动分发」：

当前形态（v6.5.0）：作为 Claude Code 插件安装，SessionStart hook 自动就位锁版本 CLI，无需手动初始化。

### Codex 宿主

同一份产物，两条路线：

**插件路线（推荐，跨文件引用完整）** —— `.codex-plugin/plugin.json` 声明 `skills` 与 `hooks/hooks.codex.json`，`.agents/plugins/marketplace.json` 是 Codex 侧的 marketplace 目录：

```bash
codex plugin marketplace add stack-wuh/shadow-dev-workflow      # 本机开发：codex plugin marketplace add D:/works/shadow-dev-workflow
codex plugin add shadow-dev-workflow@shadow-dev-workflow-local   # 装完重启桌面应用
```

- 整包（`norms/`、`menu.md`、`knowledge/`）随插件进 `~/.codex/plugins/cache/`，技能里的跨文件引用保持有效；
- 插件钩子属**非托管钩子**，装完需在 CLI 里 `/hooks` 审查并信任才会执行，未信任时静默跳过（不报错、不阻塞会话）；
- 带 lifecycle hooks 的插件不进公共 plugin directory，本地/GitHub marketplace 安装不受影响。

**bind 路线** —— `shadow-dev workflow link`/`install` 就位产物后 `shadow-dev bind plan --host codex` + `bind execute`，描述符为 `adapters/codex.json`（`skillsDir: ~/.codex/skills`）。注意 bind 只复制 `skills/`，技能正文对 `norms/` 与 `menu.md` 的引用会脱离产物根目录，需要插件路线才等价。

Windows 自举：Codex 走 `hooks.codex.json` 里的 `commandWindows` 覆盖，优先 `%ProgramFiles%\Git\bin\bash.exe`，找不到再退回 PATH 上的 `bash`。若 PATH 上只有 WSL 的 `System32\bash.exe`，自举会把 CLI 装进 WSL 文件系统、Windows 侧看不到 shim——此时手动 `bash scripts/install-cli.sh install`，或设 `SHADOW_CLI_HOOK_DISABLE=1` 关掉自举。

CLI 轨（shadow-dev-cli 的 workflow/bind 域，v1.4.0 起可用，已实测）：

```bash
shadow-dev workflow plan && shadow-dev workflow execute --plan-hash <哈希> --confirm   # 物化本仓 release tarball 到 ~/.local/share/shadow-dev-workflow/
shadow-dev bind plan --host auto && shadow-dev bind execute --host <名> --plan-hash <哈希> --confirm   # 按 adapters/<host>.json 把 skills 绑入宿主发现目录
```

产物与 adapters 契约：

- release 产物 `shadow-dev-workflow-v<ver>.tar.gz` 由 `scripts/pack.mjs` 打包，解包为 `shadow-dev-workflow/`，只含运行必需集（marketplace.json / package.json / README / menu.md / skills / hooks / rules / knowledge / norms / docs / scripts）。
- `adapters/<host>.json`（schema `shadow-dev-adapter/v1`）声明宿主的 skills 发现目录、复制策略、托管标记与 hook 支持位；**新增宿主 = 新增描述符，CLI 零改动**。

## 依赖

- Node.js 20+
- Git
- bash + curl（安装器拉取 release 产物）
- GitHub token（Issue、PR、发布和归档校验）
- Codex CLI（可选，插件路线需 `codex plugin marketplace add`；实测 0.160.1）

## License

MIT
