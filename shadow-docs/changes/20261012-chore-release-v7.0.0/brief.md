---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-chore-release-v7.0.0",
  "type": "chore",
  "scope": "distribution",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "chore/20261012-chore-release-v7.0.0",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "CLAUDE.md",
    "README.md",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-chore-release-v7.0.0/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "8ba27984ecc452137b5799328c3c94c3f89e02af",
    "verifiedAt": "2026-10-12T06:18:58.333Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "e7c41f366a29d719a563ad51915bbf606673b63b914ae556a309e654e3a26a66",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "CLAUDE.md",
        "README.md",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-chore-release-v7.0.0/brief.md"
      ],
      "message": "chore(release): v7.0.0 三处 manifest bump 与对外表述同源（五门/brief 契约/取证策略）",
      "title": "[chore] 发版载体 v7.0.0：bump 三处 manifest 与对外表述同源",
      "body": "覆盖范围：#44 上下文地图 · #47/#48 去先红仪式（验收对象＝不变量）· #49 流程重排（归档入 release 末段、publish 独立）· #50 质量门可复现与台账门（曾占号 6.10.0 未打 tag）· #51 证据门分层（SDD 规格层 INV-n 与对账表、门槛层 guard/regression、取证层 assert-first 四条判据，新增 scripts/check-brief.mjs）。 为什么 major：合并放行的判据本身变了，brief 格式新增 INV-n 与取证策略必填，宿主上所有后续 change 的执行方式随之改变。 内容：三份 manifest 6.10.0 升到 7.0.0；README 与 CLAUDE.md 的门表和流程段补第五门与三条放行判据；两份宿主清单描述同步 gate 与 probe 分层；INDEX 登记。 验证：npm run ci 五门 rc=0（check:brief briefs=3 fail=0、check:knowledge ok=11 fail=0、套件 20/20）。 合并后待用户执行发版三命令（发版能力不在已 pin 的 CLI 命令目录内，按技能响亮阻塞）：bump 复核、打 tag 推送、创建 Release，逐条见 brief。"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "发版揭示的资产契约与tag权威已由release-artifact-pipeline卡持有，本次无新长期事实"
  }
}
---

# 发版 v7.0.0（major）

## 动机
自 Release **v6.5.1**（2026-10-09）之后已合并 5 个 change 但一次未发版，外部宿主绑到的仍是旧技能集。本次一并发布，并按对外承诺的破坏性程度打 **major**：验证与放行的判据被重写（不再是「套件绿即完成」），后续所有 change 的 brief 格式与取证口径随之变更。

## 复杂度评级
- **评级:** S
- **理由:** 纯声明式版本 bump 与对外表述文本对齐，零行为契约变更（门的实现属 `scripts/check-brief.mjs`，已随 PR #51 审查合入，本 change 不再动逻辑）。
- **期望验证深度:** code-read

## 覆盖范围（已合并未发布）
- **#44** feature-workflow-context-map — `shadow-docs/domain.md` 上下文地图与 domain 值域机器判定
- **#47 / #48** refactor-kill-tdd-verification — 取消默认先红仪式，验收对象统一为不变量，既有套件降格为契约探针
- **#49** refactor-flow-order-publish-stage — 归档并入 release 末段，正式发布独立为 publish 阶段
- **#50** build-gate-reproducibility — 质量门本机可复现 + 变更台账一致性门；manifest 曾占号 **6.10.0 但从未打 tag**（tag 权威断在 v6.5.1）
- **#51** refactor-evidence-gate-layers — 证据门分层：SDD 规格层（`INV-n` + 对账表）／门槛层（guard 必绿、regression 按 CI 实测 ≤ 60s）／取证层（assert-first 四条触发判据），新增 `scripts/check-brief.mjs` 机器门

## 引用规范
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: tag 必须指向已含 bump 的 main；资产名匹配 ^shadow-dev-workflow-v[0-9][0-9.]*\\.tar\\.gz$；隔离 prefix 冒烟须见 skills 数与 `skills/` 目录数一致
  - 适用 scope: bump、tag、Release、发布链
- `knowledge/contract-probe.md`
  - 当前结论: 三条放行判据＝观察点闭合 ∧ guard 绿 ∧ regression 绿（按 60s 阈值适用）；绿是门槛不是证据
  - 适用 scope: `norms/verification.md`、`scripts/`、`test/`、CI

## 决策
- **选型:** 一次 major（7.0.0）覆盖上述 5 个 change；`6.10.0` 号已用未发，在载体 brief 写明被 7.0.0 覆盖，不追溯补 tag（补 tag 会让同一 tree 挂两个版本号，破坏版本权威）。
- **对比方案:** 直接 tag v6.10.0（否——#51 的契约变更会被塞进已被 #50 占用的号里，对外看不出破坏性）；分两次发版（否——中间态没有消费方，攒版本就是 publish 阶段的既定语义）。
- **理由:** 破坏性来自判据本身（合并放行的机器判定变了），会改变宿主上所有后续 change 的执行方式，major 是唯一诚实的位；只 bump 三份 manifest，`cliVersion` pin 属能力契约不随发版动。

## 任务
### Phase 1
- [x] bump 三份 manifest 到 7.0.0 — `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`
- [x] 对外表述与产物同源：README 流程段补三条放行判据与取证策略 — `README.md`
- [x] 宿主清单描述补 gate/probe 分层语义 — `.claude-plugin/plugin.json`
- [x] 登记台账条目并跑四门一体（`npm run ci`） — `shadow-docs/INDEX.md`

- 偏差记录：`CLAUDE.md` 的机器门表（四门→五门）属同一处对外表述，立项 files 未列，CLI 1.5.0 无 `change amend`，手工补入并留痕。

## 结果
- 实际耗时: —
- 验证: —（S 级 diff 走查 + `npm run ci` 输出）

## 知识评估
- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 发版揭示的长期事实（占号未发的处理、tag 权威）已由 `knowledge/release-artifact-pipeline.md` 持有；若第 5 步暴露新的资产契约坑，再按该卡原位更新。
