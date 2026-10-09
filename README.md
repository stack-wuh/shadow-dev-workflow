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
└── tdd-verification.md

knowledge/                  # 跨项目经验与协作知识
menu.md                     # 任务到规范和 Knowledge 的路由
rules/                      # 行为准则与铁律
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

- **propose：** 按 menu 读取和引用 active Knowledge，记录预期知识影响。
- **apply：** 按引用约束执行；冲突时暂停并查明原因。
- **review：** 验证实现、约束和卡片检查方法，给出最终知识动作。
- **release：** 新增、原位更新、废弃卡片或记录无需变更，然后提交发布 PR。
- **archive：** PR merged 后将 brief 移到 archive/ 并重建 INDEX；也可由 GitHub Actions 在 issue close 时自动触发。

## brief

一个变更一个 `brief.md`，记录动机、引用规范、决策、任务、结果和知识评估。Knowledge 记录“现在应怎么做”，brief 记录“这次发生了什么”。

## 历史迁移说明

早期流程曾使用 OpenSpec 多制品结构；该信息仅供历史追溯，不是当前入口或兼容层。当前只执行 shadow-dev v6。

## Deterministic CLI

CLI 独立分发于 [stack-wuh/shadow-dev-cli](https://github.com/stack-wuh/shadow-dev-cli)，是 brief、INDEX、Git 与 GitHub 写操作的确定性执行层，同时也是**分发的唯一驱动方**。本仓只提供内容与规范（skills / norms / knowledge / menu / rules / adapters / docs），不再内置任何安装轨：

- 安装顺序恒为：bootstrap 装 CLI → `shadow-dev workflow plan` + `workflow execute` 物化本产物 → `shadow-dev bind plan --host auto` + `bind execute` 把 skills 绑进宿主发现目录。
- 兼容判定不再用静态版本号：产物 `package.json.requiresCommands` 声明内容层需要的命令键，CLI 在物化/直通**落盘前**拿自身命令目录断言，缺失即 `ARTIFACT_INCOMPATIBLE` 且指针不动。`shadow-dev workflow status` 的 `artifactVersion / cliVersion / missingCommands` 三元组就是健康信号（引导页只读这一个字段即可判断「内容是否比 CLI 新」）。
- 本仓已注销三件历史双轨源头：`cliVersion` pin、SessionStart 自举 hook、vendored `scripts/install-cli.sh`（20261009，v6.4.0）。
- 宿主清单由 `adapters/<host>.json` 决定：**新增宿主 = 新增描述符，CLI 零改动**。现有 `claude-code`、`zcode`、`codex`。
- 开发直通轨：`shadow-dev workflow link --dir <本仓 checkout>` 让产物解析指向工作树（改动即时生效），`unlink` 回落安装版本。

自检与排障：

```bash
npm run check:requires      # skills 引用 ⊆ requiresCommands ⊆ 已装 CLI 命令目录，差集非空即失败
shadow-dev workflow status  # current / previous / linked / artifactVersion / cliVersion / missingCommands
shadow-dev bind status      # 各宿主在场与托管技能清单
```

- `shadow-dev: command not found`：把 `~/.local/bin` 加入 PATH，或重跑 bootstrap。
- `ARTIFACT_INCOMPATIBLE`：内容比 CLI 新。先升级 CLI（bootstrap，或 CLI 仓 `scripts/install-cli.sh install`），再重跑 `workflow plan` + `execute`。
- skills 里出现 `UNKNOWN_COMMAND`：同属 CLI 过旧，apply 阶段按「CLI 前置」响亮阻塞，不得静默降级到别的命令路径。

示例：

```bash
shadow-dev --help
shadow-dev repo inspect
shadow-dev branch plan --name <name>
shadow-dev branch execute --name <name> --confirm
```

brief、INDEX、Git 和 GitHub 写操作由 CLI 统一管理。写操作需要 `--confirm`；plan/execute 重新验证 planHash；commit 只接受明确文件列表；archive 仅在 GitHub API 证明 PR merged 后执行。完整命令参考见 CLI 仓 README 与本仓 [docs/cli-guide.md](docs/cli-guide.md)。

## 安装

唯一入口是 CLI 的 bootstrap（任意目录可用，一条命令装好 CLI + 产物 + 宿主绑定）：

```bash
curl -fsSL https://raw.githubusercontent.com/stack-wuh/shadow-dev-cli/v1.5.0/scripts/bootstrap.sh | bash -s codex
```

末尾参数是宿主名：`claude-code` / `zcode` / `codex`（清单来自产物 `adapters/<host>.json`）。已装过 CLI 的机器直接用两条命令做同样的事：

```bash
shadow-dev workflow plan && shadow-dev workflow execute --plan-hash <plan 输出的哈希> --confirm
shadow-dev bind plan --host auto && shadow-dev bind execute --host <名> --plan-hash <哈希> --confirm
```

产物契约：release 资产 `shadow-dev-workflow-v<ver>.tar.gz` 由 `scripts/pack.mjs` 打包，解包为 `shadow-dev-workflow/`，含 `marketplace.json / package.json / README / menu / skills / adapters / rules / knowledge / norms / docs / scripts`——**不含 hooks 与安装器**。`marketplace.json` 与 `plugin.json` 仅供仍以插件形态消费的宿主可选使用，不再是安装轨。

产物与 adapters 契约：

- release 产物 `shadow-dev-workflow-v<ver>.tar.gz` 由 `scripts/pack.mjs` 打包，解包为 `shadow-dev-workflow/`，只含运行必需集（marketplace.json / package.json / README / menu.md / skills / hooks / rules / knowledge / norms / docs / scripts）。
- `adapters/<host>.json`（schema `shadow-dev-adapter/v1`）声明宿主的 skills 发现目录、复制策略、托管标记与 hook 支持位；**新增宿主 = 新增描述符，CLI 零改动**。

## 依赖

- Node.js 20+
- Git
- bash + curl（安装器拉取 release 产物）
- GitHub token（Issue、PR、发布和归档校验）

## License

MIT
