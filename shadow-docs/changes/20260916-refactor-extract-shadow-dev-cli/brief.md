---
{
  "schema": "shadow-dev/v1",
  "name": "20260916-refactor-extract-shadow-dev-cli",
  "type": "refactor",
  "scope": "shadow-dev-workflow/scripts",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "refactor/20260916-refactor-extract-shadow-dev-cli",
  "files": [
    "README.md",
    "docs/cli-guide.md",
    "package.json",
    "scripts/install-cli.sh",
    "scripts/shadow-dev.mjs",
    "shadow-docs/changes/20260916-refactor-extract-shadow-dev-cli/brief.md",
    "test/cli.test.mjs"
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
    "verifiedCommit": "bac559b9249d35b008c0193615753b9c3705aa55",
    "verifiedAt": "2026-09-16T16:54:01.980Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "41503d055598fb25415abb541359629ce2d1173c0359867a49d92b1446d859d3",
    "updatedAt": null,
    "lastError": null
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "CLI 独立分发、安装方式、版本锁定等新事实均由产品文档承载（README、docs/cli-guide.md 本次已更新），不构成跨项目执行约束；menu 无匹配路由域，无需新增卡片"
  }
}
---

# 将 CLI 拆分为独立仓库 shadow-dev-cli（纯脚手架实现）

## 动机

`scripts/shadow-dev.mjs` 以单文件压缩式承载全部 16 个命令、git 操作与 GitHub API 客户端，职责密度过高，难以独立演进与协作。CLI 本质是确定性的工作流脚手架工具，与插件的知识/norms 内容无耦合，应独立成仓库 `stack-wuh/shadow-dev-cli`：模块化实现、独立版本与发布节奏；插件仓库通过安装脚本拉取 release 目录产物消费，保持零 npm 依赖。

## 引用规范

- `norms/tdd-verification.md`
  - 当前结论: 复杂重构先迁移/编写失败测试再动实现；完成声明必须附验证输出；代码修改先建功能分支，main 只接受 PR 合入
  - 适用 scope: 本变更全部代码任务（测试先行迁移、插件仓库 feature branch）
- `norms/code-style.md`
  - 当前结论: 文件单一职责，耦合度与测试难度决定拆分；不吞异常；不为未来场景提前增加兼容层；渐进式治理不扩大范围
  - 适用 scope: 新仓库模块化拆分原则（该规范适用范围为 x.wuh.site monorepo，此处按通用工程底线参照执行）
- `norms/code-style-packages.md`
  - 当前结论: 消费者只走公开入口；修改共享包必须检查所有消费者影响
  - 适用 scope: CLI 即被插件消费的共享包（按类比适用）；切换后必须验证 skills 调用路径与文档一致

## 决策

- **选型:** 方案 A 一次性切换——新仓库先模块化 + 测试迁移跑通 + 发 release，插件仓库再切换到 install 脚本拉取
- **对比方案:** B 用 subtree split 保留 scripts/ 提交历史（历史中 CLI 与插件改动混合，拆分收益低、复杂度高）；C 插件保留旧单文件双轨过渡（提前兼容层，违反 code-style 禁止事项）
- **理由:** 现有 `test/cli.test.mjs`（516 行）即行为契约，先行迁移并在模块化结构上跑通是「行为不变」的最强证明；命令契约与 bin 名 `shadow-dev` 不变，skills 与消费仓库除安装方式外零感知
- **行为契约:** 全部命令、输出 JSON 结构、错误码、planHash 机制保持不变；仅分发方式与源码组织变化
- **规范遵循说明:** 新仓库为独立项目，`code-style.md` 的 x.wuh.site 包边界条款不直接适用，仅参照其文件职责与错误处理原则；新仓库首次导入直接提交 main（空仓库初始化，无保护对象），插件仓库侧严格执行功能分支 + PR

## 任务

### Phase 1 新仓库模块化（stack-wuh/shadow-dev-cli）
- [x] 初始化仓库骨架——`shadow-dev-cli/package.json` — bin 指向 cli.mjs、engines node>=20、npm test；README（定位：确定性工作流脚手架 CLI）、.gitignore
- [x] 迁移测试作为契约规格——`shadow-dev-cli/test/cli.test.mjs` — 自插件仓库复制 516 行测试，入口路径改为新结构，确认在旧单文件实现上通过（建立基线）
- [x] 模块化拆分基础设施——`shadow-dev-cli/lib/` — args/help/out/fail、canon/hash/plan、brief 存取、git 封装、github-api 客户端各自成模块
- [x] 模块化拆分命令域——`shadow-dev-cli/lib/domains/` — change、issue、branch、sync、review、commit、publish、release、reconcile、archive、index、task、repo/pr/conflict inspect 按域成模块，cli.mjs 仅做路由
- [x] 新结构测试全绿——`shadow-dev-cli/test/cli.test.mjs` — 模块化实现上全部通过且与基线输出一致

### Phase 2 发布产物
- [x] 打包与发布——`shadow-dev-cli/scripts/pack.mjs` — 目录 tarball 产物脚本；tag v1.0.0，GitHub release 附产物；验证：干净目录拉取解包后 `node cli.mjs help` 可运行

### Phase 3 插件仓库切换（feature branch）
- [x] install 脚本 TDD——`test/install-cli.test.mjs` — 先写失败测试：以本地 tarball fixture 跑 `scripts/install-cli.sh`，断言解包位置与 help 冒烟通过；再实现脚本——`scripts/install-cli.sh` — 默认拉 latest release，`SHADOW_CLI_VERSION` 可锁版本，解包到 `scripts/shadow-dev-cli/`，幂等可重复执行
- [x] 切换入口并删除旧实现——`package.json` `scripts/shadow-dev.mjs` `test/cli.test.mjs` — bin 改指 `scripts/shadow-dev-cli/cli.mjs`，删除旧单文件与已迁走的测试，test script 调整
- [x] 文档更新——`README.md` `docs/cli-guide.md` — 分发方式改为 install 脚本拉取，注明新仓库地址与版本锁定方式

## 结果

- 实际耗时: 约半天（含本机环境问题排查）
- 验证: 新仓库 CI 9/9 全绿（ubuntu/macos/windows × node 20/22/24，35 契约测试）；插件仓库 install 脚本测试 2/2；真实安装链路端到端通过（拉取 v1.0.0 + sha256 校验 + 冒烟）；新 CLI 自举管理本 brief 成功
- 迁移中发现并修复原契约测试两个隐性平台 bug：new URL().pathname 的 Windows 路径、addOrigin bare 仓库缺 -b main（sync 测试 refspec 失败）
- 本机 node 多模块 ESM 启动期偶发 SIGSEGV/空转（环境问题，非代码缺陷），最终验证以干净 CI runner 为准

## 知识评估

- **预期影响:** 无需变更
- **候选卡片:** 无
- **理由:** 分发方式与安装步骤属于产品文档（README/cli-guide）承载的事实，不构成跨项目执行约束；若 review 发现消费仓库需记住独立仓库协同约定，再评估新增项目级卡片
