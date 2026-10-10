---
title: 发布链版本权威与产物资产契约
domain: distribution
keywords: [发布, release, tag, 版本权威, 资产名, tarball, pack, 上传, 发布冒烟, quality-gate, publish-release, CI, strict, 半绿, GITHUB_PATH, PATH, shim]
scope: [scripts/pack.mjs, scripts/bump-version.mjs, scripts/check-requires.mjs, scripts/check-knowledge.mjs, .github/workflows/]
status: active
source:
  - changes/20261010-build-quality-gate/brief.md
  - changes/20261010-feature-workflow-context-map/brief.md
verified: 2026-10-10
verified-depth: unit
verified-scope: 本机 `npm run ci` 全绿（版本同源 + requires:strict + 知识治理门 + 既有 11 例测试）；strict 反例用 `SHADOW_DEV_CLI` 指向坏文件复现 rc=1，非 strict 同条件复现半绿（rc=0 且输出「CLI 目录未参与断言」）；版本反例单改一份 manifest 复现 rc=1 后回滚；三个 workflow 经 YAML 解析。GitHub 矩阵真跑与发布冒烟待首个 PR / 首个 release 的 run 链接。新增的 `$GITHUB_PATH` 同步内不可见一条：失败侧已由 PR #44 的 `quality-gate` windows 两项 `exit 127` 实证（同 run ubuntu/macos 绿），修复生效待本 PR 转绿后的 run 链接回填。
---

# 发布链版本权威与产物资产契约

## 当前结论

GitHub Release 是产物与版本的**唯一权威发布点**，四件事缺一不可：

1. **版本权威＝release tag**：tag 名去 `v` 后必须与 `package.json.version` 及两份宿主清单 version 同源，不一致即发布失败。一致性由「先 bump 再打 tag」保证，**不由 CI 事后回写修正**——回写会让产物与 tag 指向的 tree 分裂，等于把权威降级成补丁。
2. **资产契约**：release 资产名必须匹配消费侧硬正则 `^shadow-dev-workflow-v[0-9][0-9.]*\.tar\.gz$`（CLI `workflow plan --release/--release latest` 靠它找资产）。名字写错等于没发布——`RELEASE_NOT_FOUND`。
3. **发布冒烟**：上传后立即在隔离 prefix 用真实 CLI 走 `workflow plan --release` → `workflow execute` → `bind plan`，断言物化内容（8 个 `SKILL.md`、规范文件在位）。不冒烟就无法区分「可消费的产物」与「一个没人能装的文件」。
4. **门禁止半绿**：被依赖资源解析不到时必须判红。非交互环境（CI、管道）里 CLI 的 human 帮助层会与 JSON **同流写 stdout**，所以命令目录必须取最后一个 `{"ok"` 契约行并带超时，否则门会假红或假绿。

## 执行约束

- 发版顺序恒为：`node scripts/bump-version.mjs <ver>` → `npm run check:version` → 提交合并 → `git tag v<ver>` → `gh release create`；此后判定、pack、资产断言、上传、冒烟由 `publish-release.yml` 接手。
- 新增机器门一律以 strict 形态进 CI；宽松模式只允许作为本机开发路径，且必须自曝降级态（如 `catalog=unresolved`）。
- `quality-gate.yml` 覆盖 push main 与所有 PR，矩阵含 windows——`tar`/`bash` 的跨平台坑已被实证，只跑 ubuntu 等于把最难发现的回归留在暗处。AI 的本机口头自证不可替代机器门。
- 同一 `run:` 块里**不得依赖 `$GITHUB_PATH` 取刚装的 shim**：`echo ... >> "$GITHUB_PATH"` 只对**后续步骤**生效，紧跟着的冒烟命令仍用旧 PATH。`ubuntu`/`macos` runner 镜像默认 PATH 含 `~/.local/bin` 会蒙过，`windows` 的 Git Bash 不含即 `command not found` 退 127——同一步必须自己 `export PATH="$HOME/.local/bin:$PATH"`（实证：PR #44 的 `quality-gate` windows 两项挂在此处，ubuntu/macos 同 run 全绿）。
- 归档会搬迁 brief：卡片 `source` 按规范写 `changes/<name>/brief.md`，治理门必须向 `changes/archive/<name>/` 兜底解析（否则每张卡在来源 change 归档那天集体判红——本仓实测 3 张跨项目卡中 2 张如此）。

## 适用边界

适用于「内容/规范包 + 独立执行层 CLI」的双仓分发。纯库发布（npm registry、镜像）不适用资产名正则，但**版本权威与发布冒烟同样成立**。

## 验证方式

1. `npm run ci` 本机与 CI 均全绿（含 strict 与知识治理门）。
2. strict 反例：`SHADOW_DEV_CLI=/path/to/broken.mjs npm run check:requires:strict` → rc=1；去掉 `:strict` 同条件 → rc=0 且输出「CLI 目录未参与断言」（半绿证据）。
3. 版本反例：单独改任一份 manifest 的版本 → `npm run check:version` rc=1 并提示修正命令。
4. 发布后：`publish-release` run 的冒烟步骤须输出 `OK materialized root=... skills=8`。

## 关联知识

- [分发依赖单向与产物能力契约](distribution-capability-contract.md)
- [插件多宿主分发与清单契约](multi-host-plugin-distribution.md)
- [领域模型是工作流的规格载体](domain-driven-shadow-dev.md)
