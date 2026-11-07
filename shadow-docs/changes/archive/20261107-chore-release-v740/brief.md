---
{
  "schema": "shadow-dev/v1",
  "name": "20261107-chore-release-v740",
  "type": "chore",
  "scope": "distribution",
  "status": "archived",
  "baseBranch": "main",
  "branch": "chore/20261107-chore-release-v740",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "scripts/check-release-smoke.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 90,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/90"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "4235c8500fdf49b2ca584d7a5036f149262be91d",
    "verifiedAt": "2026-11-07T12:42:23.900Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:90",
    "planHash": "98241f8bff75af86805501ecedb71faf86ede17dcd9ac22ee959c53df2a71b34",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "scripts/check-release-smoke.mjs",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261107-chore-release-v740/brief.md"
      ],
      "message": "chore(release): v7.4.0 版本号三处同源 bump + 修本机冒烟门 harness",
      "title": "chore(release): v7.4.0 版本号三处同源 bump",
      "body": "三份 manifest 版本 7.3.0 → 7.4.0;附带修复 check-release-smoke.mjs 离线腿(产物被 --work 的 rm -rf 自删,挪到 --work 之外)。覆盖: PR #80 DSH 宿主适配 + PR #89 AI 导演技能升级。详见 brief。"
    },
    "commit": {
      "files": [
        "shadow-docs/INDEX.md"
      ],
      "message": "docs(shadow): 台账补登记 20261107-chore-release-v740,INDEX 与在途目录同源"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "S 级常规版本 bump:三处 manifest 同源由 check:version 机检;发版链三条对账(版本权威/资产名契约/冒烟 skills=13)全绿;smoke harness 修复为一次性 harness 纠错,无新长期事实(既有 release-artifact-pipeline 卡口径未变)"
  }
}
---

# 发布 v7.4.0

## 动机

发布 v7.4.0。v7.3.0 之后 main 已合并 2 个 feature,对外交付面新增 DSH 宿主适配与视频技能的 AI 导演工作流,需一次可安装的版本发出去。

## 复杂度评级

- **评级:** S
- **理由:** 纯声明式版本 bump(三份 manifest 同源,由 bump-version.mjs 一次写入),不改技能正文、不改命令契约。
- **期望验证深度:** code-read
- **取证策略:** `npm run check:version` 三处同源;发布链审查核对版本权威 / 资产名契约 / 冒烟 skills 数。

## 引用规范

- norms/knowledge-cards.md / knowledge/release-artifact-pipeline.md
  - 当前结论: tag 必须指向已含 bump 的 main;资产名必须匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`;冒烟须见 `OK materialized root=… skills=N` 且 N 与 skills/ 实际目录数一致
  - 适用 scope: package.json, .claude-plugin/plugin.json, .codex-plugin/plugin.json
  - 遵循方式: 先合并 bump 再打 tag;cliVersion pin 属能力契约,本次不动

## 领域模型

- **限界上下文:** 分发(distribution)——版本是对外承诺,三处 manifest 必须同源。
- **不变量:**
  - **INV-1** `check:version` 判定 package.json / .claude-plugin / .codex-plugin 三处版本一致
  - **INV-2** `cliVersion` pin 不随发版变动(本次保持 v1.9.0)
  - **INV-3** 覆盖范围必须显式列出,禁止只 bump 不列

## 决策

- **选型:** minor bump 7.3.0 → 7.4.0(两个 feature = 对外能力面扩张:DSH 宿主适配 + AI 导演工作流)。
- **对比方案:** patch 7.3.1——把两个 feature 当修补,低估交付语义,否决。

## 覆盖范围(v7.3.0 之后已合并)

- PR #80 `20261102-feature-dsh-host-adapter`: DSH 宿主适配
- PR #89 `20261107-feature-ai-director-video-skill`: shadow-dev-video 技能升级 AI 导演工作流(资产层/强 schema 分镜/生图子管线/混合渲染;顺带修复 main quality-gate 跨仓脚本引用死链)
- 跳过:20261012-fix-smoke-failure-as-fixture 与 v730 载体(已随 v7.3.0 交付);20261010-build-quality-gate / 20261010-refactor-domain-driven-workflow(休眠 committed,无 PR,未交付)

## 任务

### Phase 1 bump 与门槛

- [x] task-1 — package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json — `node scripts/bump-version.mjs 7.4.0` 三处同源
- [x] task-2 — 门槛:`npm run check:version` + `npm run ci`(四门一体)

### Phase 2 提交合并与发版

- [x] task-3 — release plan/execute → PR #90 → merge(main `4235c85`)→ sync
- [x] task-4 — 发版委托执行完毕:tag v7.4.0 + Release 由用户执行(CLI 发版命令键未就位,pin v1.9.0 不动);发布链审查三条对账全绿

## 结果

- 实际耗时: 2026-11-07 单日(与两个 feature change 同日推进)
- 验证:
  - INV-1 版本同源:`node scripts/bump-version.mjs --check` → `✓ 三处 manifest 版本同源: 7.4.0(3 个文件)`
  - INV-2 pin 未动:`cliVersion` 保持 v1.9.0(未出现在本次 bump 文件集)
  - INV-3 覆盖范围:上文「覆盖范围」节显式列出两个 feature 与三类跳过项及理由
  - 四门:`npm run ci` 全绿——版本同源 / requires:strict / 知识治理 fail=0 / 产物测试 + 发布冒烟
- **发版链审查(run 42373471828,success)**:
  - 版本权威:tag `v7.4.0` sha `4235c85` == main HEAD(bump 已含于 tag 指向 tree)✓
  - 资产名契约:`shadow-dev-workflow-v7.4.0.tar.gz` 匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`,断言步 `OK asset contract` ✓
  - 发布冒烟(唯一实现 release-smoke.sh,隔离 prefix):`OK materialized root=…/prefix/shadow-dev-workflow-7.4.0 skills=13`(与 skills/ 实际目录数一致)✓
  - Release:https://github.com/stack-wuh/shadow-dev-workflow/releases/tag/v7.4.0
- **附带修复(用户裁定随载体)**:`scripts/check-release-smoke.mjs` 离线腿真 bug——打包产物置于 `--work` 内,而 `release-smoke.sh` 对 `--work` 先 `rm -rf`,资产在物化前被自删(ENOENT),本机 `npm run ci` 在 macOS 永远红;修复=产物挪至独立 mkdtemp(`--work` 之外),CI 的 `--release` 模式不受影响。修复后本机门与 CI 同绿(fail=0 deferred=0 materialized=1)
- 环境备注:`npm run ci` 首跑与一次 release execute 撞 exit 139(本机已知段错误),重试全过;发版命令键缺口如实走委托,未降级
- 未验证项(明说):宿主侧生效(pack/bind 更新技能产物)待用户按需执行 `shadow-dev bind plan/execute` 或攒版后安装新产物

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 常规版本 bump,无新长期事实;发版链口径见 knowledge/release-artifact-pipeline.md
