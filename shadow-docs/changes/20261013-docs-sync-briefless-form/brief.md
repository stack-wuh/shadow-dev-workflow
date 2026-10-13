---
{
  "schema": "shadow-dev/v1",
  "name": "20261013-docs-sync-briefless-form",
  "type": "docs",
  "scope": null,
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "docs/20261013-docs-sync-briefless-form",
  "files": [
    "docs/cli-guide.md",
    "shadow-docs/changes/20261013-docs-sync-briefless-form/brief.md",
    "skills/shadow-dev-publish/SKILL.md",
    "skills/shadow-dev-release/SKILL.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "c6dc76a46628a7eea33357f1e371db6c2f20613f",
    "verifiedAt": "2026-10-13T06:38:56.954Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "f821d4b2f1f7f5084ab96eaeea391843343912185c33602596769c40c1f9ffce",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "docs/cli-guide.md",
        "shadow-docs/changes/20261013-docs-sync-briefless-form/brief.md",
        "skills/shadow-dev-publish/SKILL.md",
        "skills/shadow-dev-release/SKILL.md"
      ],
      "message": "docs: 同步 sync 无 brief 调用形态到插件三处文档",
      "title": "docs: 同步 sync 无 brief 调用形态到插件三处文档",
      "body": "## 变更\n- `docs/cli-guide.md`：sync 命令表两行改为可选 `--name` / `--base-branch`，收口示例改无 brief 形态\n- `skills/shadow-dev-release/SKILL.md`：§4 命令块与说明改为 `git switch main` + 无 `--name` 形态\n- `skills/shadow-dev-publish/SKILL.md`：§4 末段「合并后同步本地基线」同一形态\n- 文档首次写明语义代价：非 main 基线必须显式传 `--base-branch`\n\n## 影响\n- 行为/触发面变化：AI 在 squash 收口时不再被文档引向会 `BRIEF_NOT_FOUND` 的旧形态\n- 消除隐性人工步骤：不再需要人退回去跑裸 `git merge --ff-only`\n- 明确不受影响的范围：apply 段 `sync plan --name` 示例保留（那里 brief 在盘，行为未变）\n- `rules/`、`knowledge/`、`norms/`、三份 manifest 版本与 `cliVersion` 均未触碰（不混交）\n\n## 验证\n- 命令与结果：`npm run check:brief` → `摘要: briefs=4 ok=2 warn=2 fail=0`（两条 warn 是既有 GRANDFATHERED 豁免）\n- 残留扫描：`grep -rn \"sync execute --name\" docs skills norms rules knowledge`\n  扫描面另含 `README.md`、`CLAUDE.md`、`menu.md` → 唯一命中 `docs/cli-guide.md:158`（有意保留）\n- 差异面：`git diff --stat` = 3 文件 13 增 9 删\n- 本形态实证：CLI 仓两次收口（#70 → `92515be`、#71 → `840ee88`）均用这条命令序列跑通，工作树干净\n- 未覆盖项：本机不跑 `npm run ci`（含 install-cli/pack，依赖 `SHADOW_DEV_BASH` 口径），由本仓 `quality-gate` 承担\n\n## 关联\n- Closes #59\n- brief: shadow-docs/changes/20261013-docs-sync-briefless-form/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": null
  }
}
---

# 20261013-docs-sync-briefless-form

## 动机

CLI v1.7.0 把 `sync` 的基线来源从「brief 硬依赖」改成 `--base-branch` > `brief.baseBranch` > 当前分支（PR #70，闭合 issue #65）。插件侧三处文档仍在教 `sync plan --name <n>`——那正是 squash 合并后会 `BRIEF_NOT_FOUND` 的形态，AI 照着做就只能退回人工 `git merge --ff-only`。文档不对齐，新形态等于没交付。

## 复杂度评级

- **评级:** S
- **理由:** 纯文档措辞对齐，零代码改动、零命令键变化；`sync.plan` / `sync.execute` 键名与 `requiresCommands` 声明均不受影响。
- **期望验证深度:** code-read / field——差异走查 + 旧形态残留扫描。

## 覆盖范围

- `docs/cli-guide.md`：命令表 sync 两行 + release 末段收口示例
- `skills/shadow-dev-release/SKILL.md`：§4 的命令块与说明
- `skills/shadow-dev-publish/SKILL.md`：§4 末段「合并后同步本地基线」一句
- 载体 brief 自身

## 决策

- 收口语境改为**不传 `--name`**，并显式写出 `git switch main`：`sync execute` 快进的是当前分支，不先切回基线就会把 feature 分支 ff 到 main——旧示例正踩在这个歧义上。
- apply 段的 `sync plan --name <n>` 保留：那里 brief 在盘、基线由 brief 给出，行为未变，不必制造第二种写法。
- 非 main 基线必须显式传 `--base-branch`：这是所选方案的语义代价，写进文档而不是藏在代码注释里。
- 不混交：本 change 不动 `rules/`、不动 `requiresCommands`、不改三份 manifest 版本与 `cliVersion`（属发布载体）。

## 任务

- [x] task-1 — `docs/cli-guide.md` — sync 表两行 + 收口示例改为无 brief 形态
- [x] task-2 — `skills/shadow-dev-release/SKILL.md` — §4 命令块与说明
- [x] task-3 — `skills/shadow-dev-publish/SKILL.md` — 合并后同步基线一句
- [x] task-4 — 观察点 — `npm run check:brief` + 旧形态残留扫描

## 结果

评级 S，取证形态 code-read / field + grep 实证。S 级不新建套件断言（`scripts/check-brief.mjs` 的 INV-4 也不允许）。

- 差异面：`git diff --stat` = `docs/cli-guide.md | 9 +++++----`、`skills/shadow-dev-publish/SKILL.md | 2 +-`、`skills/shadow-dev-release/SKILL.md | 11 +++++++----`，共 3 文件 13 增 9 删；`rules/`、`knowledge/`、`norms/`、三份 manifest 均未被触碰（不混交版本 bump 与 pin）。
- guard 探针：`npm run check:brief` → `摘要: briefs=4 ok=2 warn=2 fail=0`，尾行 `✅ brief 契约门：4 份在途 brief 的规格段与对账闭合成立`。两条 warn 是 `20261010-build-quality-gate` 与 `20261010-refactor-domain-driven-workflow` 的 `GRANDFATHERED` 豁免（门生效前的在途 brief），与本 change 无关，不属新增红灯。
- 旧形态残留扫描：`grep -rn "sync execute --name" docs skills norms rules knowledge README.md CLAUDE.md menu.md` → 唯一命中 `docs/cli-guide.md:158`；`grep -rn "sync plan --name" docs skills norms rules knowledge` → 唯一命中 `docs/cli-guide.md:157`。两处都在 apply 段示例（那里 brief 在盘、基线由 brief 给出，行为未变），是决策里明确保留的用法，不是漏改。
- 收口语境逐处核对：`docs/cli-guide.md:174-176`、`skills/shadow-dev-release/SKILL.md:48-50`、`skills/shadow-dev-publish/SKILL.md:57` 三处均已改为 `git switch main` + 无 `--name` 的 `sync plan` + `sync execute --plan-hash <hash> --confirm`。
- 新形态的本仓自证：CLI 仓 `20261013-fix-sync-briefless-base`（PR #70）与 `20261013-chore-release-v170`（PR #71）两次收口都用这条命令序列跑通——`sync execute` 无 `--name` 分别快进到 `92515be`、`840ee88`，`git status --short` 为空。文档教的正是已被真实执行过的形态，不是推定。

**未覆盖项（明说）**

- 本机不跑本仓 `npm test` / `npm run ci`：其中 `install-cli`、`pack` 两类测试依赖 `SHADOW_DEV_BASH` 指向 Git bash，本机口径易错；四门一体由本仓 CI 的 `quality-gate` 承担，PR checks 未绿前不视为交付完成。
- 文档改动无法被套件断言覆盖（`pack.mjs` 只校验技能目录逐名收录，本次未增删技能目录），取 grep 与 diff 走查为证。
