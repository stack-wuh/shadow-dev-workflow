---
{
  "schema": "shadow-dev/v1",
  "name": "20260925-feature-validation-strategy-signals",
  "type": "feature",
  "scope": "workflow",
  "status": "archived",
  "baseBranch": "main",
  "branch": "feature/20260925-feature-validation-strategy-signals",
  "files": [
    "menu.md",
    "norms/knowledge-cards.md",
    "norms/signals.md",
    "norms/tdd-verification.md",
    "scripts/electron-walkthrough.mjs",
    "scripts/env-check.sh",
    "shadow-docs/signals.md",
    "skills/shadow-dev-apply/SKILL.md",
    "skills/shadow-dev-propose/SKILL.md",
    "skills/shadow-dev-review/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 17,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/17",
    "pullRequest": 18,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/18"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "12608e44baf61e6706b1c2371d426d95237d6cab",
    "verifiedAt": "2026-09-25T03:01:55.000Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:18",
    "planHash": "260153ccdbcb058af424213dfbd89b885c2eac003756b65af8f8d25074009a2b",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] 验证策略分级 + 信号机制 + 环境预检资产化",
      "body": "",
      "labels": [
        "feature"
      ]
    }
  },
  "knowledge": null
}
---

# 验证策略分级 + 信号机制 + 环境预检资产化

## 动机

实证复盘（20260924-feature-git-history-capsule 全链路 + 插件帧三层损坏诊断）暴露四个工作流缺陷：① 知识卡 `verified` 只有日期无深度，出现过「实机验证」实为静态 HTML 可见的语义漂移，误导后续 propose 前提；② TDD 铁律二元制（要么全红绿仪式、要么零测试），简单需求被迫支付过度测试成本，而测试仪式感与验证诚实度被混为一谈；③ AI 诊断的探索扇形无先验引导，同一类坑（sandbox token 误归因、OOPIF 盲区）重复消耗会话时间；④ 环境坑（代理劫持/V8 段错误/symlink/无 lockfile 漂移）每次现场撞墙，CDP 走查脚本即弃不可复用。

## 引用规范

- norms/knowledge-cards.md
  - 当前结论: 卡片格式 frontmatter 单 `verified: YYYY-MM-DD` 字段；写入门禁（单知识单元、稳定命名、不复制实现过程）
  - 适用 scope: norms/knowledge-cards.md
- norms/tdd-verification.md
  - 当前结论: 「TDD 与验证铁律——非协商」二元制：新功能/Bug/复杂重构一律红→绿，纯文档零测试
  - 适用 scope: norms/tdd-verification.md（本次有意识修订该铁律，经用户 2026-09-25 讨论批准）
- skills/shadow-dev-review/SKILL.md
  - 当前结论: 知识影响评估（新增/更新/废弃/无需变更）为 review 固定步骤
  - 适用 scope: skills/shadow-dev-review/SKILL.md

## 决策

- **选型:** 三件套——① 知识卡 verified 拆三字段（verified 日期 + verified-depth: code-read|unit|runtime|field + verified-scope 可追溯观察点），写入门禁加「runtime 深度必须附可追溯证据，模糊表述（如『帧渲染出内容』）不合格」；② tdd-verification.md 改造为「验证策略与复杂度评级」：S/M/L 三级（评级三要素=契约变更/触及面/可发现性，评级跟风险走不跟工作量走）× 验证深度矩阵，L 级保留红→绿仪式，M 级绿灯测试即可，S 级 diff 走查；propose 出评级、人批准、review 查匹配；③ 新增 norms/signals.md 信号机制（positive/negative 方向、weight 1–5、深度标注、命中累积、90 天衰减、退役条件必须），apply 读信号设定探索优先级（评级决定扇宽：S 直走/M 排序/L 先张满扇形只剪已证死路），review 双写回（知识 + 信号）AI 提案无人工门；④ scripts/env-check.sh（代理/V8 段错误率/GH_TOKEN/worktree 依赖/lockfile 缺失预警）+ scripts/electron-walkthrough.mjs（CDP eval/shot/nav/frame 原语 + 渲染就绪等待）。
- **对比方案:** 结构化 verified（YAML 子对象）——解析成本高且 AI 全文扫描不解析 frontmatter，否；信号全局单库——机器级信号确属跨项目，但先只做项目级等重复模式显现，否（延期项）；大卡拆分（shell-chrome-design 冲突热点）——成本高收益未证，延期观察；worktree CLI 化——归入 shadow-dev-cli 仓独立 change，不在本 change。
- **理由:** 全部为 norms/skills/scripts 层约定变更，零运行时契约改动；信号与评级矩阵共用「验证深度」单一语义轴，避免两套标准。

## 任务

### Phase 1 规范层
- [x] knowledge-cards.md：verified 三字段改造 + 深度四级定义 + runtime 证据门禁 — `norms/knowledge-cards.md` — 修改
- [x] tdd-verification.md：改造为「验证策略与复杂度评级」（S/M/L × depth 矩阵 + 评级三要素 + propose 出评级人批准 + review 查匹配） — `norms/tdd-verification.md` — 修改
- [x] signals.md（新建）：格式 / 生命周期（创建·加分·衰减·退役）/ 三护栏（排序不删验证义务、负信号须 runtime 证据、必须可证伪） — `norms/signals.md` — 新增

### Phase 2 skills 接线
- [x] propose：brief 模板加「复杂度评级」节 + 知识写回要求补 verified-depth — `skills/shadow-dev-propose/SKILL.md` — 修改
- [x] apply：加「读 shadow-docs/signals.md 设定探索优先级」步骤（含评级决定扇宽规则） — `skills/shadow-dev-apply/SKILL.md` — 修改
- [x] review：知识评估扩展为「知识 + 信号」双写回 + 「验证强度与评级匹配」检查 — `skills/shadow-dev-review/SKILL.md` — 修改
- [x] menu.md：signals/tdd-verification 路由更新 — `menu.md` — 修改

### Phase 3 脚本资产 + 种子
- [x] env-check.sh：代理/V8 139 比例/GH_TOKEN/worktree 依赖健康/lockfile 缺失预警，输出 ok|warn|fail + 修复提示 — `scripts/env-check.sh` — 新增
- [x] electron-walkthrough.mjs：CDP 连接 + eval/shot/nav/frame/context 五原语 + 渲染就绪等待 — `scripts/electron-walkthrough.mjs` — 新增
- [x] 种子信号：本会话已证信号入 workflow 仓 shadow-docs/signals.md（V8 139 重试收敛、代理劫持 net.fetch、OOPIF 子资源 CDP 盲区等，带深度与证据） — `shadow-docs/signals.md` — 新增
- [x] 验证：env-check.sh 与 electron-walkthrough.mjs 可执行（--help / 空参行为）；norms 三文件结构/引用/路由扫描；skills 引用的文件路径存在性扫描

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 更新
- **候选卡片:** norms/knowledge-cards.md（格式变更即本规范文件本身）、norms/tdd-verification.md（同）
- **理由:** 本 change 的产物就是规范文件自身；验证方式随文件更新内联，另以首次真实 change 消费新规范（复杂度评级 + 信号写回）作为 field 深度回验点。
