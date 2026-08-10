# Shadow Dev Workflow v6

自包含的 Knowledge 驱动开发工作流。

## 架构

```text
skills/
├── shadow-dev-propose/     # 需求对齐、方案设计、知识影响预评估
├── shadow-dev-apply/       # 加载 active Knowledge，执行与验证
├── shadow-dev-review/      # 质量门禁和最终知识评估
├── shadow-dev-release/     # Knowledge 闭环 + 提交 + PR
├── shadow-dev-archive/     # 归档 merged change + 重建 INDEX
└── shadow-dev-knowledge/   # 精确查询 active Knowledge

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

```bash
node scripts/shadow-dev.mjs --help
node scripts/shadow-dev.mjs repo inspect --json
node scripts/shadow-dev.mjs branch plan --name <name> --json
node scripts/shadow-dev.mjs branch execute --name <name> --plan-hash <hash> --confirm --json
```

brief、INDEX、Git 和 GitHub 写操作由 CLI 统一管理。写操作需要 `--confirm`；plan/execute 重新验证 planHash；commit 只接受明确文件列表；archive 仅在 GitHub API 证明 PR merged 后执行。

## 安装

作为 Claude Code 插件：

```bash
claude plugins install stack-wuh/shadow-dev-workflow
```

## 依赖

- Node.js 20+
- Git
- GitHub token（Issue、PR、发布和归档校验）

## License

MIT
