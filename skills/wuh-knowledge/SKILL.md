---
name: wuh-knowledge
description: 知识库查询 — 根据需求关键词匹配菜单路由，拉取规范和项目知识。被 propose 自动调用，不直接面向用户。
---
# 📚 Wuh Knowledge — 知识库查询

只被 `wuh-propose` 在需求对齐阶段调用，提供规范约束注入。

## 查询流程

### 1. 提取技术域关键词

从用户需求中提取技术域关键词：功能类型（UI/API/数据库/性能/交互）、涉及模块、变更范围。

### 2. 查菜单路由表

读 `menu.md`，用关键词匹配技术域 → 得到应查阅的规范文件清单：

| 关键词匹配 | 规范文件 |
|-----------|---------|
| 匹配到 UI 域 | `norms/ui-patterns.md` + `norms/interaction.md` |
| 匹配到 API 域 | `norms/api-design.md` |
| Bug | `norms/tdd-verification.md` |
| 所有变更 | `norms/code-style.md` |

同时扫描 `shadow-docs/knowledge/` 下所有 `.md` 文件，用需求关键词与文件标题/关键词字段做匹配。文件开头有 YAML frontmatter：

```yaml
---
keywords: [封面图, cover, metadata]
---
```

至少一个关键词匹配即视为相关。

### 3. 读取并提取约束

读所有匹配到的规范文件，从每条规范中提取：

- **约束**: 一句话说明限制了什么
- **适用范围**: 本次需求是否适用

### 4. 输出格式

```
## 知识库匹配结果

### 技术域
UI 变更, API 变更

### 通用规范约束
- ui-patterns.md: 暗黑模式下文字对比度不低于 4.5:1
- ui-patterns.md: 禁止硬编码颜色值
- interaction.md: 触摸目标不小于 44x44px
- api-design.md: 分页返回统一 { data, total, page, pageSize } 格式
- code-style.md: 文件不超过 300 行

### 项目知识约束
- cover-image.md: 封面图从 metadata.cover 取，fallback 到正文首图
- theme-tokens.md: 颜色使用 CSS 变量三层架构

### 未匹配的规范（不适用）
- api-design.md 版本策略 → 本次无 API 版本变更
```

## 约束处理

- 每条「适用」的约束必须体现在方案设计中
- 如果决定不遵循某条约束，必须在 brief.md 的「决策」部分说明理由
- 任何新组件/新样式必须检查项目组件库是否有现成的可复用
