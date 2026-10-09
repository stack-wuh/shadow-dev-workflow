---
title: 领域模型是工作流的规格载体
domain: workflow-governance
keywords: [领域驱动, DDD, 限界上下文, 统一语言, 聚合, 不变量, 观察点, 规格来源, TDD 替代, 验证门禁, 复杂度评级]
scope: [norms/domain-model.md, norms/verification.md, skills/shadow-dev-propose, skills/shadow-dev-apply, skills/shadow-dev-review]
status: active
source:
  - changes/20261010-refactor-domain-driven-workflow/brief.md
verified: 2026-10-10
verified-depth: unit
verified-scope: 本变更以自身结构自证——L 级 brief 含「## 领域模型」段且不变量清单非空，`change create`/`change approve`/`task list`（12 项）与 `worktree inspect` 的 `评级: L` 正则提取全部真实跑通；既有 `node --test test/pack.test.mjs` 4/4 绿。runtime 观察点（一致性门、产物扫描、拒绝路径）待 release 证据补齐后再升深度。
---

# 领域模型是工作流的规格载体

## 当前结论

分级验证制取消「先写失败测试」的默认仪式之后，本工作流的**规格来源是领域模型与领域不变量**，不是测试。测试降级为证据手段之一：既有测试必须保持绿，新测试只在需要长期钉住某条不变量时才写。撤掉 TDD 不等于撤掉规格——缺了规格载体，验证会退化成 diff 走查。

## 执行约束

- L 级变更的 brief 必含「## 领域模型」段：限界上下文、统一语言增量、非空不变量清单、领域事件；格式与必填规则见 `norms/domain-model.md`。
- 验收对象是不变量：每条不变量绑定一个可追溯观察点，观察点强度按 `norms/verification.md` 的级别要求；「验证强度与评级匹配不可议」这条不因去掉 TDD 而松动。
- 一个 change 一个主限界上下文；跨上下文连带改动另立 change 并在 brief 写明前后依赖。
- 新公开名词（命令键、字段、卡片标题、术语）必须登记在 brief 术语增量或项目 `shadow-docs/domain.md`，否则 review 按模型漂移阻塞。
- 不为建模做全仓普查；不把 DDD 战术模式（Entity / VO / Repository / CQRS）当硬要求。

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
