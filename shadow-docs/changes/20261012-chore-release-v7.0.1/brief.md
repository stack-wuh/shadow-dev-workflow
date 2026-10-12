---
{
  "schema": "shadow-dev/v1",
  "name": "20261012-chore-release-v7.0.1",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261012-chore-release-v7.0.1",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/INDEX.md",
    "shadow-docs/changes/20261012-chore-release-v7.0.1/brief.md"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 54,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/54"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "046c17ffc077c96d53a90ec2dc491bde2ae7cd6a",
    "verifiedAt": "2026-10-12T06:52:26.512Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:54",
    "planHash": "b092c4f95f0e07929f1f24e5d7fe2c816d6efee3e8f77ca1c2adcfffa4e22ab6",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261012-chore-release-v7.0.1/brief.md"
      ],
      "message": "chore(release): v7.0.1 三处 manifest bump（首个执行修复后发布链的版本）",
      "title": "[chore] 发版载体 v7.0.1：让修复后的发布链第一次真实执行",
      "body": "v7.0.0 三条交付证据里发布冒烟判红（run 38212369929），修复已随 #53 合入 main。Actions 取事件 SHA 上的 workflow 文件，rerun 验不到修复，故必须再发一版才能拿到链绿证据。 · 覆盖范围：#53 发布冒烟字段与布局修复、CURRENT 指针一致性断言、skills 期望值改实测、新增第六门 scripts/check-release-smoke.mjs（静态字段契约白名单 + 离线 --from 物化）、README/CLAUDE 门数改六门、发布链卡补字段契约与 deferred 语义。 · 内容：三份 manifest 7.0.0 升到 7.0.1，cliVersion pin 不动；INDEX 先登记再提交（防台账门）。 · 验证：npm run ci 权威通道退出码 0，六门 fail=0，npm test 27/27。 · 合并后待用户执行（发版能力不在已 pin 的 CLI 命令目录内，按技能响亮阻塞）：bump 复核、打 tag v7.0.1 并推送、创建 Release，逐条见 brief。"
    },
    "commit": {
      "files": [
        "shadow-docs/changes/20261012-chore-release-v7.0.1/brief.md"
      ],
      "message": "docs(shadow): 载体 brief 回填验证读数并登记 release 处缺 review 前置断言"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "发版事实待第5步执行后回填，长期结论已由发布链卡持有"
  }
}
---

# 发版 v7.0.1（发布链冒烟修复的首个真实执行）

## 动机
v7.0.0 的三条交付证据只成立两条：版本权威与资产契约绿，**发布冒烟判红**（run 38212369929）。修复已随 PR #53 合入 main，但 `publish-release.yml` 只在 `release.published` 事件上执行，且 Actions 取的是**事件 SHA 上的 workflow 文件**——`gh run rerun` 永远验不到修复。必须再发一版，才拿得到「冒烟真的跑通」这条证据；否则 v7.0.0 的交付状态只能停在「产物已发布、证据未闭合」。

## 复杂度评级
- **评级:** S
- **理由:** 纯声明式版本 bump，零行为契约变更（冒烟修复与第六门已在 #53 审查合入）。
- **期望验证深度:** code-read

## 覆盖范围（已合并未发布）
- **#53** fix-release-smoke-field-contract — 发布冒烟改读 `workflow execute` 的 `version` 字段、ROOT 由 CLI 物化布局派生、新增 `CURRENT` 指针一致性断言、skills 期望值改实测；新增第六门 `scripts/check-release-smoke.mjs`（静态字段契约 + 离线 `--from` 物化）；`README/CLAUDE` 门数改六门；发布链卡补字段契约与 deferred 语义

## 引用规范
- `knowledge/release-artifact-pipeline.md`
  - 当前结论: 版本权威＝release tag；资产名匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\\.tar\\.gz$`；冒烟须走 plan → execute → status → bind 并输出 `OK materialized root=… skills=N`；断言自身必须可本机复现
  - 适用 scope: bump、tag、Release、发布链与冒烟

## 决策
- **选型:** patch bump 到 `7.0.1`，内容只有发布链修复；tag 指向已含 bump 与归档提交的 main。
- **对比方案:** 直接补打 v7.0.0 的 tag（否——tag 与 tree 已定，补打等于篡改已发布版本的指向，且冒烟仍不会被执行）；只 rerun（否——取旧文件，验不到修复）。
- **理由:** 版本是对外承诺；7.0.1 让「消费侧拿到的产物」与「链绿的证据」第一次对上同一棵 tree。只 bump 三份 manifest，`cliVersion` pin 不动。

## 任务
### Phase 1
- [x] bump 三份 manifest 到 7.0.1 — `package.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`
- [x] 登记台账条目（在提交前，防台账门判红） — `shadow-docs/INDEX.md`
- [x] 六门一体本机全绿 — `package.json`
- [x] 发 PR、待合并后由用户打 tag 与创建 Release，结论回填本段 — `shadow-docs/changes/20261012-chore-release-v7.0.1/brief.md`

## 结果
- 实际耗时: —
- 验证: —

## 结果（部分回填）
- 实际耗时: 约 12 分钟（bump、台账、六门实跑、PR）
- 验证: 观察点：@@npm run ci@@ 在权威通道（exec_command）**进程退出码 0**；@@npm test@@ 27/27；六门摘要依次为 @@check:knowledge ok=11 fail=0@@、@@check:brief briefs=4 fail=0@@、@@check:smoke checks=2 fail=0 deferred=1@@（本机物化腿因 execution-layer 的 @@bash -c tar@@ 路径缺陷显式 deferred，Linux/macOS runner 跑实断言）
- 待回填: tag v7.0.1、@@publish-release@@ run 链接、Release URL、冒烟输出摘要（本次发版的唯一目的就是把修复后的链跑绿）
- 流程缺口（护栏漏放的错，登记为后继 change）：review 结论仍为 pending 时 @@release execute@@ 照样完成 commit+push+PR（PR #54），CLI 只在 @@archive plan/execute@@ 处校验 review passed。门槛层应把「review passed」也做成 release 的前置断言，否则未审查的实现可以进 PR、只在最后一步才被拦——与本仓 @@rules/iron-laws.md@@ §1「验证强度与评级不符视为未开始」的口径不一致。

## 知识评估
- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 字段契约与离线冒烟已由 `release-artifact-pipeline.md` 持有（#53 落卡）；本载体只回填本次发版的 run 与冒烟读数。
