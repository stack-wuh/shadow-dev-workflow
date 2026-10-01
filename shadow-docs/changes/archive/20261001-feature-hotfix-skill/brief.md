---
{
  "schema": "shadow-dev/v1",
  "name": "20261001-feature-hotfix-skill",
  "type": "feature",
  "scope": "shadow-dev-workflow/skills",
  "status": "archived",
  "baseBranch": "main",
  "branch": "feature/20261001-feature-hotfix-skill",
  "files": [
    "CLAUDE.md",
    "README.md",
    "shadow-docs/changes/20261001-feature-hotfix-skill/brief.md",
    "skills/shadow-dev-hotfix/SKILL.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 22,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/22"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "27696fa973f59ecf2260fb57497d63141e6d8c60",
    "verifiedAt": "2026-10-01T02:54:08.696Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:22",
    "planHash": "62b90d88d2ebe693c2b019e779f66500ae017fff16fd9386d553798f6742fa50",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "CLAUDE.md",
        "README.md",
        "shadow-docs/changes/20261001-feature-hotfix-skill/brief.md",
        "skills/shadow-dev-hotfix/SKILL.md"
      ],
      "message": "feat(skills): 新增 shadow-dev-hotfix 紧急修复快车道——准入判定 + mini-brief + 三铁门禁，省掉知识路由/多方案/issue/人工多维审查",
      "title": "feat(skills): 新增 shadow-dev-hotfix 紧急修复快车道",
      "body": ""
    },
    "commit": {
      "files": [
        "shadow-docs/changes/20261001-feature-hotfix-skill/brief.md"
      ],
      "message": "chore(brief): 回填 PR #22 发布状态"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "squash 合并后 HEAD 同源重跑；结论与 feature 分支审查一致"
  }
}
---

# 新增 shadow-dev-hotfix 紧急修复快车道技能

## 动机

线上故障或阻塞级问题需要绕过完整流程的仪式成本直达 PR；现有六技能均按正常迭代节奏设计（知识路由、多方案比较、issue、人工多维审查），无快车道。用户明确要求「能省掉的环节全部省掉，一个字快」。

## 复杂度评级

- **评级:** S
- **理由:** 无契约变更（纯新增 skill 内容与路由行）、触及面 3 文件、可发现性高（frontmatter 触发词）
- **期望验证深度:** code-read

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: TDD 非协商（Bug 修复先复现失败测试）；完成声明必须附验证输出；main 只接受 PR 合入
  - 适用 scope: hotfix 流程的不可省清单（快车道边界即由该铁律圈定）
- `knowledge/bug-investigation.md`
  - 当前结论: 同一 Bug 复现→根因→最小修复→回归由单一上下文完成
  - 适用 scope: hotfix 修复纪律（skill 内嵌引用，scope: cross-project）
- `norms/code-style.md`
  - 当前结论: 单一职责；渐进式治理不扩大范围
  - 适用 scope: skill 文档结构对齐现有六技能风格（参照执行，该规范适用范围为 x.wuh.site monorepo）

## 决策

- **选型:** 方案 A——独立 `shadow-dev-hotfix` skill：准入判定（线上/阻塞 + ≤5 文件 + 一句话根因假设，否则退回 propose）+ 单轮对齐 + mini-brief（复杂度恒 S）+ 复现测试铁律 + 压缩收尾链（task set → review execute → release 复合命令）直达 PR main
- **对比方案:** B propose 加快速模式分支（hotfix 语义淹没在长正文里，触发歧义）；C 无 brief 无 CLI 的裸快修指令（违反执行纪律，归档链断裂）
- **理由:** 快的本质是省仪式不省安全——复现测试、两段式确认、PR 合入三个铁门禁保留，其余（知识路由、多方案、issue、人工多维审查）全部省略；独立 skill 让触发词语义干净
- **执行偏差授权:** 用户单次确认授权全程至 release execute 建 PR（含发布），中途不再逐门禁确认；本变更自身省略 issue（PR 即载体），归档 merged 后手动或后补 issue 触发
- **规范遵循说明:** mini-brief 保持 CLI 可解析的最小结构（任务 checkbox 供机械门禁）；引用规范只内嵌 bug-investigation 一张卡

## 任务

### Phase 1
- [x] 编写 hotfix skill——`skills/shadow-dev-hotfix/SKILL.md` — 按 v6 现行风格（frontmatter 触发词/执行纪律/进场离场），命令签名与 CLI v1.4.0 核准参数面一致
- [x] 路由注册——`CLAUDE.md` `README.md` — Skill 触发表加 hotfix 行；架构树补 skills 条目

## 结果

- 实际耗时: 约 25 分钟（propose 压缩为单轮确认，全程一次授权）
- 验证: code-read 扫描——SKILL.md frontmatter name 与目录一致、触发词在 CLAUDE.md/README 各注册 1 处、命令签名与 CLI v1.4.0 `help branch/review` 结构化输出逐项核对一致、无陈旧维度引用（人工九维与现行 review 对齐）；引用的 bug-investigation 卡真实存在且 active

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** skill 本身即产品文档，承载快车道规则；不产生跨项目执行约束的新事实；menu 路由域无匹配
