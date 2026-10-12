---
name: shadow-dev-publish
description: 正式发版 — 独立入口，bump 版本、打 release tag、创建 GitHub Release 并触发 Actions 发布链。与单个 change 解耦，可攒多个已合并 change 一次发布。触发词：发版、正式发布、上线版本、打 tag、publish。
---
# Shadow Dev Publish — 正式发版

**发版与 change 解耦**：不是每个 change 都发版。`release` 阶段负责「知识闭环 + 提交 + PR + 合并后归档」，`publish` 只在用户明确要求对外发布一个可安装的产物版本时运行，一次可覆盖多个已合并但未发布的 change（攒版）。

**阶段名区分（易混，必读）**：本阶段的 `publish` 指**正式发版**，与 CLI 里同名的 `publish.*` 命令键**无关**——后者语义是「推分支 + 创建/复用 PR」。本仓技能正文发 PR 一律走 `release.*`；发版动作走 CLI 的发版命令域。登记见 `shadow-docs/domain.md` 术语表。

**执行纪律：** AI 只负责推导、决策与审查 CLI 返回的结果。一切仓库与 GitHub 写操作一律经 `shadow-dev` CLI 完成；禁止原始 `git`/`gh` 写命令，禁止脚本旁路。运行检查与探针属于收集验证证据，允许直接执行，但结论必须引用真实输出。

**进场：** 任何操作前，先输出：`▶ [进场] shadow-dev-publish · 正式发版`

## 1. 准入判定（三条同时满足才继续）

1. **工作树与基线干净**：本地 main 与远端一致，且 `quality-gate` 对当前 main 为绿。发版不许带未审查的实现进 tag。
2. **发布范围明确**：列出本次覆盖的已合并 change（CLI 的 `change list` 取实际状态），逐条确认「该 change 是否属于要对外交付的内容变更」。只改 `shadow-docs/` 的历史项可跳过，但必须在结论里写明跳过理由——**禁止只 bump 不列覆盖范围**。
3. **版本号商定**：与用户确认 bump 位（major / minor / patch）与目标版本。版本是对外承诺，不由 AI 单方面推定。

任一不满足 → 停止并报告，不发版。

## 2. 建立发版载体 change

每次发版自身立一个 `chore` change（命名 `YYYYMMDD-chore-release-v<ver>`），使版本变更进入 brief 治理与 INDEX 历史，而不是游离在流程外的手工动作。

```bash
shadow-dev change create --name <YYYYMMDD-chore-release-vX.Y.Z> --type chore --scope distribution --base-branch main --files package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json --body-file <正文> --confirm
shadow-dev change approve --name <载体名> --confirm
shadow-dev branch plan --name <载体名>
shadow-dev branch execute --name <载体名> --confirm
```

载体 brief 正文最简（S 级：纯声明式配置，期望验证深度 code-read）：动机 = 发布 vX.Y.Z；覆盖范围 = 第 1 步列出的 change 清单；结果段留空待回填 tag / run 链接 / 冒烟输出。

## 3. bump 与版本同源

```bash
node scripts/bump-version.mjs <ver>     # 一次同步 package.json + 两份宿主清单
npm run check:version                   # 三份同源，不一致即红
npm run ci                              # 四门一体：版本 / requires:strict / 知识治理 / 产物测试
```

**只 bump 三份 manifest，不动 `cliVersion`**——pin 属能力契约，随能力变化单独走变更，不与发版混在一起。

宿主清单里含流程描述文本（`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` 的 description 与 interface）：若本次发版携带的流程语义有变，这些文本必须与 README/CLAUDE.md 同源，否则视为对外表述与产物不一致。

## 4. 提交 bump 并等合并

```bash
shadow-dev release plan --name <载体名> --files package.json,.claude-plugin/plugin.json,.codex-plugin/plugin.json,shadow-docs/changes/<载体名>/brief.md --message "chore(release): vX.Y.Z 版本号三处同源 bump" --title "chore(release): vX.Y.Z"
shadow-dev release execute --name <载体名> --confirm
```

向用户确认后执行。**tag 必须指向已含 bump 的 main**——先合并，后打 tag；顺序颠倒会让产物与 tag 指向的 tree 分裂，等于把版本权威降级成补丁（`knowledge/release-artifact-pipeline.md`）。

合并后同步本地基线：`shadow-dev sync plan` + `shadow-dev sync execute --name <载体名> --confirm`。

## 5. 发版（打 tag + 创建 GitHub Release）

动作面＝断言三份 manifest 版本同源且等于目标版本 → 打 tag → 推 tag → 创建 Release。**该能力由 `execution-layer` 提供，本仓只消费，不自行执行 `git tag` / `gh release create`。**

**能力未就位时响亮阻塞（当前状态，非协商）：** 已 pin 的 CLI 命令目录不含发版命令键。此时**停止并输出委托清单**，交用户执行，等用户回传 tag 与 Release 结果：

```bash
node scripts/bump-version.mjs --check        # 复核版本同源
git tag v<ver> && git push origin v<ver>     # 由用户执行
gh release create v<ver> --generate-notes    # 由用户执行
```

禁止把这条清单变成 AI 自己跑的「临时方案」，也禁止因此跳过发版还把载体 brief 标成已交付。能力缺口写入载体 brief「结果」段，等 `execution-layer` 发布含发版命令键的版本后，由后续 change 把本步骤替换为 CLI 调用并同步 `package.json.requiresCommands`。

## 6. 审查发布链

`release.published` 触发 `.github/workflows/publish-release.yml`：版本权威判定 → 装 pin CLI → 四门 → pack → 资产名契约断言 → 上传 → **隔离 prefix 发布冒烟**（`workflow plan --release` → `workflow execute` → `bind plan`）。

只审查外部提供给 AI 的结果（run 链接、日志、Release URL），逐条核对：

- **版本权威**：tag 去 `v` == 三份 manifest version。
- **资产契约**：资产名匹配 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`——名字写错等于没发布（消费侧 `RELEASE_NOT_FOUND`）。
- **冒烟结论**：须见 `OK materialized root=… skills=<N>`，且 N 与 `skills/` 实际目录数一致。

**任一红 → 停止并报告，不写「已交付」，不归档载体 brief。** 探针绿与 run 绿都不算交付证据；交付证据是这三条的对账结果加 Release URL。

## 7. 回填与归档

把第 6 步结论（tag、run 链接、Release URL、冒烟输出摘要、实际耗时）写入载体 brief「结果」段，再走 `shadow-dev-review`（S 级：diff 走查）与 `shadow-dev-release`；PR merged 后由 release 末段 `archive plan/execute` 归档载体并重建 INDEX。

发版揭示的长期事实（新的资产契约坑、冒烟语义变化）按 `norms/knowledge-cards.md` 更新 `knowledge/release-artifact-pipeline.md`，不为一次发版新建卡片。

## 不可省清单

- 准入三条（工作树干净且门禁绿 / 覆盖范围明确 / 版本号商定）
- tag 指向的 tree 必须已含 bump（先合并后打 tag）
- 三份 manifest 版本同源，由 `check:version` 判定，不由 CI 事后回写修正
- 资产名契约断言与发布冒烟必须实际核对，不凭「Actions 已跑」推断
- 一切 Git/GitHub 写操作经 CLI；能力缺失时阻塞或委托，**不降级为手工写命令**
- 发版链红 → 不声明已交付、不归档载体

**离场：** 完成时输出：`✅ [离场] shadow-dev-publish · tag v<ver> · Release: <url> · 冒烟: <OK skills=N | 缺口说明> · 载体: <载体名>`
