---
{
  "schema": "shadow-dev/v1",
  "name": "20261010-feature-workflow-context-map",
  "type": "feature",
  "scope": "workflow-governance",
  "status": "published",
  "baseBranch": "main",
  "branch": "feature/20261010-feature-workflow-context-map",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".github/workflows/publish-release.yml",
    ".github/workflows/quality-gate.yml",
    "knowledge/domain-driven-shadow-dev.md",
    "knowledge/multi-host-plugin-distribution.md",
    "knowledge/release-artifact-pipeline.md",
    "norms/domain-model.md",
    "norms/knowledge-cards.md",
    "package.json",
    "scripts/check-knowledge.mjs",
    "scripts/check-knowledge.mjs",
    "scripts/check-requires.mjs",
    "shadow-docs/changes/20261010-feature-workflow-context-map/brief.md",
    "shadow-docs/domain.md",
    "shadow-docs/signals.md",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 44,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/44"
  },
  "review": {
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:44",
    "planHash": "d065369be53a922be0d99c1efaead6d67df9b13e942888863e44a380f18924f9",
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
    },
    "commit": {
      "files": [
        "shadow-docs/changes/20261010-feature-workflow-context-map/brief.md",
        "shadow-docs/signals.md",
        "test/pack.test.mjs"
      ],
      "message": "fix(test): pack 解包按 posix 路径交给 bash 并响亮报告失败，退役 SGN-010"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "Phase 4 全部为既有门的跨平台行为纠偏（PATH 时序、win32 .cmd、CRLF 归一），无新的跨项目长期事实；唯一规范级事实已更新进 release-artifact-pipeline 卡"
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
- **跨上下文声明（Phase 4，经用户显式裁决接受）:** 本 change 主体归属 `workflow-governance`，Phase 4 两处越入 `distribution`——① `.github/workflows/quality-gate.yml` 与 `publish-release.yml`：修「同步内依赖 `$GITHUB_PATH`」的步骤时序缺陷，**不触碰**版本权威、资产名契约、发布冒烟任何语义；② `knowledge/release-artifact-pipeline.md`：向该卡「执行约束」**追加**一条 CI 事实，不改当前结论与 domain 值。反腐边界：只增不改；两处均经 `change amend` 登记扩面，未静默改未声明文件。按 `norms/domain-model.md` 本应拆 change，此处由用户于 2026-10-10 裁决保留在同一 PR，理由是堆叠现实：#44 已包含 #43，给 #43 加提交后 #44 无法 fast-forward，拆分会强制原始 git 重堆（违反分支铁律）。

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
### Phase 4 — review 后追加：Windows 门修复（经 `change amend` 登记扩面）
- [x] CI 冒烟 PATH 修复 — `.github/workflows/quality-gate.yml`, `.github/workflows/publish-release.yml` — `$GITHUB_PATH` 只对后续步骤生效，同一步内紧接着的 `shadow-dev --version` 在 windows-latest 找不到 shim（ubuntu/macos 靠镜像默认 PATH 蒙过）；补 `export PATH="$HOME/.local/bin:$PATH"`。两文件不在本 change 原声明集内，按 `shadow-dev-cli` #50 新增的 `change amend` 登记扩面（`added` 两项、`reviewReset=true`），不越界改未声明文件
- [x] 知识闭环 — `knowledge/release-artifact-pipeline.md` — 「$GITHUB_PATH 同步内不可见」升格为发布链卡的执行约束（keywords 补 `GITHUB_PATH/PATH/shim`、source 追加本 brief、verified-scope 记失败侧已由 CI 实证而修复生效待 run 链接回填）；同文件亦经 `change amend` 第二次登记
- [x] strict 门 win32 兼容 + baseBranch 纠偏 — `scripts/check-requires.mjs` — PATH 上的托管 shim 是 `shadow-dev.cmd`，Node ≥18.20.3/20.12.2 拒绝无 shell 启动 `.bat/.cmd`（EINVAL）→ `execFileSync` 增 `shell: process.platform === 'win32' && !cli`，降级仍自曝不半绿。同时 `change amend --base-branch main` 把声明基线纠正为 `main`（`publish` 的 `findPr` 按 base 过滤，声明错则复用不到 PR #44 并重复开 PR），输出含 `warnings` 指名历史 PR #45 需改 base 或关闭。证据：`added:["scripts/check-requires.mjs"] baseBranch:"main" reviewReset:true warnings:[…]`
- [x] 知识治理门 CRLF 容忍 — `scripts/check-knowledge.mjs` — windows runner 按 `core.autocrlf` 检出 CRLF，而 `read()` 不做行尾归一 → `parseFrontmatter` 的 `---\n` 定界失配，8 个技能集体误报「缺 name/description」（CI 实证：第 7 步 `fail=21`，ubuntu/macos 同 run 绿）。改为读入处单点 `replaceAll('\r\n','\n')`。**取证**：把 8 个 `SKILL.md` 就地转 CRLF 后复跑 → `[ok] 技能 8 个：name/description 与目录一致性检查完成`、`fail=1`（仅剩本机 ignore 目录噪声）；还原后 `git diff --stat -- skills` 为空、逐字节 CR 计数 0。
  - **过程自伤（如实记）**：还原脚本里 `Join-Path $bak $f.Directory.Name + [IO.Path]::DirectorySeparatorChar + ...` 因参数优先级被当成 provider 路径解析，8 次 Copy-Item 全失败，而我随后无条件执行了 `Remove-Item -Recurse -Force $bak`，备份已不存在。补救依据是本次污染纯属行尾变换（CRLF→LF 无损可逆）：逐文件 `Replace(CRLF,LF)` 后 `git status --short -- skills` 全空。教训：**探针回滚必须逐项校验成功后才能删备份**；这次侥幸可逆只因改动仅有行尾，若探针改的是内容就已造成真实损失。
- [x] SGN-010 退役与解包失败响亮化 — `test/pack.test.mjs`, `shadow-docs/signals.md` — 按该负信号自写的退役条件把解包路径归一为 posix：首选 `cygpath -u`，缺失时退回纯字符串 `C:\x` → `/c/x`（本机实测：`D:\works\…\v6.8.0.tar.gz → /d/works/…`、`C:\Users\RUNNER~1\… → /c/Users/RUNNER~1/…`）；并把 `spawnSync` 的 rc 由忽略改为当场 `throw`——旧写法让失败漂到下游用例变成 `package.json ENOENT`，把排查方向带偏（本机以此立刻报出 `pack 解包失败 rc=1` 与 WSL 无发行版的真实原因）。信号条目按 `norms/signals.md` 标注【已退役 2026-10-10】、命中升至 2 并记录条件已满足。

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

### Phase 4 取证（2026-10-10，本机真实输出）

| 项 | 观察点 |
|---|---|
| 扩面登记 | `change amend --files <12 项>` → `added:[".github/workflows/publish-release.yml",".github/workflows/quality-gate.yml"]`、`removed:[]`、**`reviewReset:true`**（本 change 原 `passed@3c23fbf` 被作废，`review.conclusion` 回落 `pending`）、`nextStep:"review plan --name …"`。机制来自 `shadow-dev-cli` PR #50，本机经 `SHADOW_DEV_CLI` 指向该 checkout 的 `cli.mjs` 驱动 |
| 根因 | PR #44 windows 两项挂在 step 4「Install pinned shadow-dev CLI」：日志 `shadow-dev 1.5.0 installed to /c/Users/runneradmin/.local/share/...` 后紧跟 `line 4: shadow-dev: command not found`、`exit 127`；同 run 的 ubuntu/macos 通过——因 `$GITHUB_PATH` 追加**对后续步骤**生效，而同一步内紧接着的冒烟取不到该路径，windows runner 的 Git Bash 默认 PATH 不含 `~/.local/bin` |
| 改动正确性 | `export PATH` 行缩进 10 空格（与块标量内其余命令行一致）；两文件经 js-yaml 实测可解析：`job=gate steps=7 exportPATH=true`、`job=publish steps=9 exportPATH=true` |
| 版本权威 | `npm run check:version` → `✓ 三处 manifest 版本同源: 6.8.0（3 个文件）`（本次不涉及 bump） |
| 一致性门 | `npm run check:requires:strict` → 先因本机 `execFileSync('shadow-dev')` 解析不到 `.cmd` shim 而**响亮判红**（`cli-catalog=unresolved strict=on`，未降级半绿，符合「禁止半绿」），置 `SHADOW_DEV_CLI=D:\works\shadow-dev-cli\cli.mjs` 后 → `declared=29 skills-referenced=21 undeclared=[] cli-catalog=47 catalog=resolved missing-in-cli=[] ✓` |
| 知识治理门 | 本机 `check:knowledge` → `摘要: ok=10 warn=4 fail=1`，唯一 `[fail]` 是**未跟踪且被 ignore 的** `.zcode/plans/plan-sess_….md → scripts/shadow-dev.mjs` 死链（`git ls-files .zcode` = 0）；CI 干净 checkout 无此目录，故 ubuntu/macos 该门为绿。→ 记下两条门自身弱点：门应跳过 ignored 路径；`check:requires` 在 Windows 需要可解析的 CLI 入口（`.cmd` 不经 shell 不可 execFile） |

### 本 change 遗留的两处待确认（非本次引入，不静默处置）

1. **正文存在两个互相冲突的 `## 知识评估`**：第一处结论「无需变更」，第二处「更新」；frontmatter `knowledge.action` 取的是「无需变更」。二者对同一批卡片（`domain-driven-shadow-dev.md` / `multi-host-plugin-distribution.md` / `knowledge-cards.md`）给出不同最终动作，属同一 brief 内的自相矛盾，需作者裁定保留哪个并删除另一个（`check-knowledge` 只校验卡片，不校验 brief 正文结构，故门未拦住）。
2. **声明 base 与 PR 实际 base 不符**：正文与 frontmatter `baseBranch` 为 `build/20261010-build-quality-gate`，GitHub 上 PR #44 的 base 是 `main`。合并顺序因此改为「合链尖 #44 一把带走 #42/#43」或「把 PR base 改回堆叠」，二者需择一。

## 知识评估

- **预期影响:** 无需变更（本 change 是**规范条款落地 + 值域执法**，不产生新的跨项目事实）
- **候选卡片:** 无新增。已触碰的两张卡只做字段与来源更新：`knowledge/multi-host-plugin-distribution.md`（domain 归一，属命名修正非事实变更）、`knowledge/domain-driven-shadow-dev.md`（追加 source 与执法点，结论不变）
- **理由:** 「domain 是路由键、值域来自上下文地图、source 需向归档兜底」是**执行约束**，落点在 `norms/knowledge-cards.md` 与 `norms/domain-model.md`；按 `norms/knowledge-cards.md`「无长期事实才记无需变更」与「能更新不新增」，不另建重复卡。地图本身是仓内事实文件，不是卡片。


## 知识评估

- **预期影响:** 更新
- **候选卡片:** `knowledge/domain-driven-shadow-dev.md`（追加 source 与 verified，结论不变）、`knowledge/multi-host-plugin-distribution.md`（domain 值归一，属字段修正非事实变更）、`norms/knowledge-cards.md`（原位补两条执行约束）
- **理由:** 本次产生的是**规范条款**而非新事实，落点在 `norms/`；已知的跨项目结论（规格载体＝领域模型）没有变化，因此不新建卡，只按「事实变化原位更新、追加 source」处理。`verified-depth` 保持 `unit` 并在 `verified-scope` 记入门的 domain 成员校验这一新执法点；未达 runtime 不虚报。
