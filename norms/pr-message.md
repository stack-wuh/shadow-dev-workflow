# PR 与 commit message 结构规范

> 按需加载：写 `release plan` 的 `--title` / `--message` / `--body` 前读本文件。不属于 `rules/`，不做全局注入。
> 结构真源是本文件；**模板文件本体在 `norms/templates/pr-body.md`**，宿主 `.github/PULL_REQUEST_TEMPLATE.md` 由它生成。

## 1. 载荷参数必须显式传（CLI 已在 plan 侧设硬门）

- **防什么**：曾几何时 `release plan` / `publish plan` 不传 `--title` 会把 PR 标题回退成 brief slug（`20261011-fix-webhook-body-limit` 即由此上到 main），不传 `--body` 会把正文自动写成一行 `Closes #N` + `完整 brief：…`（#521 / #528 的薄正文同此）
- **触发**：`release plan` / `publish plan` 组参数时
- **做什么**：`--title` 与 `--body`（或多行正文用 `--body-file`）逐条显式给出。CLI 现于 plan 侧直接拒绝：`PR_PARAMS_REQUIRED`；`--body` 与 `--body-file` 同传即 `BODY_PARAM_CONFLICT`。`--message` 仍须显式给（commit 载荷，不属该门）。取值序「显式入参 > brief 持久化的上一次 plan 参数」——re-plan 免重传仍成立，被禁的是 **CLI 自行编造**，不是承认人上一次给过的值
- **验收**：plan 成功即三者为人给值；缺任一则命令 exit 1 且 `code=PR_PARAMS_REQUIRED`（无载荷产出、无盘写）

## 2. 标题必须是 conventional-commits，词表由人维护

- **防什么**：同仓库并存 `[feature] …`、`chore(ci): …`、裸分支名三种标题，历史无法扫读、无法机器校验
- **触发**：commit subject 与 PR 标题
- **做什么**：`<type>(<scope>): <subject>`
  - `type` ∈ `build | feat | chore | style | docs | ui | fix | refactor | ci | test`，小写，取自宿主 `commitlint.config.js` 的 `type-enum`；表外禁用，不新造
  - `scope` ∈ `next | nest | components | hooks | config | shared-contracts | docs | ci`（2026-10-12 定表，8 项）；表外一律不写，**禁止 AI 自行造词**，也不新增同义层级的词
  - `scope` 只表达**代码落点**（目录/包边界）。`deploy` 已删除——它不是落点而是动作，部署链的落点就是 `.github/workflows/**`，用 `ci` 表达，具体动作（restart-nginx、切流、发版）写进 subject
  - `docs` 作 scope 时只指 `packages/docs` 这个包；「只改文档」属意图，走 `type=docs` 且不写 scope
  - 同一维度不重复表达：`type` 已经说明意图时不再把它塞进 scope（避免 `ci(ci):`、`docs(docs):`）
  - 词表变更由人改本文件后重新生成模板
  - `subject` 单行、≤ 50 字、结尾不加句号，不强制动词开头；整条 ≤ 100 字符（`header-max-length`）
  - 标题内不写 PR 编号：PR 合并时 GitHub 自动把 `(#<PR>)` 追加进 subject，手写会产出 `(#512) (#515)` 双编号
  - 一个 PR 只装一种 `type`（`CONTRIBUTING.md`「禁止混交」）
- **验收**：标题匹配 `^(build|feat|chore|style|docs|ui|fix|refactor|ci|test)(\([^)]+\))?!?: \S` 且不含 `(#<数字>)`

## 3. 正文只用固定四段，任何 type 都不得裁剪

- **防什么**：正文空、只有一行 `Closes`，或自造 `## 背景`、`## todo` 等一次性标题
- **触发**：写 PR 正文时
- **做什么**：段落白名单为 变更 / 影响 / 验证 / 关联 四段。**四段对所有 type 一律必需**（2026-10-12 裁定：保持风格一致，不做按 type 的裁剪），确无内容也保留段落并写 `- 无`

  | type | 必需段落 |
  |------|----------|
  | `fix` `ci` `build` | 变更、影响、验证、关联 |
  | `feat` `refactor` `ui` `style` `test` | 变更、影响、关联 |
  | `docs` `chore` | 变更、关联 |

- **验收**：四段齐全、顺序一致、逐段非空；正文出现的段落标题全在白名单内（自造 `## 背景` 等即判红）

## 4. 每个 PR 必须可追溯到一个 issue

- **防什么**：改动无来源，事后答不出「为什么动这里」
- **触发**：建 PR 前
- **做什么**：`关联` 段必须有 `Closes #<issue>`；没有对应 issue 时**先建 issue 再提 PR**，不许拿 PR 当来源记录
- **验收**：正文含 `Closes #<数字>`，且该 issue 存在

## 5. 禁止署名尾注

- **防什么**：AI 自发追加 `Co-authored-by: 吴红02 <596540@ky-tech.com.cn>`——该约定在仓库规则、shadow-dev CLI、git 全局配置中均不存在，纯属模型习惯
- **触发**：生成 commit message 或 PR 正文时
- **做什么**：不写 `Co-authored-by:` 等任何署名行；不在正文重复 PR 编号或标题
- **验收**：对 `co-authored-by`（忽略大小写）零命中

## 6. 换行不许切断 token

- **防什么**：按 ~40 列硬折，产出 `完整\nbrief：…` 这类把词切碎的正文
- **触发**：写正文时
- **做什么**：单行 ≤ 100 字符；文件路径、issue 编号、反引号代码、`shadow-docs/…` 链接整行不折断——宁可一行长，不可中间断
- **验收**：`brief：`、路径、`#<数字>` 不出现在行首

## 模板与生成

- 模板本体：`norms/templates/pr-body.md`（纯模板，不含规则文字）
- 生成：执行脚本住在 **shadow-dev-cli 仓的 scripts 目录**下的 `gen-pr-template.mjs`（本插件只出规范与模板，不出脚本）。调用形态：`node <shadow-dev-cli 仓的 scripts 目录>/gen-pr-template.mjs --template norms/templates/pr-body.md --out <宿主>/.github/PULL_REQUEST_TEMPLATE.md`
- 校验：同一脚本加 `--check`，只比对不落盘，不一致 exit 1（宿主手改即判红）
- 宿主模板是生成物，手改会被覆盖；要改结构就改规范与模板文件
- 落位约束：模板与规范不得放进 `skills/*/` 的子目录——`bind` 的 `dirHash` 对 skill 目录做 `readdirSync` + `readFileSync`，遇子目录即 `EISDIR` 崩（2026-10-12 实测复现）
