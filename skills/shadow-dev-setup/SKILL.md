---
name: shadow-dev-setup
description: 引导 shadow-dev CLI 从安装到日常使用。触发场景：命令不存在/command not found、bootstrap hook、如何验证安装与版本、升级/回滚/status、离线安装 --from、LINK 双轨开发、Windows 下 'm' 不是内部或外部命令告警、交互终端为何看不到 JSON、SHADOW_DEV_* 环境变量、跑第一个变更流程。触发词：安装、上手、升级、回滚、排障、双轨、环境变量、bootstrap。
---
# Shadow Dev Setup — shadow-dev CLI 从安装到使用

## 先读：三条真相源规则

1. **CLI 源码在上游仓** [stack-wuh/shadow-dev-cli](https://github.com/stack-wuh/shadow-dev-cli)；本插件 `scripts/install-cli.sh` 是 **vendored 旧副本**（hook 实际执行它），功能落后 CLI 仓（如尚无 link 双轨）。
2. **锁定版本唯一真相 = 插件 `package.json` 的 `cliVersion`**（当前 `v1.3.0`）。README/docs 里的硬编码版本号可能滞后，冲突以 pin 为准。
3. `shadow-dev` 命令来自 `~/.local/bin` 的**托管 shim**（头标 `managed-by: shadow-dev-cli-installer`），由 SessionStart hook（`hooks/bootstrap-cli.sh`）自动自举：指针与 pin 一致→秒退不触网；不一致→`install --version <pin> --json`。hook 恒不阻塞会话，失败只在 stderr 警告。

完整命令参考在 `docs/cli-guide.md`，本技能只做路由、版本真相与排障，不重复手册。

## 快速排障表

| 症状 | 原因 → 处置 |
|------|------------|
| `shadow-dev: command not found` | `~/.local/bin` 不在 PATH：`export PATH="$HOME/.local/bin:$PATH"` |
| 启动告警「未能就位（可能离线）」 | 到 github.com 的下载被墙/断：在线后重开会话，或见下方离线安装 |
| CMD 里 `'m' 不是内部或外部命令，也不是可运行的程序` | 旧安装器把 `.cmd` shim 写成 LF 行尾+非 ASCII 注释，cmd.exe 跨行吞读把 rem 注释切碎成伪命令。功能不受影响（node 行仍执行）。修复见下文「Windows 告警」 |
| 交互终端看不到 JSON 输出 | 设计如此：TTY 默认只走 stderr 人用层，要 JSON 加 `--json` |
| `PLAN_HASH_INVALID` | plan→execute 之间输入变了：重跑同命令的 plan 再 execute |

## 验证安装

```bash
shadow-dev version        # v1.3.0 起提供；输出 {"command":"version","data":{"version":...}}
bash scripts/install-cli.sh status --json   # {"current","previous","linked"}
shadow-dev repo inspect   # 在 git 仓库里冒烟（管道下自动回 JSON）
```

## 升级 / 回滚

- **正常路径**：升级插件即可——CLI 仓发新版 → 插件升 `cliVersion` pin + 同步 vendored 安装器 → 下次会话 hook 自动就位。
- 手动：`install`（最新 release）· `install --version vX.Y.Z`（精确锁版）· `--force`（幂等秒退时强制重装）· `rollback`（离线交换 CURRENT/PREVIOUS，**不动 shim、不重装**）· `status`。安装器子命令是直接操作，plan/execute 二段式只属于 `shadow-dev` CLI 本体。
- **rollback 只能回到 PREVIOUS 槽那个版本**——先 `status --json` 确认 `previous` 是要的目标；不在槽里的版本用 `install --version vX.Y.Z`（在线）或 `--from <对应版本的本地产物>`（离线，tarball 自带版本号）。
- **回滚后想长期驻留旧版**：`export SHADOW_CLI_HOOK_DISABLE=1`。否则下次 SessionStart hook 发现指针 ≠ pin，会尝试拉回 pin 版本（离线时该尝试静默失败、不阻塞会话，但也回不到驻留态）。
- `shadow-dev version` 仅 v1.3.0+ 提供；回滚到更老版本后改用 `bash scripts/install-cli.sh status --json` 看版本。

## 离线与受限网络

- `bash scripts/install-cli.sh install --from <tarball|dir>`——从内网拷贝/镜像产物离线安装（同走物化+自校验）。
- 完全不触网的用法：装好后的本地命令（change/task/review/commit/index…）零网络；仅 issue/publish/release/archive 需要 token 与 API（`SHADOW_GITHUB_API_URL` 可指内网代理）。`rollback`/`status` 本身离线。
- 不想装 shim：克隆 CLI 仓后直接 `node cli.mjs …`。

## 双仓开发：LINK 双轨与 hook 抑制

在 CLI 仓（而非插件 vendored 版）用其自带的安装器：

```bash
bash scripts/install-cli.sh link D:/works/shadow-dev-cli   # shim 最高优先映射到仓库目录，代码即改即生效
bash scripts/install-cli.sh unlink                          # 回 release 轨（CURRENT）
```

同时导出 `SHADOW_CLI_HOOK_DISABLE=1`，否则 hook 会把开发安装拉回 pin 版本。

## Windows：'m' 告警的根治与临时止血

根因是 `.cmd` 必须 **CRLF + 纯 ASCII**。CLI 仓已修（`printf '…\r\n'` 生成，含 win32 契约测试），但**若装的版本/vendored 安装器尚未含该修复，hook 自举仍会写出 LF shim**。

- 止血：把 `~/.local/bin/shadow-dev.cmd` 转成 CRLF（如 `sed -i 's/$/\r/'`）且 rem 行去非 ASCII。
- 根治：用含修复的安装器重新生成 shim（CLI 仓里 `install --force` 或 `link`）；插件侧随下一次 pin 升级同步 vendored 安装器后自动痊愈。

## 输出模型与环境变量

- stdout=单行 JSON 机器契约（管道/重定向恒输出）；stderr=人用层（横幅/耗时/planHash 兜底/错误解释），TTY 默认只见它。
- `--json` 或 `SHADOW_DEV_JSON=1` 任意环境强开 JSON；`SHADOW_DEV_QUIET=1` 关人用层；`--lang zh|en` > `SHADOW_DEV_LANG` > locale 探测（只影响 stderr 文案，错误 code 与 nextStep 永不本地化）。
- 退出码：`0` 成功 · `1` 校验/输入 · `2` 缺 `--confirm`/`--plan-hash` · `3` 外部系统 · `4` 不支持的操作形态。

## 跑第一个变更

阶段技能链（每步细节看对应技能）：`shadow-dev-propose`（change create/approve + issue plan→execute）→ `shadow-dev-apply`（branch → task set）→ `shadow-dev-review` → `shadow-dev-release`（commit/publish 或 release 复合）→ PR merged 后 `shadow-dev-archive`。铁律：一切 GitHub/Git 写操作走 CLI plan→确认→execute，禁止原始 `gh`/`git add .`。
