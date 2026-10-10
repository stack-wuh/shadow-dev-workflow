---
{
  "schema": "shadow-dev/v1",
  "name": "20261010-feature-workflow-context-map",
  "type": "feature",
  "scope": "workflow-governance",
  "status": "reviewed",
  "baseBranch": "build/20261010-build-quality-gate",
  "branch": "feature/20261010-feature-workflow-context-map",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "knowledge/domain-driven-shadow-dev.md",
    "knowledge/multi-host-plugin-distribution.md",
    "norms/domain-model.md",
    "norms/knowledge-cards.md",
    "package.json",
    "scripts/check-knowledge.mjs",
    "shadow-docs/changes/20261010-feature-workflow-context-map/brief.md",
    "shadow-docs/domain.md"
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
    "verifiedCommit": "3c23fbff234f2524efd2f65431676ef73780bf58",
    "verifiedAt": "2026-10-10T00:20:26.234Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "680ca61f4cc6747240284922203b59e9fc4f9a5b79cfb221e72a01d7811ab454",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "knowledge/domain-driven-shadow-dev.md",
        "knowledge/multi-host-plugin-distribution.md",
        "norms/domain-model.md",
        "norms/knowledge-cards.md",
        "package.json",
        "scripts/check-knowledge.mjs",
        "shadow-docs/changes/20261010-feature-workflow-context-map/brief.md",
        "shadow-docs/domain.md"
      ],
      "message": "docs(knowledge): 落地本仓上下文地图，卡片 domain 升为一等路由键并进门校验",
      "title": "20261010-feature-workflow-context-map",
      "body": ""
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "本 change 落地规范条款（domain 值域＝上下文地图登记名、source 归档兜底、M 级领域模型最小形态）并把它做成机器校验；未产生新的跨项目长期事实，故不建卡。触碰的两张卡只做字段归一与 source/verified 更新：multi-host（插件分发→distribution）、domain-driven（补执法点记录）。证据：门正例 5/5 命中值域、反例 domain 别名判红退出码 1、requires:strict 绿、11 例测试绿、版本三处同源 6.8.0、产物 v6.8.0 资产契约成立。两次自伤（git checkout 冲掉未提交归一改动、python 字节字面量致脚本未执行）均如实记入 brief 过程记录。"
  }
}
---

# 本仓上下文地图落地 + 卡片 domain 升为一等路由键（并进门校验）

## 动机

上一个 change 把「限界上下文 / 统一语言 / 聚合不变量」写进了流程（`norms/domain-model.md`），但留下两条**本仓自身未满足**的不变量，记在 `20261010-refactor-domain-driven-workflow` brief 的「遗留与后续」里：

1. **本仓没有上下文地图。** `norms/domain-model.md` 的验证方式要求「知识卡 `domain:` 值能在地图中找到」，而 workflow 仓自身没有 `shadow-docs/domain.md`——新立的规范第一条就在自己的仓里空转。
2. **`domain` 字段仍只是标签，不是路由键。** `norms/knowledge-cards.md` 只写 `domain: <主领域>`，没有值域约束，于是实测已经分裂：`knowledge/multi-host-plugin-distribution.md` 写中文 `插件分发`，而同一分发上下文的另两张卡（`distribution-capability-contract.md`、`release-artifact-pipeline.md`）写 `distribution`；`domain-driven-shadow-dev.md` 写 `workflow-governance`。按 `domain + keywords + scope` 收敛时，同一个上下文会因为写法不同被切成两份，查重也失效。

另外，上一 change 实证了一条规范空白：卡片 `source` 按知识库根写 `changes/<name>/brief.md`，而归档流程会把 brief 搬进 `changes/archive/`——**每张卡都在来源 change 归档那天集体判红**（实测 3 张跨项目卡中 2 张如此）。当时只在门里加了兜底解析，规则本身没写进 `norms/knowledge-cards.md`，下一个项目仍会重踩。

**非目标：** 不让门支持项目仓布局（`--root <project>`，路径族为 `shadow-docs/knowledge|menu|domain`）——需要路径变体与 fixture 测试，另立 change；不改分发轨、不动 pack 集合与宿主清单结构语义；不重建目录结构（方案 C 明确未选）。

## 复杂度评级

- **评级:** M
- **理由:** **有行为但局部**——新增一张机器可判的约束（卡片 `domain` 值域＝地图登记集）与一份本仓地图，不改行为契约、不改协议/schema/权限面；**触及面**跨 5 个文件但都在共享规范与门脚本内，不碰宿主核心（`pack.mjs`、adapters、清单结构均未动）；**可发现性**好——`domain` 值不合法会被 `check-knowledge` 直接判红，不是等运行时才炸。按 `norms/verification.md`，M 级＝冒烟 + 既有不变量保持成立 + 既有测试保持绿 + 走查，默认不新建测试文件。
- **期望验证深度:** unit（本机门 + 既有 11 例测试；拒绝路径实跑）

## 领域模型

- **限界上下文:** `workflow-governance` — 开发工作流治理（规范、技能、知识路由）。上游 `execution-layer`（CLI 仓，能力契约反腐边界：不新增命令键、不改 brief schema），下游各项目 `shadow-docs/`（地图与卡片在各仓自持）。
- **统一语言增量:** **上下文地图**（`shadow-docs/domain.md`，登记本仓限界上下文与横切实践及其主目录）；**横切实践**（`debugging` 这类不是业务上下文的实践域，允许进地图但不得当上下文用）；**domain 值域**（卡片 `domain` 的合法取值＝地图登记名集合）。
- **聚合与不变量（M 级列出被触及项）:**
  - `Knowledge 卡片`：`domain` 值必须 ∈ 地图值域（新）；active 卡必须进 menu 路由；三键齐全；source 可解析（含归档兜底）。
  - `规范引用一致性`：地图登记的上下文必须与实际目录/scope 对应；卡片 domain 与地图不得出现同义别名。
- **领域事件:** 新上下文出现 → 先登记地图再建卡；地图值域变化 → 门立即判红存量违规卡。

## 引用规范

- `norms/domain-model.md`
  - 当前结论: 术语唯一定义处；项目上下文地图落 `shadow-docs/domain.md`；验证方式要求卡片 `domain` 值能在地图中找到；越界禁止「不在实现中途新增上下文或改写归属」。
  - 适用 scope: 本仓 `shadow-docs/domain.md` 与 `norms/knowledge-cards.md` 条款
- `norms/knowledge-cards.md`
  - 当前结论: `domain: <主领域>` 无值域约束；`source` 相对知识库根；存量卡片不回溯迁移（缺 `verified-depth` 视为 `code-read`）；active 卡必须进 menu 路由。
  - 适用 scope: 本次要补的两条（domain 值域、source 归档兜底）
- `knowledge/distribution-capability-contract.md` · `knowledge/release-artifact-pipeline.md`
  - 当前结论: 依赖单向、能力名判定、禁止静默降级；机器门禁止半绿。
  - 适用 scope: 新增校验必须以非零退出执法，不得只提示
- `knowledge/bug-investigation.md`
  - 当前结论: 单一持续上下文；横切实践（调试）不是业务限界上下文。
  - 适用 scope: 地图需区分「限界上下文」与「横切实践」两类条目，否则会把 `debugging` 误当上下文
- `rules/behavior.md` §2 / §3
  - 当前结论: 不过度设计、不碰没坏的代码。
  - 适用 scope: 不做 `--root` 项目布局支持（另立 change）；只规范化确有分歧的字段

## 决策

- **选型:** 地图 + 条款 + 门校验三件同时落，缺一件就是又一条「写了但不被执行」的规范。
  1. 新增 `shadow-docs/domain.md`：本仓两个限界上下文（`workflow-governance`、`distribution`）+ 一个横切实践（`debugging`）+ 外部上游 `execution-layer`（CLI 仓，能力契约反腐边界）；每条带职责、上下游、主目录/scope、关键术语；术语表增量指向唯一定义处，不复制定义。
  2. `norms/knowledge-cards.md` 补三条：`domain` 值必须取自项目地图登记名（禁止同义词、中英别名、临时自造）；新上下文先在地图登记再建卡；`source` 写 `changes/<name>/brief.md`，**归档搬迁由门向 `changes/archive/` 兜底解析，不得为了让门变绿而改写卡片路径**。
  3. `knowledge/multi-host-plugin-distribution.md` 的 `domain: 插件分发` 归一为 `distribution`，并更新 `verified`、追加本次 source。
  4. `scripts/check-knowledge.mjs` 新增 domain 成员校验：读地图的上下文名与横切实践名构成值域，卡片 `domain` 不在值域内 → `[fail]` 非零退出；地图文件不存在 → `[warn]`（不阻塞尚未建图的项目）。
  5. `knowledge/domain-driven-shadow-dev.md` 追加 source 与 `verified`（本 change 真实执行了它的验证方式第 4 条）。
- **对比方案:**
  - **只补地图、不动门**：未选。上一 change 已证明「没有机器判定的口头纪律」会被执行者自己漏掉（我漏登记两次勾选、漏声明两个文件），`domain` 值域同样会漂。
  - **把 `插件分发` 保留为别名**：未选。门与路由的键就是字符串本身，允许别名等于把同一个上下文分成两个查询域。
  - **顺带支持项目仓 `--root`**：未选（本轮）。路径族不同（`shadow-docs/knowledge`、`shadow-docs/menu.md`）且需要 fixture 验证，塞进 M 级会让它变 L；已在非目标里记为独立 change。
  - **把地图内容写进 `norms/domain-model.md`**：未选。规范是跨项目模板，地图是**本仓事实**，两者混写会让别的项目继承错误的上下文名。
- **理由:** 领域驱动这套东西的价值取决于「名字能不能当键用」。名字没有值域约束，路由与查重就会退化成关键词搜索——这正是本次分歧的成因。

## 任务

### Phase 1 — 地图与条款
- [x] 本仓上下文地图 — `shadow-docs/domain.md` — 限界上下文表（workflow-governance / distribution）+ 横切实践（debugging）+ 外部上游（execution-layer，CLI 仓）+ 术语表增量指针；每行含职责、上下游、主目录/scope
- [x] M 级领域模型形态明确化 — `norms/domain-model.md` — 规定 M 级「归属上下文 + 被触及不变量」写在「## 领域模型」段（一行归属 + 不变量列表），S 级免填；补「横切实践可入地图但不得当上下文」与「domain 值域＝地图登记名」两条越界禁止
- [x] 卡片规范补条款 — `norms/knowledge-cards.md` — `domain` 值域＝地图登记名（禁同义词/中英别名/自造）；新上下文先登记再建卡；`source` 归档兜底解析规则与「不得为过门改写卡片」禁止项；模板注释由 `<主领域>` 改为 `<限界上下文，须在 shadow-docs/domain.md 登记>`
### Phase 2 — 归一与执法
- [x] 卡片 domain 归一 — `knowledge/multi-host-plugin-distribution.md` — `插件分发` → `distribution`，`verified` 更新并追加本次 source
- [x] 门新增 domain 成员校验 — `scripts/check-knowledge.mjs` — 解析地图值域（上下文 ∪ 横切实践）；卡片 domain 不在值域 → fail 非零退出；地图缺失 → warn 不阻塞；保持既有零依赖与 sub-秒运行
- [x] 规格卡补验证记录 — `knowledge/domain-driven-shadow-dev.md` — 追加 source 与本条验证事实（domain 一致性现已可机器判定）
### Phase 3 — 收口
- [x] 版本与取证 — `package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `shadow-docs/changes/20261010-feature-workflow-context-map/brief.md` — `bump-version.mjs 6.8.0`（三处同源，本次已在文件集内声明）；跑 `npm run ci` 全门 + 11 例测试；拒绝路径：临时把某卡 domain 改回 `插件分发` 与删空地图值域各复现判红后回滚

## 结果

- 实际耗时: ≈18 分钟（含 139 风暴导致的两次链中断重试）
- 验证: **M 级＝冒烟 + 触及的既有不变量保持成立 + 既有测试绿 + 走查**，全部为本机真实输出：

| 项 | 观察点 |
|---|---|
| 新不变量「domain 值必须 ∈ 地图值域」 | 正例 `node scripts/check-knowledge.mjs` → `[.] 上下文地图值域: workflow-governance, distribution, debugging, execution-layer（命中 5/5 卡）` + `摘要: ok=9 warn=4 fail=0`；**拒绝路径**：把 `multi-host-plugin-distribution.md` 的 domain 改回 `插件分发` → `[fail] ... 不在上下文地图值域内`、`摘要: fail=1`、**退出码 1**；恢复 → 退出码 0 |
| 既有不变量「source 可解析（含归档兜底）」 | 门复跑仍 `fail=0`，两张卡以 warn 形式自曝兜底解析（未被悄悄掩盖） |
| 既有不变量「active 卡必须进 menu 路由」 | 5 张卡全过；新地图不建卡，无需路由 |
| 引用一致性 | `npm run check:knowledge` → 51+ 文件扫描零死链、孤儿规范 0 |
| 一致性门未退化 | `npm run check:requires:strict` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`（本 change 未新增命令键） |
| 版本权威前置 | `node scripts/bump-version.mjs 6.8.0` → 三处 manifest 同源 6.8.0；`--check` ✓（**本次三处清单已在 brief 文件集内声明**，正是上一 change 范围修订的教训落地） |
| 既有测试 | `npm test` → `# tests 11 # pass 11 # fail 0` |
| 产物契约 | `node scripts/pack.mjs` → `shadow-dev-workflow-v6.8.0.tar.gz`，`✓资产契约`；包内 `norms/domain-model.md`、`norms/knowledge-cards.md`、`scripts/check-knowledge.mjs`、`knowledge/domain-driven-shadow-dev.md` 命中 4/4；`shadow-docs/` 未入包（地图是仓内事实，符合 pack 集合） |

- 过程记录（诚实，含两次自伤）:
  1. **探针回滚误用 `git checkout --`**：为做 domain 反例，我在同一条命令里改文件后用 `git checkout -- <卡>` 回滚——该文件有**未提交**的归一改动，checkout 把它们一并冲掉。修法：改用 `cp` 备份/还原，并核对 frontmatter 实况后重放改动。教训：拒绝路径探针一律用备份，绝不对未提交文件用 checkout。
  2. **python 字节字面量事故**：写脚本时把 `b = """…"""` 打成 `b"""…"""`，Python 解析为 bytes → `SyntaxError: bytes can only contain ASCII literal characters`，整段脚本（含前序正确改动）**未执行**，因此无半成品落盘；随后逐项核对实际文件状态再继续。
  3. 两次锚点与文件实况不符（`- 不把 brief 的实现过程…` 多了 `brief` 二字；`status 只允许` 行被误加 `- ` 前缀）导致 `assert` 中止——所有编辑脚本都写成「先全部校验锚点、最后一次性落盘」，中止即无部分写入。
  4. 本机 node 139 风暴两次打断 `&&` 链（`task set task-6` 与 `bump-version` 静默未执行），按 SGN-004 重试至收敛后逐项复跑；产物一度仍是 v6.7.0 即为该中断的直接证据，已复跑修正。
- 交付: 待 push / PR（stacked 第三层：base＝`build/20261010-build-quality-gate`）

## 知识评估

- **预期影响:** 无需变更（本 change 是**规范条款落地 + 值域执法**，不产生新的跨项目事实）
- **候选卡片:** 无新增。已触碰的两张卡只做字段与来源更新：`knowledge/multi-host-plugin-distribution.md`（domain 归一，属命名修正非事实变更）、`knowledge/domain-driven-shadow-dev.md`（追加 source 与执法点，结论不变）
- **理由:** 「domain 是路由键、值域来自上下文地图、source 需向归档兜底」是**执行约束**，落点在 `norms/knowledge-cards.md` 与 `norms/domain-model.md`；按 `norms/knowledge-cards.md`「无长期事实才记无需变更」与「能更新不新增」，不另建重复卡。地图本身是仓内事实文件，不是卡片。


## 知识评估

- **预期影响:** 更新
- **候选卡片:** `knowledge/domain-driven-shadow-dev.md`（追加 source 与 verified，结论不变）、`knowledge/multi-host-plugin-distribution.md`（domain 值归一，属字段修正非事实变更）、`norms/knowledge-cards.md`（原位补两条执行约束）
- **理由:** 本次产生的是**规范条款**而非新事实，落点在 `norms/`；已知的跨项目结论（规格载体＝领域模型）没有变化，因此不新建卡，只按「事实变化原位更新、追加 source」处理。`verified-depth` 保持 `unit` 并在 `verified-scope` 记入门的 domain 成员校验这一新执法点；未达 runtime 不虚报。
