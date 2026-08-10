---
title: Bug 调查保持单一上下文
domain: debugging
keywords: [Bug, 调试, 根因分析, 子代理, 验证]
scope: [cross-project]
status: active
source:
  - user-feedback/bug-investigation-single-context
verified: 2026-08-08
---

# Bug 调查保持单一上下文

## 当前结论

同一个 Bug 的复现、调用链追踪、根因确认、最小修复和回归验证必须由主代理或一个持续保留上下文的单一代理完成。

## 执行约束

- 不把同一 Bug 的关联代码按文件拆给多个隔离子代理阅读。
- 不汇总多个局部代理的“可能原因”代替完整证据链。
- 按“复现 → 追踪首个错误状态 → 确认根因 → 最小修复 → 同上下文回归验证”推进。

## 适用边界

根因明确后，互不依赖的 lint、类型检查和测试套件可以并行；这些机械验证不得重新解释根因。

## 验证方式

审查调查记录是否由同一上下文串联复现证据、调用路径、根因和回归结果。

## 关联知识

- [TDD 与验证](../norms/tdd-verification.md)
