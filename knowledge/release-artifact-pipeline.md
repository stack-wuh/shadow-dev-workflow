---
title: 发布链版本权威与产物资产契约
domain: distribution
keywords: [发布, release, publish, 发版, tag, 版本权威, 资产名, tarball, pack, 上传, 发布冒烟, 离线冒烟, 字段契约, payload contract, deferred, 物化布局, quality-gate, publish-release, CI, strict, 半绿, GITHUB_PATH, PATH, shim]
scope: [scripts/pack.mjs, scripts/bump-version.mjs, scripts/check-requires.mjs, scripts/check-knowledge.mjs, .github/workflows/]
status: active
source:
  - changes/20261010-build-quality-gate/brief.md
  - changes/20261010-feature-workflow-context-map/brief.md
  - changes/20261012-refactor-flow-order-publish-stage/brief.md
  - changes/20261012-fix-release-smoke-field-contract/brief.md
verified: 2026-10-12
verified-depth: runtime
verified-scope: 2026-10-12 首个真实 release 把冒烟自己送进坟场——v7.0.0 的 `publish-release` run **38212369929 completed/failure**，日志 `OK execute current=undefined` → `x materialized artifact missing norms/verification.md`；读 CLI 源码定案：`workflow execute` 返回 `{action, version, prefix, previous}`，`current` 只属于 `workflow status`。据此新增 `scripts/check-release-smoke.mjs`（字段契约白名单 + 布局派生 + 动态 skills 期望值 + 离线物化），本机门输出 `fail=0 deferred=1`、断言 7/7 绿，其中「真实 yml 必过静态对账」一条在修复前实测判红（先红记录）。Windows 侧另记一条 execution-layer 缺陷：CLI 的 `bash -c tar` 收到反斜杠绝对路径即失败，本机物化降级为显式 deferred，CI（Linux）跑实断言。原记录：本机 `npm run ci` 全绿（版本同源 + requires:strict + 知识治理门含 `--forbid` 变体 + 既有 11 例测试）；strict 反例用 `SHADOW_DEV_CLI` 指向坏文件复现 rc=1，非 strict 同条件复现半绿（rc=0 且输出「CLI 目录未参与断言」）；版本反例单改一份 manifest 复现 rc=1 后回滚；三个 workflow 经 YAML 解析；技能计数门与第 9 张技能同批对账（`find skills -name SKILL.md`=9 与 workflow `expected 9`、pack 名单三处同值）。GitHub 矩阵真跑与发布冒烟待首个 PR / 首个 release 的 run 链接；「tag 指向的 tree 已含 bump 与归档提交」与 `skills=9` 冒烟输出待首个 publish 回填。新增的 `$GITHUB_PATH` 同步内不可见一条：失败侧已由 PR #44 的 `quality-gate` windows 两项 `exit 127` 实证（同 run ubuntu/macos 绿），修复生效待本 PR 转绿后的 run 链接回填。
---

# 发布链版本权威与产物资产契约

## 当前结论

GitHub Release 是产物与版本的**唯一权威发布点**，四件事缺一不可：

1. **版本权威＝release tag**：tag 名去 `v` 后必须与 `package.json.version` 及两份宿主清单 version 同源，不一致即发布失败。一致性由「先 bump 再打 tag」保证，**不由 CI 事后回写修正**——回写会让产物与 tag 指向的 tree 分裂，等于把权威降级成补丁。
2. **资产契约**：release 资产名必须匹配消费侧硬正则 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`（CLI `workflow plan --release/--release latest` 靠它找资产）。名字写错等于没发布——`RELEASE_NOT_FOUND`。
3. **发布冒烟**：上传后立即在隔离 prefix 用真实 CLI 走 `workflow plan --release` → `workflow execute` → `workflow status` → `bind plan`，断言物化内容（`SKILL.md` 数量与仓内实际技能数一致、规范文件在位、`CURRENT` 指针等于物化版本）。不冒烟就无法区分「可消费的产物」与「一个没人能装的文件」。
4. **冒烟自身必须可本机复现**：断言只写在 `publish-release.yml` 里＝只有真发版才执行它，坏门会在无人知晓的情况下躺在 main 上（实证：#50 引入的冒烟直到首个 release 才第一次被执行并立刻判红）。长期形态是 `scripts/check-release-smoke.mjs`——静态对账 yml 读的字段 + 离线 `--from` 本地资产物化，两条腿都进 `npm run ci`。
5. **字段契约（payload contract）**：CI 脚本读的每个 `d.data.<key>` 必须是被 pin 命令实际返回的键。`workflow execute` 只有 `action/version/prefix/previous`；`current`/`resolved` 属 `workflow status`。跨命令借字段是静默失效的头号来源：`CUR` 为空 → 路径拼错 → 断言打在错误对象上，报出来却像「产物缺文件」。
4. **门禁止半绿**：被依赖资源解析不到时必须判红。非交互环境（CI、管道）里 CLI 的 human 帮助层会与 JSON **同流写 stdout**，所以命令目录必须取最后一个 `{"ok"` 契约行并带超时，否则门会假红或假绿。

## 执行约束

- 流程为 `propose → apply → review → release → publish`：**归档不是独立阶段**——`release` 在 PR merged 后末段执行 `archive plan/execute`（brief 入 `changes/archive/` 并重建 INDEX），所有代码问题提交完即收口；`publish` 是**独立发版入口**，与单个 change 解耦（可攒多个已合并 change 一次发布，每次发布自身建一个 `chore` 载体 change 承接 bump/tag/run 结论/冒烟证据）。
- 发版顺序恒为：`node scripts/bump-version.mjs <ver>` → `npm run check:version` → 提交合并 → `git tag v<ver>` → `gh release create`；此后判定、pack、资产断言、上传、冒烟由 `publish-release.yml` 接手。**tag 指向的 tree 必须已含 bump 与归档提交**——归档只搬迁 `shadow-docs/`，绝不触碰三份 manifest，否则版本权威被归档动作污染。
- 打 tag 与创建 Release 的**执行主体是能力问题不是偏好问题**：已 pin 的 CLI 命令目录不含发版命令键时，`publish` 阶段输出委托清单并响亮阻塞，禁止 AI 代跑原始 `git tag` / `gh release create`（依 [产物能力声明与分发一致性门](distribution-capability-contract.md)「内容层遇到命令缺失只能阻塞，不能降级」）。
- 新增机器门一律以 strict 形态进 CI；宽松模式只允许作为本机开发路径，且必须自曝降级态（如 `catalog=unresolved`）。
- `quality-gate.yml` 覆盖 push main 与所有 PR，矩阵含 windows——`tar`/`bash` 的跨平台坑已被实证，只跑 ubuntu 等于把最难发现的回归留在暗处。AI 的本机口头自证不可替代机器门。
- 同一 `run:` 块里**不得依赖 `$GITHUB_PATH` 取刚装的 shim**：`echo ... >> "$GITHUB_PATH"` 只对**后续步骤**生效，紧跟着的冒烟命令仍用旧 PATH。`ubuntu`/`macos` runner 镜像默认 PATH 含 `~/.local/bin` 会蒙过，`windows` 的 Git Bash 不含即 `command not found` 退 127——同一步必须自己 `export PATH="$HOME/.local/bin:$PATH"`（实证：PR #44 的 `quality-gate` windows 两项挂在此处，ubuntu/macos 同 run 全绿）。
- 归档会搬迁 brief：卡片 `source` 按规范写 `changes/<name>/brief.md`，治理门必须向 `changes/archive/<name>/` 兜底解析（否则每张卡在来源 change 归档那天集体判红——本仓实测 3 张跨项目卡中 2 张如此）。
- **技能数量在两处断言**：`test/pack.test.mjs` 逐名清单（写死名单，增删技能须同批改）+ 冒烟计数（**已不再写死数字**，改由 `EXPECTED=$(find skills -name SKILL.md | wc -l)` 与物化实测对账，并由 `check-release-smoke` 禁止字面量比较）。两者都**不得绑在任何外部依赖的 gate 之后**——否则合并后仓内留下错断言，下次发版冒烟必红（实证：20261012 流程重排首版把计数门误绑到跨仓命令键依赖上）。，且**不得绑在任何外部依赖的 gate 之后**——否则合并后仓内留下错断言，下次发版冒烟必红（实证：20261012 流程重排首版把计数门误绑到跨仓命令键依赖上）。

## 适用边界

适用于「内容/规范包 + 独立执行层 CLI」的双仓分发。纯库发布（npm registry、镜像）不适用资产名正则，但**版本权威与发布冒烟同样成立**。

## 验证方式

1. `npm run ci` 本机与 CI 均全绿（含 strict 与知识治理门）。
2. strict 反例：`SHADOW_DEV_CLI=/path/to/broken.mjs npm run check:requires:strict` → rc=1；去掉 `:strict` 同条件 → rc=0 且输出「CLI 目录未参与断言」（半绿证据）。
3. 版本反例：单独改任一份 manifest 的版本 → `npm run check:version` rc=1 并提示修正命令。
4. 发布后：`publish-release` run 的冒烟步骤须输出 `OK materialized root=... skills=<与仓内 find skills -name SKILL.md 计数一致>`（当前 9）。

## 关联知识

- [分发依赖单向与产物能力契约](distribution-capability-contract.md)
- [插件多宿主分发与清单契约](multi-host-plugin-distribution.md)
- [领域模型是工作流的规格载体](domain-driven-shadow-dev.md)
