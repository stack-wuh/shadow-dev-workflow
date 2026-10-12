---
title: 契约探针与观察点的分工
domain: workflow-governance
keywords: [failure-as-fixture, 回归即夹具, 假绿, 契约探针, probe, guard 探针, regression 探针, 门槛层, 分层门槛, 既有套件, npm test, 观察点, 不变量, 完成证据, 归因, 环境噪声, 139, 假绿, 半读, 夹具同构, 断言优先, assert-first, 取证策略]
scope: [norms/verification.md, scripts/, test/, .github/workflows/quality-gate.yml, .github/workflows/publish-release.yml]
status: active
source:
  - changes/20261011-refactor-kill-tdd-verification/brief.md
  - changes/20261012-refactor-evidence-gate-layers/brief.md
  - changes/20261012-fix-smoke-failure-as-fixture/brief.md
verified: 2026-10-12
verified-depth: runtime
verified-scope: 本卡分层结论以真实命令取证——`scripts/check-brief.mjs` 自身断言 `node --test test/brief-gate.test.mjs` 9/9 绿（含拒绝路径与阶段边界）；`npm run check:brief` 在真实仓 fail=0 且点名豁免 2 份历史在途 brief；CI 禁项集合追加一条被废除的 L 级逃逸口措写（该字符串只存在于 workflow 参数里，本卡不逐字复现）后 `npm run check:knowledge -- --forbid <集合>` exit=0；regression 套件 `npm test` 11/11 绿。**先红记录**：门实现前该 9 条断言 exit=1（Cannot find module scripts/check-brief.mjs），实现后转绿——assert-first 顺序在本变更自身上跑通。**中途实测到本卡新增的第 4 则「夹具同构」**：初版夹具按 YAML frontmatter 写而真实 brief 是 `shadow-dev/v1` JSON，9 条断言全绿而门在真实仓把 status 读成默认 draft、files 读成空集（静默半读），修正夹具并加「非 JSON 即判红」断言后才暴露。
---

# 契约探针与观察点的分工

## 当前结论

工作流里有三种东西，**职责不同，不可互相顶替**：

| | 回答 | 形态 | 判定权 |
|---|---|---|---|
| **观察点** | 这条不变量成立吗 | 真实命令 + 真实输出，按 `INV-n` 落表 | 人写、机器查闭合 |
| **guard 探针** | 这条不变量还被机器守着吗 | `scripts/check-*.mjs`，指名 `INV-n` | **机器二值，必须绿** |
| **regression 探针** | 既有断言被打破了吗 | 既有套件（`npm test` / `node --test`） | **机器二值；该仓 CI 实测耗时 ≤ 60s 时必须绿** |

- **绿不是完成证据，但绿可以是合并门槛。** 2026-10-11 的失误是把这两句合成一句，于是取消了唯一不由执行者解释的裁判；2026-10-12 裁定「结合起来用」后拆开：三条放行判据＝观察点闭合 ∧ guard 绿 ∧ regression 绿（按阈值适用），缺一不得 release。
- **探针红必须归因，但归因成噪声不解除门槛。** 跑不了就在 brief 记证据缺口并给补充观察点，禁止静默免除，也禁止「应该没问题」。
- **新增机检优先写成 `scripts/` 下的 guard 命令**并指名 `INV-n`；套件内的长期回归断言只在 brief 批准 `assert-first` 时新增（仅 L 级）。

## 执行约束

- 每条 L/M 级不变量必须有观察点或显式证据缺口；引用探针时须在 brief 写明它覆盖哪个 `INV-n`，否则视为未验证。机器判定：`node scripts/check-brief.mjs`。
- 进入 CI（`quality-gate.yml` / `publish-release.yml`）的探针必须能反查它守护的 `INV-n`；反查不到的不进 CI，也不许拿来代替观察点。
- **regression 阈值的判据是实测耗时，不是仓的类型**：一次 CI run 里 `npm test` 的墙钟时间 ≤ 60s → 该仓必须全绿才放行；> 60s 或本机不可复现 → 记证据缺口＋补充观察点。用「按仓豁免」代替「按成本分层」是这套制度最怕的退化路径——它会重新变成一个需要人裁决的软规则。
- **断言优先（assert-first）四条触发判据**（全部满足才可在 propose 提案）：① 评级 L；② 不变量属可构造输入的可执行断言（纯函数语义 / 命令退出码 / 状态文件 / 产物结构 / 拒绝路径）；③ 取观察点的成本高于写断言；④ 断言能指名 `INV-n` 且落在既有套件内。S/M 级新建套件断言文件由门直接判红（INV-4）。
- 环境噪声的可复现形态（须与真实失败区分）：runner 挂死、node 139 段错误使子进程返回 `null` 状态、沙箱禁网、越权环境下测试运行器静默不产出、子进程继承父 stdin 永久阻塞、`tty` 与 `setsid` 差异、WSL 桩抢占 `bash` 解析。处置顺序：缩小运行范围（分片 / 单文件 / `--test-name-pattern`）→ 关闭 stdin → 降并发 → 禁编译缓存 → 重试至收敛；仍不可得则记证据缺口与补充观察点（CI run 链接＋job 名）。
- **门必须能复现上一次真实失败（failure-as-fixture）**：新增或修改门时，至少一条断言直接采用线上失败的原文当夹具；门判绿当且仅当该原文被判红或已被修复。反例实证：v7.0.1 的发布链因变量被写成反引号形态判红，而本机 @@check:smoke@@ 与 PR 门禁同时判绿——该门只校验「有没有 EXPECTED= 赋值」与「有没有字面量比较」，对反引号误用无感。带绿灯进主干比带红灯更糟。
- **夹具必须与真实产物同构**：夹具格式与生产数据格式不一致时，断言会在门已经静默半读的情况下照常全绿。做法是让夹具走同一条序列化路径（本项目＝`shadow-dev/v1` JSON frontmatter），并给门加一条「输入格式不合预期即判红」的自我防线断言。
- **禁项的作用域是规范文本，不是历史路径**：残留扫描跳过卡片 frontmatter 的 `source` 块，brief 目录也不参与禁项扫描——change 名与历史 brief 可能内嵌被废除的旧措辞，追溯判红会逼执行者改历史溯源换绿灯（本仓 CI run 38129218771 实测命中，6/6 job 判红即此因）。反向纪律同样成立：禁项字符串只活在 CI 参数里。
- 取证成本本身是信号：当「把套件跑全绿」的时间超过取不变量观察点的时间，按上面的判据改用 assert-first 或缩小运行范围，**而不是放宽门槛**。放宽门槛是本卡唯一被明文禁止的应对方式。

## 适用边界

适用于已有自动化套件、且已把验收对象改为不变量的仓库（AI 代理执行场景尤其重要：没有机器门时，代理会拿最省事的绿当完成）。不适用于尚未建立不变量清单的新项目——那里探针仍是主要证据来源，先建规格再谈分层。

## 验证方式

1. `node scripts/check-brief.mjs` 对在途 brief 判绿，且对不合规 brief 给出 `MISSING_DOMAIN_MODEL / BAD_INV_FORMAT / DUPLICATE_INV / UNRECONCILED INV-n / ASSERT_FIRST_NEEDS_L / BAD_FRONTMATTER` 之类可定位到文件的码。
2. 门不追溯 `shadow-docs/changes/archive/`；豁免名单只减不增，且每次运行点名被豁免的 brief。
3. 红灯记录中可见归因结论（回归／噪声），未归因视为未完成。
4. 残留禁项定位到**文件:行号**；CI run 链接作为补充观察点时须可点开且指明 job。

## 关联知识

- [验证策略与复杂度评级](../norms/verification.md)
- [领域模型是工作流的规格载体](domain-driven-shadow-dev.md)
- [Knowledge 约束卡片规范](../norms/knowledge-cards.md)
- [发布链版本权威与产物资产契约](release-artifact-pipeline.md)
