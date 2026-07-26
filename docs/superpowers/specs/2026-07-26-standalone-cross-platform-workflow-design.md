# Shadow Dev Workflow 独立跨平台技能包设计

## 1. 目标

将 `shadow-dev-workflow` 改造为开箱即用的跨 Agent 平台技能包：

- 不依赖 Superpowers、`ui-ux-pro-max`、`debugging-workflow`、外部 `code-review` 或 `simplify`；
- 保留 `propose → discuss → apply → review → archive → commit` 六阶段工作流；
- 内置 brainstorming、计划、TDD、验证、调试、git 隔离和 Agent 调度能力；
- 内置 UI/UX 完整知识库，并将 `x.wuh.site` 设计系统作为自动识别的 `wuh-site` preset；
- 保留 OpenSpec CLI，同时提供不依赖额外包的 Node.js 降级实现；
- 兼容 Claude Code、Codex CLI 和 Gemini CLI；
- 三个平台保持核心工作流语义一致，增强能力允许显式降级。

采用渐进式解耦，不建立长期并行的第二套实现。

## 2. 总体架构

```text
shadow-dev-workflow/
├── core/
│   ├── capabilities.md
│   ├── workflow-state-machine.md
│   ├── artifact-contract.md
│   ├── review-protocol.md
│   ├── bug-prevention-protocol.md
│   └── degradation-policy.md
├── skills/
│   ├── shadow-dev-workflow/
│   ├── shadow-dev-propose/
│   ├── shadow-dev-discuss/
│   ├── shadow-dev-apply/
│   ├── shadow-dev-review/
│   ├── shadow-dev-archive/
│   ├── shadow-dev-commit/
│   └── internal/
│       ├── brainstorming/
│       ├── writing-plans/
│       ├── test-driven-development/
│       ├── verification/
│       ├── git-isolation/
│       ├── agent-dispatch/
│       ├── code-review-feedback/
│       └── systematic-debugging/
├── references/
│   ├── review/
│   └── ui-ux/
├── adapters/
│   ├── claude-code.md
│   ├── codex-cli.md
│   └── gemini-cli.md
└── scripts/
    ├── openspec-fallback.mjs
    ├── uiux-search.mjs
    ├── validate-package.mjs
    └── install/
        ├── claude-code.mjs
        ├── codex-cli.mjs
        └── gemini-cli.mjs
```

### 2.1 分层边界

- `core/` 只定义行为、状态和能力协议，不出现平台工具名称；
- 六阶段 Skills 只负责编排，不复制内部基础能力的完整规则；
- 内部 Skills 随包发布，不依赖外部插件；
- `references/` 保存大体量知识，按场景检索，不整体加载；
- `adapters/` 映射各平台工具和降级路径；
- `scripts/` 仅使用 Node.js 标准库；
- 保留现有六阶段入口，逐阶段替换外部依赖。

## 3. 内部能力与依赖规则

### 3.1 阶段依赖

| 阶段 | 内部能力 |
|---|---|
| `propose` | brainstorming、制品生成与校验 |
| `discuss` | writing-plans、内置 UI/UX 检索 |
| `apply` | TDD、git 隔离、Agent 调度 |
| `review` | verification、单 Agent Code Review、Bug 漏检回溯 |
| `archive` | 制品同步、规则沉淀、OpenSpec fallback |
| `commit` | 分支完成、提交、push、PR |

源码中禁止出现以下运行时依赖：

```text
superpowers:*
ui-ux-pro-max
debugging-workflow
外部 code-review
外部 simplify
```

`validate-package.mjs` 扫描禁止引用，并验证内部能力引用均能解析。

### 3.2 平台无关能力协议

```yaml
capabilities:
  read_file:
    required: true
  search_files:
    required: true
  edit_file:
    required: true
  run_command:
    required: true
  ask_user:
    required: true
  spawn_agent:
    required: false
    fallback: inline_execution
  parallel_agents:
    required: false
    fallback: sequential_agents
  browser_verify:
    required: false
    fallback: mark_unverified
  invoke_internal_skill:
    required: false
    fallback: read_internal_module
```

### 3.3 平台适配

- Claude Code 使用 plugin、Skill、Agent、文件工具和结构化提问；
- Codex CLI 使用 `AGENTS.md`、skills 目录和平台原生工具；
- Gemini CLI 使用 `GEMINI.md`、skills 和平台工具；
- 不支持 Skill 调用的平台直接读取内部模块；
- 不支持并行 Agent 时串行执行；
- 不支持浏览器验证时标记视觉验证未执行；
- 所有降级必须出现在最终报告中，不得静默跳过。

三个平台使用独立安装入口，共享同一份 Core、references 和 Node.js 工具，不生成三套业务逻辑。

## 4. 内置 Code Review

### 4.1 审查范围

默认只审查本次修改：

- 已提交 diff：`merge-base(base, HEAD)..HEAD`；
- 未提交 diff：`HEAD..working tree`；
- proposal、specs、design 的需求摘要；
- 改动文件所需的最小上下文；
- 项目 `openspec/specs/code-review/spec.md`；
- 匹配到的通用防复发规则。

禁止扫描整个仓库、启动多维并行 Agent、临时下载 lint 工具或报告没有失败场景的猜测。

### 4.2 单 Agent 审查维度

一个 Agent 同时检查：

1. 需求覆盖；
2. 正确性；
3. 边界条件与错误处理；
4. 安全性；
5. API 与类型契约；
6. 性能；
7. 测试与验证；
8. 变更范围与可维护性。

根据 diff 自动启用 UI/UX、框架、数据层、配置、部署、迁移和兼容性专项规则。

### 4.3 Finding 合同

只报告高置信度真实问题：

```yaml
severity: blocker | high | medium | low
category: correctness | security | performance | contract | test | maintainability
file: path/to/file.ts
line: 42
summary: 一句话说明缺陷
failureScenario: 具体输入或状态如何导致错误结果
evidence: 本次 diff 中的代码证据
suggestion: 最小修复方向
```

每条 finding 必须由本次 diff 引入或暴露，有准确位置、具体触发条件和错误结果；不得报告个人风格偏好或重复根因。主 Agent 只负责核验、去重和分级，不再启动额外 Agent。

### 4.4 Verification 与 Review 分离

Review 前运行项目已经安装和声明的命令：

- lint；
- typecheck；
- 相关测试；
- 按变更类型决定是否 build；
- UI 可观察变更执行浏览器验证，平台不支持时明确标记。

命令不可用时记录为未验证，禁止临时下载安装工具。

最终报告只包含：

- 结论：通过、建议或阻塞；
- 阻塞项；
- 非阻塞建议；
- Bug 防复发候选规则（仅 Bug）；
- 验证结果；
- 降级情况。

没有有效 finding 时直接报告通过，不填充空章节。

## 5. Bug 漏检回溯与防复发

当 `.openspec.yaml` 的 `type` 为 `B` 时进入 Bug Review 模式。

### 5.1 必备输入

- Bug 现象与复现条件；
- 根因分析；
- 修复 diff；
- 回归测试或等价自动验证；
- 历史 Review 规则；
- 受影响调用链和契约。

缺少根因分析或回归验证时，Review 判定为阻塞。

### 5.2 漏检回溯

必须回答：

1. Bug 为什么能进入现有代码；
2. 既有 Review 是否理论上应该发现；
3. 若应发现，缺失或失败的是哪个检查；
4. 若不应发现，是否值得增加可复用规则；
5. 新规则能否通过代码模式、测试或命令稳定检查。

无法从 diff 捕获的环境故障等问题可明确标记为“不适合通过 Code Review 捕获”。

### 5.3 候选规则

```yaml
name: async-fire-and-forget-must-handle-rejection
scope: universal | project
appliesWhen: diff 新增未 await 的 Promise 调用
failureScenario: 异步操作失败后产生未处理 Promise rejection
reviewCheck: 检查调用是否显式处理 reject，或进入统一后台任务机制
regressionVerification: 模拟异步操作 reject，断言进程和请求保持稳定
rationale: 可跨项目复用的异步可靠性规则
```

Review 只生成候选规则，必须经用户接受、修改或忽略。

- 项目级规则在 archive 阶段同步至 `openspec/specs/code-review/spec.md`，并更新 INDEX；
- 通用规则同步至 `references/review/universal-prevention-rules.md`；
- 未确认的规则不得进入长期规范。

## 6. 内置 UI/UX

UI/UX 只服务于 `shadow-dev-discuss`，不提供独立用户入口。

### 6.1 触发范围

当需求涉及页面、组件、布局、配色、字体、交互、动画、响应式、图表、Dashboard、Landing Page、无障碍或可用性时启用。非 UI 需求完全跳过。

### 6.2 知识库

完整保留现有 UI/UX 能力：

```text
references/ui-ux/
├── data/
│   ├── product.json
│   ├── styles.json
│   ├── typography.json
│   ├── colors.json
│   ├── landing.json
│   ├── charts.json
│   └── ux.json
├── stacks/
├── checklists/
└── presets/
    └── wuh-site/
        ├── identity.md
        ├── tokens.md
        ├── typography.md
        ├── components.md
        ├── motion.md
        └── responsive.md
```

### 6.3 Node.js 搜索

```bash
node scripts/uiux-search.mjs "<keyword>" --domain product
node scripts/uiux-search.mjs "<keyword>" --domain style
node scripts/uiux-search.mjs "<keyword>" --stack nextjs
node scripts/uiux-search.mjs --preset wuh-site
```

搜索工具仅用 Node.js 标准库，输出紧凑 JSON，支持关键词、domain、stack、preset 和结果数量，不联网、不整库加载。

### 6.4 `wuh-site` 自动识别

项目目录名、CLAUDE.md 或 package metadata 表明项目属于 `x.wuh.site` 时自动加载 preset。

优先级：

```text
用户显式风格
  > 项目自动识别 preset
  > 产品、行业、风格检索结果
  > 通用设计默认值
```

preset 从当前项目提取：双维度主题、三层 CSS variables、酒红与素雅主题、明暗模式、editorial/纸张风、排版层级、Outline 图标、组件复用、动效、减弱动效和响应式规则。

Discuss 将结果写入 `design.md`，包括信息层级、页面结构、设计系统复用、配色排版、交互状态、响应式、无障碍和浏览器验收标准。

## 7. OpenSpec CLI 与 Node.js 降级

### 7.1 执行策略

```text
OpenSpec CLI 可用且命令成功
  → 使用 CLI 结果
CLI 缺失、崩溃或输出不兼容
  → 调用 scripts/openspec-fallback.mjs
  → 报告降级
```

禁止自动安装或升级 OpenSpec CLI。

### 7.2 降级命令

```bash
node scripts/openspec-fallback.mjs list
node scripts/openspec-fallback.mjs status --change <name>
node scripts/openspec-fallback.mjs instructions --action apply --change <name>
node scripts/openspec-fallback.mjs validate --change <name>
node scripts/openspec-fallback.mjs archive --change <name>
```

职责包括：扫描变更、推导阶段、生成阶段指令、校验制品、归档、同步主 specs、同步已确认 Review 规则和更新 INDEX。Fallback 不执行 git 操作。

### 7.3 状态推导

```text
missing proposal/specs → blocked
proposal/specs 存在，design/tasks 缺失 → discuss
design/tasks 存在，存在未完成 checkbox → apply
tasks 全完成但未记录 review → review
review 通过且未归档 → archive
已归档 → completed
```

### 7.4 机器可读 Review 结果

```text
review-report.yaml
├── findings
├── verification
├── degradations
└── preventionRuleCandidates
```

后续阶段读取报告，不从聊天文本猜测状态。

## 8. 渐进式迁移计划

### Phase 1：依赖清理与 Core 协议

建立 Core 文档、外部依赖清单和扫描脚本，保持现有 Claude Code 插件可用。

### Phase 2：内部基础 Skills 自包含

清理现有内部能力，新增 systematic-debugging，统一命名和引用，删除外部 Skill 运行时依赖。

### Phase 3：重写 Code Review

实现单 Agent、diff-only、高置信度 Review、finding contract、`review-report.yaml`、Bug 漏检回溯和防复发候选规则。

### Phase 4：内置 UI/UX

迁移完整知识库，将 Python 搜索改为 Node.js，提取 `wuh-site` preset，并把路由内嵌 discuss。

### Phase 5：OpenSpec Node.js 降级

实现 list、status、instructions、validate 和 archive，验证 CLI 与 fallback 阶段判断一致。

### Phase 6：跨平台适配与安装

增加 Claude Code、Codex CLI、Gemini CLI adapters 和三个原生安装入口，验证核心能力一致和增强能力降级。

## 9. 测试与验收

### 9.1 静态合同测试

`validate-package.mjs` 检查：

- 禁止的外部 Skill 引用；
- 无法解析的内部引用；
- Core 中的平台专属工具名称；
- 必需目录和文件；
- adapters 能力覆盖；
- Node.js 脚本依赖。

### 9.2 Node.js 工具测试

使用 `node --test` 覆盖：

- UI/UX 搜索和排序；
- `wuh-site` 自动识别；
- OpenSpec 状态推导；
- 制品校验与 archive；
- finding contract；
- 防复发规则分类和确认状态。

### 9.3 场景 Fixtures

```text
tests/fixtures/
├── feature-happy-path/
├── bug-missing-root-cause/
├── bug-with-prevention-rule/
├── uiux-wuh-site/
├── openspec-cli-unavailable/
└── platform-degradation/
```

### 9.4 平台冒烟测试

三个平台分别验证安装、propose、制品生成、apply 门禁、单 Agent Review、archive，以及降级报告。

## 10. 兼容与发布

- 不重命名现有六阶段用户入口；
- 兼容已有 OpenSpec 变更目录；
- 旧 references 先标记 deprecated，确认无引用后删除；
- 每个迁移阶段完成后立即删除已替代的外部引用；
- 不保留长期双实现；
- README 记录平台支持、安装方式和降级能力；
- 以新的主版本号发布。

## 11. 最终成功标准

在全新环境中：

- 不安装任何外部流程 Skill 也能完成六阶段；
- 不安装 Python 也能执行 UI/UX 检索；
- OpenSpec CLI 缺失时仍可继续；
- Review 永远只启动一个审查 Agent，只看本次 diff；
- Review 只报告高置信度真实问题；
- Bug Review 会回溯漏检原因并生成需用户确认的防复发候选规则；
- Claude Code、Codex CLI、Gemini CLI 保持核心语义一致；
- 平台能力不足时显式降级，不静默跳过。
