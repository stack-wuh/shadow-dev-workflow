---
{
  "schema": "shadow-dev/v1",
  "name": "20261104-chore-release-v730",
  "type": "chore",
  "scope": "distribution",
  "status": "published",
  "baseBranch": "main",
  "branch": "chore/20261104-chore-release-v730",
  "files": [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "package.json",
    "shadow-docs/changes/20261104-chore-release-v730/brief.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 85,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/85",
    "pullRequest": 86,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/86"
  },
  "review": {
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": "pr:86",
    "planHash": "c4ec110c985e15a40867ea029359530c8cf6798bf380c122a46963fac175e409",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[chore] 20261104-chore-release-v730",
      "titleRaw": null,
      "supplement": "",
      "body": "## 动机\n发布 v7.3.0。v7.2.1 之后 main 已合并 6 个 change，对外交付面新增配音产出能力与视频制作流程定稿，需一次可安装的版本把它们发出去。\n\n## 引用规范\n- norms/knowledge-cards.md / knowledge/release-artifact-pipeline.md\n  - 当前结论: tag 必须指向已含 bump 的 main；资产名必须匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\\.tar\\.gz$`；冒烟须见 `OK materialized root=… skills=N` 且 N 与 skills/ 实际目录数一致\n  - 适用 scope: package.json, .claude-plugin/plugin.json, .codex-plugin/plugin.json\n  - 遵循方式: 先合并 bump 再打 tag；cliVersion pin 属能力契约，本次不动\n\n## 决策\n- **选型:** minor bump 7.2.1 → 7.3.0（新增 shadow-dev-tts 技能 = 对外能力面扩张）。\n- **对比方案:** patch 7.2.2——把新技能当修补，低估交付语义，否决。\n\n## 任务\n- [ ] bump-version.mjs 7.3.0 → check:version 绿\n- [ ] release → PR → merge\n- [ ] tag v7.3.0 → 发布链审查（版本权威 / 资产契约 / 冒烟 skills=13）\n\n完整 brief：shadow-docs/changes/20261104-chore-release-v730/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261104-chore-release-v730\",\"type\":\"chore\",\"scope\":\"distribution\",\"status\":\"branched\",\"branch\":\"chore/20261104-chore-release-v730\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261104-chore-release-v730/brief.md\",\"cliVersion\":\"1.9.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": []
    },
    "release": {
      "files": [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        "package.json",
        "shadow-docs/changes/20261104-chore-release-v730/brief.md"
      ],
      "message": "chore(release): v7.3.0 版本号三处同源 bump",
      "title": "chore(release): v7.3.0 版本号三处同源 bump",
      "body": "## 变更\n\n三份 manifest 版本 7.2.1 → **7.3.0**（`bump-version.mjs` 一次同源写入）。\n\n## 为什么\n\n发布 v7.3.0：v7.2.1 之后 main 已合并的对外交付面——\n\n- PR #82 新增 `shadow-dev-tts` 配音产出技能\n- PR #83 配音师角色入编（双声部设计、落点对位纪律）\n- PR #84 工具载体指向 shadow-dev-cli 仓 `tools/qwen-tts`\n- PR #77/#78/#79 视频制作流程定稿（编剧环节、镜级产出物规范、卡死预防三层、驱动器双轨）\n\n## 验证\n\n- `npm run check:version` → ✓ 三处 manifest 版本同源: 7.3.0（3 个文件）\n- `cliVersion` pin 保持 v1.9.0 不动（pin 属能力契约，随 CLI v1.10.0 合入后另走独立 change）\n- 发布链审查在 tag 后核对：版本权威 / 资产名契约 / 冒烟 `OK materialized … skills=13`\n\nCloses #85"
    }
  }
}
---

## 动机

发布 v7.3.0。v7.2.1 之后 main 已合并 6 个 change，对外交付面新增配音产出能力与视频制作流程定稿，需一次可安装的版本把它们发出去。

## 复杂度评级

- **评级:** S
- **理由:** 纯声明式版本 bump（三份 manifest 同源，由 bump-version.mjs 一次写入），不改技能正文、不改命令契约。
- **期望验证深度:** code-read
- **取证策略:** `npm run check:version` 三处同源；发布链审查核对版本权威 / 资产名契约 / 冒烟 skills 数。

## 引用规范

- norms/knowledge-cards.md / knowledge/release-artifact-pipeline.md
  - 当前结论: tag 必须指向已含 bump 的 main；资产名必须匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`；冒烟须见 `OK materialized root=… skills=N` 且 N 与 skills/ 实际目录数一致
  - 适用 scope: package.json, .claude-plugin/plugin.json, .codex-plugin/plugin.json
  - 遵循方式: 先合并 bump 再打 tag；cliVersion pin 属能力契约，本次不动

## 领域模型

- **限界上下文:** 分发（distribution）——版本是对外承诺，三处 manifest 必须同源。
- **不变量:**
  - **INV-1** `check:version` 判定 package.json / .claude-plugin / .codex-plugin 三处版本一致
  - **INV-2** `cliVersion` pin 不随发版变动（本次保持 v1.9.0，待 CLI v1.10.0 合入后由独立 pin change 升）
  - **INV-3** 覆盖范围必须显式列出，禁止只 bump 不列

## 决策

- **选型:** minor bump 7.2.1 → 7.3.0（新增 shadow-dev-tts 技能 = 对外能力面扩张）。
- **对比方案:** patch 7.2.2——把新技能当修补，低估交付语义，否决。

## 覆盖范围（v7.2.1 之后已合并）

- PR #82 `feat(tts)`: 新增 shadow-dev-tts 配音产出技能 + 修 video 技能死链
- PR #83 `feat(video)`: 配音师角色入编——双声部设计、落点对位纪律
- PR #84 `docs(tts)`: 工具载体指向 shadow-dev-cli 仓 tools/qwen-tts
- PR #79 `feat(video)`: 驱动器双轨定稿——A 轨 shell 进程隔离 + B 轨 CI 承接
- PR #77/#78 `feat(video)`: 前期编剧环节 + 镜级产出物规范 + 卡死预防三层
- PR #81 `chore`: cliVersion pin v1.9.0（已含在 v7.2.1→本次之间）

## 任务

- [ ] bump-version.mjs 7.3.0 → check:version 绿
- [ ] release → PR → merge
- [ ] tag v7.3.0 → 发布链审查（版本权威 / 资产契约 / 冒烟 skills=13）
