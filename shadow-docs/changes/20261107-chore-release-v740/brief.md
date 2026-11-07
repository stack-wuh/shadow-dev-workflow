---
{
  "schema": "shadow-dev/v1",
  "name": "20261107-chore-release-v740",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
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
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:90",
    "planHash": "110c39ea5077726df3d6356dcad7ddf626c0d6289cd172e0ab5689d4127969da",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "scripts/check-release-smoke.mjs",
        "shadow-docs/changes/20261107-chore-release-v740/brief.md"
      ],
      "message": "chore(release): v7.4.0 版本号三处同源 bump + 修本机冒烟门 harness",
      "title": "chore(release): v7.4.0 版本号三处同源 bump",
      "body": "## 变更\n\n三份 manifest 版本 7.3.0 → **7.4.0**(`bump-version.mjs` 一次同源写入)。\n\n附带修复: `scripts/check-release-smoke.mjs` 离线腿把打包产物放进 `--work` 目录,而 `release-smoke.sh` 对 `--work` 先 `rm -rf` 再建 prefix/home——资产在物化前被自己删掉(ENOENT),本机 `npm run ci` 在 macOS 上永远红。修复: 产物挪到 `--work` 之外(独立 mkdtemp)。CI 的 `--release` 模式不受影响;此修复让本机门与 CI 同绿。\n\n## 为什么\n\n发布 v7.4.0: v7.3.0 之后 main 已合并的对外交付面——\n\n- PR #80 `20261102-feature-dsh-host-adapter`: DSH 宿主适配\n- PR #89 `20261107-feature-ai-director-video-skill`: shadow-dev-video 技能升级 AI 导演工作流(资产层/强 schema 分镜/生图子管线/混合渲染),顺带修复 main quality-gate 跨仓脚本引用死链\n\n## 验证\n\n- `npm run check:version` → ✓ 三处 manifest 版本同源: 7.4.0(3 个文件)\n- `npm run ci` 四门全绿: 版本同源 / requires:strict / 知识治理 fail=0 / 产物测试 + 发布冒烟 `OK materialized … skills=13`(与 skills/ 实际目录数一致)\n- `cliVersion` pin 保持 v1.9.0 不动(pin 属能力契约,不随发版变动)\n- tag 后发布链审查: 版本权威 / 资产名契约 / 冒烟\n\nCloses #89 关联的发布诉求(发版载体)"
    }
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

- [ ] task-3 — release plan/execute → PR → merge → sync
- [ ] task-4 — 发版委托:CLI 发版命令键未就位,输出委托清单(git tag v7.4.0 + gh release create)交用户执行;发布链审查(publish-release.yml)核对版本权威/资产名契约/冒烟

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 常规版本 bump,无新长期事实;发版链口径见 knowledge/release-artifact-pipeline.md
