---
{
  "schema": "shadow-dev/v1",
  "name": "20260917-feature-integrate-shadow-dev-cli",
  "type": "feature",
  "scope": "shadow-dev-workflow",
  "status": "reviewed",
  "baseBranch": "refactor/20260916-refactor-extract-shadow-dev-cli",
  "branch": "feature/20260917-feature-integrate-shadow-dev-cli",
  "files": [
    ".claude-plugin/plugin.json",
    "README.md",
    "docs/cli-guide.md",
    "hooks/bootstrap-cli.sh",
    "hooks/hooks.json",
    "package.json",
    "scripts/install-cli.sh",
    "shadow-docs/changes/20260917-feature-integrate-shadow-dev-cli/brief.md",
    "test/install-cli.test.mjs"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 13,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/13",
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "f8ac6cc2ed7e7ab3b46c4e4f873e905c910621ed",
    "verifiedAt": "2026-09-17T16:17:52.025Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "issue:13",
    "planHash": "1aa0a9e45e14141a86e0f904798c4246a41d774014c4c9c35c2630495b4be297",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "插件接入 shadow-dev-cli：SessionStart hook 锁版本自举",
      "body": "Brief: `shadow-docs/changes/20260917-feature-integrate-shadow-dev-cli/brief.md`（分支基线：堆叠于 PR #12）\n\n## 摘要\n\n插件 6 个 skills 以裸 `shadow-dev` 命令为执行前提，但无机制保证命令存在。本变更将 CLI 独立仓库（stack-wuh/shadow-dev-cli v1.1.0）的版本化安装器 vendored 进插件，并以 SessionStart hook 锁版本自举：\n\n- `package.json` 新增 `cliVersion` pin（v1.1.0），hook 调 `install --version <pin> --json` 幂等就位\n- hook 永不阻塞会话：installer 失败仅警告；`SHADOW_CLI_HOOK_DISABLE=1` 可跳过（保护双仓开发）\n- 退役插件内 vendored CLI 副本（scripts/shadow-dev-cli/）与旧安装脚本、bin 字段\n- 文档改为自动安装说明 + 排障（`~/.local/bin` PATH、手动 install/rollback、main 开发通道）\n\n## 任务\n\n1. 同步 CLI 仓库安装器替换插件旧版 `scripts/install-cli.sh`\n2. wrapper 测试先行（fixture `--from` 离线驱动：pin 就位秒退 / 精确装 / DISABLE 跳过 / 失败仅警告）\n3. 实现 `hooks/bootstrap-cli.sh` + `hooks/hooks.json` + `plugin.json` hooks 声明；删除 vendored 副本与 bin\n4. 更新 `README.md`、`docs/cli-guide.md`；端到端验证（首跑装出 shim、二跑秒退、`shadow-dev help --json` ok）\n\n## 决策要点\n\n- 方案对比：B 运行时 curl 拉安装器（信任链/离线/测试皆劣）、C skills 惰性自举（确定性散失）均不采用\n- `.shadow-dev/` 项目配置目录约定另案提案，本变更不实现",
      "labels": [
        "feature"
      ]
    }
  },
  "knowledge": null
}
---

# 插件接入 shadow-dev-cli：SessionStart hook 锁版本自举

## 动机

插件 6 个 skills 的 SKILL.md 全部以裸 `shadow-dev` 命令为执行前提，但当前没有任何机制保证该命令存在：安装靠手动跑插件内旧版 `install-cli.sh`（解包进插件缓存目录，当前 vendored v1.0.0），PATH 上无命令，`docs/cli-guide.md` 的调用方式是手动安装、npm link 或 glob 路径拼接。而 CLI 独立仓库（stack-wuh/shadow-dev-cli v1.1.0）的版本化安装器已发布——版本目录 + CURRENT/PREVIOUS 指针 + `~/.local/bin` 托管 shim + rollback + `--json` 机器输出，README 明确「供 shadow-dev-workflow 插件钩子与手工共用」——插件侧却尚未接上。

接入后：新机器安装插件即自动就位锁版本 CLI，单机单份多项目共享，skills 文档假设首次真正成立；插件与 CLI 的兼容配对从文档散文升级为 manifest 机检。

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 先编写失败测试再动实现；完成声明必须附验证输出；代码修改先建功能分支，main 只接受 PR 合入
  - 适用 scope: wrapper 与安装器全部任务（测试先行、离线 fixture 驱动）
- `norms/code-style.md`
  - 当前结论: 文件单一职责；渐进式治理不扩大范围；不为未来场景提前增加兼容层
  - 适用 scope: 本变更全部代码任务（该规范适用范围为 x.wuh.site monorepo，此处按通用工程底线参照执行）

## 决策

- **选型:** 方案 A——CLI 仓库安装器 vendored 进插件 + SessionStart hook 锁版本自举
- **对比方案:** B hook 运行时 curl 拉安装器（运行时信任链、离线不可自举、测试困难）；C skills 内嵌惰性自举指令（确定性散失到 LLM 执行路径，6 处重复）
- **理由:** 插件的一切设计哲学是确定性，hook 是唯一能保证「skills 文档假设成立」的机制层；安装器副本随插件分发使自举离线确定、可测试（`--from` fixture）；同步义务绑定在发版流程上（升级 CLI = 同步副本 + 改 pin + 插件发版），接缝稳定
- **版本策略:** 插件锁定 CLI 版本——`package.json` 新增 `cliVersion`（首个 pin：v1.1.0），hook 调 `install --version <pin> --json` 幂等就位；兼容配对由 manifest 机检而非文档
- **失败语义:** hook 永不阻塞会话——installer 失败仅 stderr 警告且 exit 0，skills 未就位时得到明确的 command not found 与文档指引
- **开发通道:** `SHADOW_CLI_HOOK_DISABLE=1` 跳过 hook；双仓开发用安装器手动 `--channel main` / `--from`，hook 不会把本机开发安装拉回 release pin
- **base 分支:** 堆叠于 PR #12 分支（本变更依赖其引入的 `scripts/install-cli.sh` 与 vendored 结构）；#12 合入 main 后 GitHub 自动重定向新 PR
- **另案记录:** `.shadow-dev/` 项目配置目录约定（config.json 收拢项目级配置；`shadow-docs/` 作为人读工作产物保持可见不动）独立提案，本变更不实现
- **规范遵循说明:** 单轨接入不加双轨 fallback（用户已确认）；退役 vendored 副本即删除，不留兼容层

## 任务

### Phase 1 安装器替换与自举 hook
- [x] 同步 CLI 仓库安装器——`scripts/install-cli.sh` — 用 stack-wuh/shadow-dev-cli v1.1.0 的 `scripts/install-cli.sh` 整体替换插件内旧版（版本化布局 + CURRENT/PREVIOUS 指针 + 托管 shim + `--json`）
- [x] 自举 wrapper 测试先行——`test/install-cli.test.mjs` — 先写失败测试：fixture tarball 经 `--from` 离线驱动 wrapper，断言 pin 缺失时精确装 pin 版本、pin 已就位时零输出秒退（exit 0）、`SHADOW_CLI_HOOK_DISABLE=1` 跳过、installer 失败时仅警告且 exit 0；沿用旧测试的临时目录隔离思路
- [x] 实现 wrapper 与 hook 声明——`hooks/bootstrap-cli.sh` `hooks/hooks.json` `.claude-plugin/plugin.json` — wrapper 读 `package.json` 的 `cliVersion` 调安装器；hooks.json 注册 SessionStart；plugin.json 声明 hooks（宿主 hook 变量与执行语义以 ZCode 插件文档为准，apply 时验证）
- [x] 退役 vendored 副本——`package.json` `scripts/shadow-dev-cli/` — 删除 bin 字段与 vendored CLI 目录，test script 指向重写后的测试

### Phase 2 文档与端到端验证
- [x] 文档更新——`README.md` `docs/cli-guide.md` — 安装章节改为 SessionStart 自动安装 + pin 说明；排障：PATH 需含 `~/.local/bin`、手动 `install`/`rollback`、`SHADOW_CLI_HOOK_DISABLE`、`--channel main` 开发通道；注明 `.shadow-dev/` 约定另案
- [x] 端到端验证——`test/install-cli.test.mjs` — 测试全绿；本机真实链路冒烟：hook 脚本首跑装出 v1.1.0 且 shim 可用、二跑零输出秒退，`shadow-dev help --json` 返回 ok

## 结果

- 实际耗时: 约 2 小时（propose→apply 连续会话，含 1 次环境抖动排查）
- 验证: TDD 红灯先行（6/7 失败确认）后 7/7 全绿（wrapper 契约 5 + 安装器 --from fixture 1 + 装配静态契约 1）；本机真实链路冒烟——hook 首跑 5.7s 触网装出 `~/.local/share/shadow-dev-cli-1.1.0/` + `~/.local/bin/shadow-dev` 托管 shim，二跑 0.166s 秒退，`shadow-dev help --json` 返回 ok，`~/.local/bin` 确认在 PATH
- 偏差记录 1（安装器来源）: v1.1.0 tag 不含 install-cli.sh（该安装器发布于 v1.1.0 之后、尚未随任何 release 发布），实际 vendored 自 CLI 仓库 HEAD 43e37ba（38b1364 + bugfix 07ee09d，上游 test/install.test.mjs 覆盖）；pin 仍为 v1.1.0 release（`help --json` 自校验兼容）。CLI 下次发版时在 pin bump 中同步对齐安装器副本
- 偏差记录 2（测试 seam）: `--version` 安装路径必须触网，无法离线端到端；wrapper 契约经 `SHADOW_CLI_INSTALLER` stub 驱动，installer 本体由 `--from` fixture 离线覆盖
- 偏差记录 3（文件清单）: 改动文件超出声明清单 1 项——`.gitignore` 中已死的 vendored 缓存规则清理，属 vendored 退役的直接相关残留
- 环境备注: 本机 node 偶发启动抖动致 1 次测试假警报（重跑全绿），最终以 CI 干净 runner 为准（同上一变更结论）

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 接入机制与安装排障由插件自身产品文档承载（README/cli-guide 本次更新），与上一个 CLI 拆分变更同理，不构成跨项目执行约束；menu 无匹配路由域
