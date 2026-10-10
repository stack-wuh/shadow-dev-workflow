# shadow-dev-workflow 上下文地图

> 本仓限界上下文与统一语言的登记处（判据与格式见 `norms/domain-model.md`）。
> **domain 值域**＝本页「限界上下文 ∪ 横切实践 ∪ 外部上游」登记的名称；知识卡 `domain` 取值必须落在其中，由 `scripts/check-knowledge.mjs` 机器判定。新上下文先登记再建卡。

## 限界上下文

| 上下文 | 职责 | 上游 / 下游 | 主目录与 scope | 关键术语 |
|---|---|---|---|---|
| `workflow-governance` | 开发流程治理：规范、技能、知识路由、brief 生命周期与质量门禁语义 | ← `execution-layer`；→ 各项目 `shadow-docs/` | `skills/`, `norms/`, `rules/`, `knowledge/`, `menu.md`, `scripts/check-knowledge.mjs`, `shadow-docs/changes/` | 限界上下文 / 统一语言 / 聚合 / 领域不变量 / 观察点 / 复杂度评级 / 分级验证 / 信号 |
| `distribution` | 产物打包、多宿主分发、版本与发布链 | ← `execution-layer`；→ claude-code / codex / zcode 三宿主 | `scripts/pack.mjs`, `scripts/bump-version.mjs`, `scripts/check-requires.mjs`, `scripts/install-cli.sh`, `adapters/`, `hooks/`, `.claude-plugin/`, `.codex-plugin/`, `.agents/`, `marketplace.json`, `package.json`, `.github/workflows/` | 能力契约 / requiresCommands / ARTIFACT_INCOMPATIBLE / pin / 资产契约 / 版本权威 / 发布冒烟 / 半绿 |

## 横切实践

跨上下文的**方法**而非业务边界：允许登记为 `domain` 值，但不得当限界上下文扩写，也不参与上下游关系。

| 名称 | 说明 | 关联卡片 |
|---|---|---|
| `debugging` | 缺陷调查方法（根因分析优先、单一持续上下文） | `knowledge/bug-investigation.md` |

## 外部上游（本仓不定义其语义，只经能力契约消费）

| 名称 | 仓库 | 反腐边界 |
|---|---|---|
| `execution-layer` | `stack-wuh/shadow-dev-cli` | 依赖单向：CLI 驱动本仓产物（`bootstrap → workflow plan/execute → bind plan/execute`）。本仓用 `package.json.requiresCommands` 声明所需命令键，缺失即 `ARTIFACT_INCOMPATIBLE` 响亮阻塞；兼容判定用能力名不用版本号；本仓不装 CLI、不 pin 之外的安装轨 |

## 术语表增量

- 概念定义的唯一来源是 `norms/domain-model.md`，本页只登记归属，不复制定义。
- **domain 值域**：本页三张表登记的名称集合（卡片字段合法取值）。
- **归属一致性**：地图登记的上下文与其「主目录与 scope」必须与实际布局对应；改名或搬迁上下文时先改本页。

## 维护规则

- 新增/改名上下文：先改本页 → 再动卡片 `domain` 与 `menu.md` 路由 → 最后跑 `npm run check:knowledge`；两侧不一致以本页为准并判红。
- 单次变更的归属变化必须走 propose 修订 brief，不得在 apply 中途改登记（`rules/iron-laws.md` §7 同族纪律）。
- 本页只放长期事实；过程与一次性验证留在 brief。
