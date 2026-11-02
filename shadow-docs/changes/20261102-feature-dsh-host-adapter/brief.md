---
{
  "schema": "shadow-dev/v1",
  "name": "20261102-feature-dsh-host-adapter",
  "type": "feature",
  "scope": "adapters/, README.md",
  "status": "committed",
  "baseBranch": "main",
  "branch": "feature/20261102-feature-dsh-host-adapter",
  "files": [
    "README.md",
    "adapters/dsh.json"
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
    "verifiedCommit": "174d1d341dffb26d47da8e92db0dcc82490fd955",
    "verifiedAt": "2026-11-02T02:37:33.229Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "5cd730f84a5686e9be61483da3b30b1cb2fbb012",
    "planHash": "76c28890017f115f2957917428d1f7abfedc2a0eaf7a37c819d5c569a759830e",
    "updatedAt": null,
    "lastError": null,
    "commit": {
      "files": [
        "README.md",
        "adapters/dsh.json",
        "knowledge/multi-host-plugin-distribution.md",
        "shadow-docs/changes/20261102-feature-dsh-host-adapter/brief.md"
      ],
      "message": "feat(adapter): 新增 DSH 宿主描述符\n\n- adapters/dsh.json: tier native, skillsDir ~/.dsh/skills, hooks 不支持（DSH 无等价 SessionStart 契约）\n- README: 补 DSH 宿主安装与手动 CLI 自举说明\n- knowledge/multi-host-plugin-distribution: 宿主清单增至 4，补纯技能发现型宿主约束"
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "knowledge/multi-host-plugin-distribution.md",
    "reason": "宿主清单从 3 增至 4：新增 DSH 描述符与其实测发现根 ~/.dsh/skills（rank 400 user-dsh）、无等价 SessionStart hook 契约的事实，属该卡「新增宿主 = 新增描述符」结论的直接增量"
  }
}
---

# 新增 DSH（DeepSeek AgentKit）宿主描述符

## 动机

本仓当前以 `adapters/<host>.json` 描述符声明宿主差异，已覆盖 Claude Code、Codex、zcode 三宿主。用户日常主力宿主为 DSH（DeepSeek AgentKit），其技能发现由 `@deepseek-ai/dsh-skill-filesystem` 提供，扫描 `~/.dsh/skills`（rank 400，`user-dsh`），原生解析 `SKILL.md` 的 `name`/`description` frontmatter。

实测：把 12 个技能目录放入 `~/.dsh/skills` 后，DSH 会话技能目录正确列出全部条目，frontmatter 全部解析成功。缺的只是 `adapters/dsh.json` —— 没有它，`shadow-dev bind plan --host auto` 不会把 DSH 当目标宿主，`--host dsh` 直接报 `HOST_NOT_FOUND`，用户只能手工 `cp -r`，脱离 CLI 管理（无 sidecar 标记、无法 `bind unbind` 回收）。

## 复杂度评级

- **评级:** S
- **理由:** 契约变更仅新增一个描述符文件（不改既有描述符语义，`bind.mjs` 与 `pack.mjs` 均零改动）；触及面为 `adapters/` 新增一项 + README 宿主说明一行；可发现性高——`bind plan --host dsh` 与 `bind status` 直接可验，无静默失败空间。
- **期望验证深度:** runtime（`bind plan --host dsh` 实跑 + `pack` 产物含新描述符 + `npm run ci` 六门）
- **取证策略:** observation（S 级非必填，记录以便复现）

## 领域模型

- **限界上下文:** 宿主适配与分发 — 本仓对外声明「哪些宿主可被 bind 轨消费」的唯一位置是 `adapters/` 描述符集；上游是产物物化（`workflow plan/execute`），下游是 CLI `bind` 域与 release 打包集。反腐边界：描述符只声明路径与策略，**不承载**任何宿主运行时逻辑（hook 装配、插件安装）。
- **统一语言增量:** `dsh` — DSH（DeepSeek AgentKit）宿主的描述符 host 名，与 `claude-code` / `codex` / `zcode` 并列；其技能根固定为 `~/.dsh/skills`。
- **聚合与不变量:**
  - `INV-1 adapter 描述符集`：每个描述符 `schema` 为 `shadow-dev-adapter/v1`，且 `host` 字段值在集内唯一；新增描述符不得改写既有描述符的字段语义（`rules/iron-laws.md` §4 语义、`knowledge/multi-host-plugin-distribution.md`「禁止改写既有宿主清单的语义」）。
  - `INV-2 bind 目标解析`：`skillsDir` 为 `~` 前缀时解析到宿主 home（`bind.mjs` `skillsDirOf`），DSH 时必须解析为 `~/.dsh/skills`；目录不存在时 `--host auto` 不选中、显式 `--host dsh` 仍可 plan 并如实报 `exists:false`。
  - `INV-3 打包分发集`：release 产物包含 `adapters/dsh.json`（`pack.mjs` 的 `DIRS` 已含 `adapters`，本变更不得修改该集合）。
- **领域事件:** `bind plan` 选中 DSH 宿主 → 用户 `bind execute` → `~/.dsh/skills` 落 sidecar 标记，此后 12 个技能由 CLI 托管，可 `bind unbind --host dsh` 幂等回收。

## 引用规范

- `knowledge/multi-host-plugin-distribution.md`
  - 当前结论: 新增宿主 = 新增 `adapters/<host>.json` 描述符；新增宿主清单目录必须同步进 `scripts/pack.mjs` 的 `DIRS`；禁止改写既有宿主清单语义
  - 适用 scope: `adapters/`、`scripts/pack.mjs`
- `knowledge/distribution-capability-contract.md`
  - 当前结论: 宿主差异只进描述符（`adapters/<host>.json`）；内容层遇能力缺失只能阻塞不能降级
  - 适用 scope: `adapters/`、skills 正文命令引用
- `rules/iron-laws.md` §4
  - 当前结论: 不在 main 直接提交，先建功能分支
  - 适用 scope: 全局

## 决策

- **选型:** 只新增 `adapters/dsh.json`（`tier: native`），并在 README 宿主说明处补一行 DSH。`hooks.supported: false` —— DSH 技能发现走 `dsh-skill-filesystem` 插件，无与 Claude Code/Codex 等价的 SessionStart hook 契约；要自动执行 `hooks/bootstrap.mjs` 需另写 Cordis 插件，属独立变更，本次不纳入。CLI 自举在 DSH 上走手动 `bash scripts/install-cli.sh install`，能力不降级。
- **对比方案:**
  - 方案 B（`hooks.mode: manual` + `supported: true`）：用户明确裁定「先不处理」，且 DSH 侧确无自动装配路径，声明 `supported: true` 会让下游误判开箱即用。
  - 方案 C（写 Cordis 插件桥接 hooks）：超出本变更边界，且引入宿主运行时依赖，与「描述符不承载宿主运行时逻辑」的反腐边界冲突。
- **理由:** 最小改动即可让 DSH 进入 CLI 管理的 bind 轨，与既有三宿主结构同构；不触碰 `bind.mjs`、`pack.mjs`、既有描述符，回归面最小。

## 任务

### Phase 1
- [x] task 1 — `adapters/dsh.json` — 新增 DSH 宿主描述符（schema v1、host `dsh`、tier `native`、skillsDir `~/.dsh/skills`、bind copy + marker、hooks `supported:false`、plugin `optional:false`）
- [x] task 2 — `README.md` — 宿主说明处补 DSH 一行（含 `~/.dsh/skills` 与手动 CLI 自举说明）
- [x] task 3 — 验证 — `bind plan --host dsh` 实跑、`npm run ci` 六门、pack 产物含新描述符

## 结果

- 实际耗时: ~25min
- 验证: S 级 observation 取证，三条不变量均有观察点：

  | 不变量 | 观察点：命令 → 输出摘要 |
  |--------|--------------------------|
  | INV-1 | `node -e` 扫 `adapters/*.json` → `hosts: claude-code, codex, dsh, zcode`，schema 全为 `shadow-dev-adapter/v1`，host 无重复 → PASS |
  | INV-2 | `shadow-dev bind plan --host dsh --prefix <隔离产物>` → `host:dsh tier:native skillsDir:C:\Users\596540\.dsh\skills`，12 个技能全部识别，`blocked:true`（非托管同名目录拒绝覆盖的预期行为） |
  | INV-3 | `shadow-dev workflow plan --from <工作树> --prefix <临时隔离前缀>` + `execute` → 产物内 `adapters/dsh.json` 存在 |

  六门：`check:version` ✓ 三处同源 7.2.1；`check:requires:strict` ✓ `undeclared=[] missing-in-cli=[]`；`check:brief` ✓ fail=0；`check:smoke` ✓ fail=0（离线腿本机 deferred，已登记 execution-layer 缺陷）；`npm test` ✓ 35 pass / 0 fail；`check:knowledge` 摘要 `ok=11 warn=16 fail=2`——2 条 fail 为 `shadow-dev-video` 的 `scripts/shots.mjs` 死链，改动前基线即为同一 2 条，本变更零新增。
  隔离前缀验证后已删除，无残留。

## 知识评估

- **预期影响:** 更新
- **候选卡片:** `knowledge/multi-host-plugin-distribution.md`（宿主清单从 3 增至 4，补 DSH 技能发现根与 hook 缺位事实）
- **理由:** 该卡片的 `scope` 已含 `adapters/`，本次新增宿主的实测结论（`~/.dsh/skills` rank 400 可发现、无等价 SessionStart hook）属于该卡片「新增宿主 = 新增描述符」结论的直接增量，不需要新建卡片。
