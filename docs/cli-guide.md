# shadow-dev CLI 使用指南

`shadow-dev` 是 shadow-dev-workflow 的确定性执行层：brief、INDEX、Git 和 GitHub 的全部写操作都由它完成，技能（skills）只负责编排与判断，不直接执行写命令。CLI 独立分发于 [stack-wuh/shadow-dev-cli](https://github.com/stack-wuh/shadow-dev-cli)，版本以插件 `package.json` 的 `cliVersion` pin 为唯一真相（本文档不重复硬编码当前值），本文档是完整命令参考。安装到使用的一站式引导（自举、升级/回滚、离线、LINK 双轨、Windows 告警排障、输出模型）见技能 `skills/shadow-dev-setup/SKILL.md`。

## 安装（SessionStart 自动自举）

插件通过 SessionStart hook 自动确保锁版本 CLI 就位，无需手动初始化：

- **布局**：`~/.local/share/shadow-dev-cli/shadow-dev-cli-<ver>/`（版本化目录，`CURRENT`/`PREVIOUS` 指针文件）+ 托管 shim `~/.local/bin/shadow-dev`（运行时读 `CURRENT`，更新与回滚不动 shim 文件）。
- **幂等**：已就位时 hook 秒退，不触安装器、不触网；pin 变更或指针漂移时才精确安装 pin 版本。
- **失败语义**：hook 恒不阻塞会话——离线等失败仅 stderr 警告，此时 skills 中 `shadow-dev` 命令不可用。

手动管理（vendored 安装器 `scripts/install-cli.sh` 随插件分发，供 hook 与人工共用）：

```bash
bash scripts/install-cli.sh install                       # 装锁版本（同 hook 行为）
bash scripts/install-cli.sh install --version <pin>       # 显式锁版本（= package.json cliVersion）
bash scripts/install-cli.sh rollback                      # 切回上一版（离线，不动 shim）
bash scripts/install-cli.sh status                        # 查看 CURRENT/PREVIOUS
bash scripts/install-cli.sh install --from dist/shadow-dev-cli-v<pin>.tar.gz  # 离线安装
```

排障：

| 症状 | 处置 |
|------|------|
| `shadow-dev: command not found` | 把 `~/.local/bin` 加入 PATH：`export PATH="$HOME/.local/bin:$PATH"` |
| hook 日志出现「未能就位」 | 网络受限；在线后重开会话，或手动跑上面 install 命令 |
| 双仓开发（跑未发布 CLI） | `export SHADOW_CLI_HOOK_DISABLE=1`，再用 `install --channel main` 或 `--from` 手动安装；hook 不会把开发安装拉回 pin |
| 怀疑版本异常 | `bash scripts/install-cli.sh status` 后用 `rollback` 回退 |

## 输出协议

所有命令输出单行 JSON：

```json
{"ok":true,"command":"branch.execute","data":{"branch":"feat/sample"}}
{"ok":false,"error":{"code":"PLAN_HASH_REQUIRED","message":"PLAN_HASH_REQUIRED"}}
```

退出码：

| 退出码 | 含义 | 典型错误码 |
|--------|------|-----------|
| 0 | 成功 | — |
| 1 | 输入或校验错误 | `PLAN_HASH_INVALID`、`BRIEF_NOT_FOUND`、`NAME_REQUIRED`、`COMMIT_INPUT_REQUIRED`、`TASKS_NOT_COMPLETE`、`REVIEW_NOT_PASSED`、`PR_NOT_MERGED`、`SYNC_NOT_FAST_FORWARD` |
| 2 | 缺少确认 | `CONFIRMATION_REQUIRED`、`PLAN_HASH_REQUIRED` |
| 3 | 外部错误（网络/GitHub） | `GITHUB_TOKEN_REQUIRED`、`GITHUB_API_ERROR`、`API_TIMEOUT`、`GIT_PUSH_FAILED`、`PR_CREATE_FAILED` |
| 4 | 不支持的操作 | `UNSUPPORTED_OPERATION`（如 `git add .`、`--all`、路径越界） |

## plan/execute 协议

所有变异（写）操作分两步：`plan` 生成快照和哈希，`execute` 校验后落地。

6.2.0 起，`plan` 会把 `planHash` 自动写入 brief 的 `workflow.planHash`，`execute` 自行从 brief 读取校验——**调用方不再需要读取、搬运或回传哈希**。显式传入 `--plan-hash` 仍然支持，作为附加校验。

- plan 后任何相关状态变化（brief、文件、HEAD）都会使哈希失效，execute 返回 `PLAN_HASH_INVALID`，此时重新 plan 即可。
- 尚未执行过 plan 就 execute 返回 `PLAN_HASH_REQUIRED`（退出码 2）。
- `release` 域更进一步：plan 还会把执行参数（files/message/title/body）持久化到 brief 的 `workflow.release`，execute 只需 `--name --confirm`。

所有写操作都需要 `--confirm`，缺省返回 `CONFIRMATION_REQUIRED`。

## 命令参考

### 仓库与检查（只读）

| 命令 | 说明 |
|------|------|
| `repo inspect` | 当前仓库状态：root、branch、head、clean、changedFiles |
| `pr inspect --name <n>` | 读取 brief 记录的 PR（GET /pulls/{n}） |
| `conflict inspect --name <n>` | 报告与该 change 文件列表重叠的其他活动 change |
| `task list --name <n>` | 列出 brief 正文的 checkbox 任务（task-1、task-2…） |

### Change 管理

| 命令 | 说明 |
|------|------|
| `change create --name <n> --type <feat\|fix\|…> --scope <s> --files <逗号分隔> --base-branch <branch> --body-file <文件> --repository <owner/repo> --confirm` | 创建 brief 脚手架（status=draft），`--body-file` 导入正文（缺省用骨架），重复创建报 `CHANGE_EXISTS` |
| `change approve --name <n> --confirm` | draft → proposed |

### Issue / 分支 / 同步（apply 阶段）

| 命令 | 说明 |
|------|------|
| `issue plan --name <n> --title <t> --body <b> --labels <逗号分隔>` | 预览 issue 载荷；标题、正文、labels 与 planHash 持久化到 brief |
| `issue execute --name <n> --confirm` | 创建 GitHub issue（参数从 brief 恢复，无需重复传入），`github.repository` 自动从 `origin` remote 推导并写回 brief |
| `branch plan --name <n>` | 预览分支名 `{type}/{name}` |
| `branch execute --name <n> --confirm` | 创建并切换分支，写回 `brief.branch` |
| `sync plan --name <n>` | fetch origin 并检查可快进；非 shadow-docs 脏文件报 `DIRTY_WORKTREE` |
| `sync execute --name <n> --confirm` | `git merge --ff-only` 快进到上游 |

### 任务与审查（review 阶段）

| 命令 | 说明 |
|------|------|
| `task set --name <n> --task task-1 --state done --confirm` | 勾选任务；draft 状态自动转 implementing |
| `review plan --name <n>` | 返回 verifiedCommit 与 brief 上下文 |
| `review execute --name <n> --conclusion <passed\|blocked> --knowledge <新增\|更新\|废弃\|无需变更> --target <卡片路径> --reason <理由> --confirm` | 机械门禁：存在未完成任务时拒绝并返回 `TASKS_NOT_COMPLETE`；通过后写入 review 结论与知识结论 |

`--knowledge` 把七维检查第 7 项的最终结论写入 brief 的 `knowledge` 字段，`release` 直接消费，不再重复评估。结论为"无需变更"时 `--target` 可省略。

### 提交与发布（release 阶段）

| 命令 | 说明 |
|------|------|
| `commit plan --name <n> --files <逗号分隔> --message <m>` | 预览提交 |
| `commit execute --name <n> --files <f> --message <m> --confirm` | 精确 `git add -- <files>` + commit；拒绝 `.`、`-A`、越界路径（退出码 4） |
| `publish plan --name <n> --title <t> --body <b>` | 预览 push + PR 载荷 |
| `publish execute --name <n> --title <t> --body <b> --confirm` | push 后查询/创建 PR；已存在的 open PR 会被复用 |
| `release plan --name <n> --files <f> --message <m> --title <t>` | 一次返回 commit + PR 的完整计划；planHash 与执行参数写入 brief |
| `release execute --name <n> --confirm` | 一次完成 commit → push → PR；幂等，可断点续跑 |

**release 断点续跑语义**：

- `GIT_PUSH_FAILED` / `PR_CREATE_FAILED` / `API_TIMEOUT`：修复网络或凭证后，重新 `release plan` 再 `release execute`。已完成的 commit 自动跳过，已有 open PR 自动复用。
- PR 查询使用 `owner:branch` 规范格式，重跑不会产生重复 PR。

### 状态与归档

| 命令 | 说明 |
|------|------|
| `reconcile plan --name <n>` / `reconcile execute --name <n> --confirm` | 状态推导：任务全部完成 → implemented；HEAD 与 verifiedCommit 不一致 → review 重置为 pending |
| `archive plan --name <n>` / `archive execute --name <n> --confirm` | 校验 review passed 且 GitHub API 证明 PR merged 后，brief 移入 `shadow-docs/changes/archive/` 并重建 INDEX |
| `index rebuild plan` / `index rebuild execute --plan-hash <hash> --confirm` | 重建 `shadow-docs/INDEX.md`（无 brief 上下文，仍需显式传哈希） |

## 典型工作流

从需求到归档的完整命令序列：

```bash
# propose：建 change、开 issue
shadow-dev change create --name 20260906-feat-export --type feat --scope cli \
  --files src/export.ts --body-file brief-body.md --confirm
shadow-dev change approve --name 20260906-feat-export --confirm
shadow-dev issue plan --name 20260906-feat-export --title "导出功能" --body "详见 brief" --labels feat
shadow-dev issue execute --name 20260906-feat-export --confirm

# apply：建分支、执行任务
shadow-dev branch plan --name 20260906-feat-export
shadow-dev branch execute --name 20260906-feat-export --confirm
shadow-dev task set --name 20260906-feat-export --task task-1 --state done --confirm
shadow-dev sync plan --name 20260906-feat-export
shadow-dev sync execute --name 20260906-feat-export --confirm

# review：门禁 + 知识结论
shadow-dev review plan --name 20260906-feat-export
shadow-dev review execute --name 20260906-feat-export \
  --conclusion passed --knowledge 无需变更 --reason "未产生长期有效事实" --confirm

# release：计划 → 确认 → 一键发布
shadow-dev release plan --name 20260906-feat-export \
  --files src/export.ts,shadow-docs/changes/20260906-feat-export/brief.md \
  --message "feat(cli): 导出功能" --title "feat: 导出功能"
# （向用户确认后）
shadow-dev release execute --name 20260906-feat-export --confirm

# archive：PR merged 后
shadow-dev archive plan --name 20260906-feat-export
shadow-dev archive execute --name 20260906-feat-export --confirm
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `GITHUB_TOKEN` / `GH_TOKEN` | 必填（GitHub 操作） | GitHub API 令牌 |
| `SHADOW_GITHUB_API_URL` | `https://api.github.com` | API 基址，测试与代理用 |
| `SHADOW_API_TIMEOUT_MS` | `15000` | GitHub API 超时（毫秒） |

## 硬性约束

- 禁止绕过 CLI 执行原始 Git/GitHub 写命令、`git add .`、`git add -A` 和 `--no-verify`。
- commit 只接受明确文件列表；路径越界（`../`、绝对路径）返回退出码 4。
- 网络步骤失败立即停止并报告错误码，不换方式重试；修复后按断点续跑语义重新 plan + execute。
- archive 仅在 GitHub API 证明 PR merged 后执行。

## 本地开发

CLI 的实现与契约测试在 [shadow-dev-cli](https://github.com/stack-wuh/shadow-dev-cli) 仓库（含安装器测试 install.test.mjs）。本仓库保留 hook 自举与 vendored 安装器的契约测试：

```bash
npm test                       # wrapper 契约 + 安装器 --from fixture 测试（无网络依赖）
bash scripts/install-cli.sh install   # 从 release 真实安装（同 hook）
```

`.shadow-dev/` 项目配置目录约定为另案提案，当前未实现；项目级事实仍以 `shadow-docs/` 为准。
