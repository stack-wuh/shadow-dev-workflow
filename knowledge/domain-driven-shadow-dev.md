---
title: 领域模型是工作流的规格载体
domain: workflow-governance
keywords: [规格驱动开发, SDD, 领域驱动, DDD, 限界上下文, 统一语言, 聚合, 不变量, INV 行键, 对账表, 观察点, 规格来源, 验证门禁, 复杂度评级, 取证策略, 断言优先, assert-first, brief 契约门]
scope: [norms/domain-model.md, norms/verification.md, skills/shadow-dev-propose, skills/shadow-dev-apply, skills/shadow-dev-review]
status: active
source:
  - changes/20261010-refactor-domain-driven-workflow/brief.md
  - changes/20261010-feature-workflow-context-map/brief.md
  - changes/20261011-refactor-kill-tdd-verification/brief.md
  - changes/20261012-refactor-evidence-gate-layers/brief.md
verified: 2026-10-12
verified-depth: runtime
verified-scope: 2026-10-12 制度名更正为 **SDD（规格驱动开发）**——DDD 只供四件建模工具，规格才是单一事实源；同日起不变量必须带 @@INV-n@@ 行键，「结果」段按行落对账表，由新增的 @@scripts/check-brief.mjs@@ 机器判定（本卡「验证方式」第 1、2 条从散文要求变为可执行断言）。拒绝路径实测：L 级缺领域模型段、清单缺编号、编号重复、published 状态下对账缺行、S 级新建套件断言文件、frontmatter 非 JSON 六种输入各判红一次；正例判绿两次（临时夹具 + 本仓真实 brief）。原记录： 2026-10-11 用户裁定「完全干掉 TDD」后，测试文件降格为契约探针、旧门槛措辞纳入 CI 禁项（见 `contract-probe.md`）；原记录：本仓已落地 `shadow-docs/domain.md` 上下文地图，卡片 `domain` 值域改由 `scripts/check-knowledge.mjs` 机器判定（本卡验证方式第 4 条由口头要求变为可执行断言，拒绝路径已实跑判红）；原自证记录：本变更以自身结构自证——L 级 brief 含「## 领域模型」段且不变量清单非空，`change create`/`change approve`/`task list`（12 项）与 `worktree inspect` 的 `评级: L` 正则提取全部真实跑通；既有 `node --test test/pack.test.mjs` 4/4 绿。runtime 观察点（一致性门、产物扫描、拒绝路径）待 release 证据补齐后再升深度。
---

# 领域模型是工作流的规格载体

## 当前结论

本工作流是 **SDD（规格驱动开发）**：规格是单一事实源，计划→任务→实现→按规格对账验收。DDD 只供四件**书写规格**的建模工具（限界上下文 / 统一语言 / 聚合 / 不变量），不是制度本身；测试是取证手段之一，也不是制度本身。分工：`norms/domain-model.md` 定义验什么，`norms/verification.md` 定义验到什么强度与用什么取证策略，`scripts/check-brief.mjs` 把规格层从散文变成机器门。

取消默认先红仪式之后，机检以**契约探针**形态存在（`knowledge/contract-probe.md`）：分层门槛——guard 探针必须绿、regression 探针在该仓 CI 实测耗时 ≤ 60s 时必须绿；但绿永远只是门槛，不是完成证据。长期机检优先写成 `scripts/` 下指名 `INV-n` 的可重复命令；套件内新增回归断言只在 L 级且 brief 批准 `取证策略: assert-first` 时进行。**撤掉旧仪式不等于撤掉规格，也不等于撤掉机器门槛**——缺规格，验收退化成 diff 走查；缺门槛，验收退化成执行者自证。

## 执行约束

- L 级变更的 brief 必含「## 领域模型」段：限界上下文、统一语言增量、非空不变量清单（**每条带 `INV-n` 行键**）、领域事件，并在「复杂度评级」节声明 `取证策略: assert-first｜observation`；格式与必填规则见 `norms/domain-model.md`。缺失或编号不合规由 `scripts/check-brief.mjs` 判红，release 阻塞。
- 验收对象是不变量：每条不变量绑定一个可追溯观察点，强度按 `norms/verification.md` 的级别要求；「验证强度与评级匹配不可议」这条不因去掉 TDD 而松动，且**不得以探针绿代替观察点**。
- 一个 change 一个主限界上下文；跨上下文连带改动另立 change 并在 brief 写明前后依赖。
- 新公开名词（命令键、字段、卡片标题、术语）必须登记在 brief 术语增量或项目 `shadow-docs/domain.md`，否则 review 按模型漂移阻塞。
- 不为建模做全仓普查；不把 DDD 战术模式（Entity / VO / Repository / CQRS）当硬要求。
- 不把规格层与门槛层混为一谈：观察点闭合是证据，探针绿是门槛，任何一层都不许顶替另一层。

## 适用边界

适用于由 AI 代理执行、且有可路由知识库的项目——规格需要写成能被复述和检查的断言。不适用于探索性原型与一次性脚本：那里不变量尚未稳定，强行建模等于把猜测写成规范。

## 验证方式

1. L 级 brief 存在「## 领域模型」段且不变量清单非空。
2. brief「结果」段中每条不变量有对应观察点，或明确标注「未验证」与证据缺口。
3. 死链扫描不得发现指向旧验证规范文件名的引用；进度 token 不得残留 TDD 时代的 red\|green 形态（现行 verify 的 pass\|fail）。
4. 知识卡 `domain:` 值与项目上下文地图登记的上下文一致。

## 关联知识

- [领域模型规范](../norms/domain-model.md)
- [验证策略与复杂度评级](../norms/verification.md)
- [Knowledge 约束卡片规范](../norms/knowledge-cards.md)
- [Bug 调查保持单一上下文](bug-investigation.md)
