---
title: 契约探针与观察点的分工
domain: workflow-governance
keywords: [契约探针, probe, 既有套件, npm test, 观察点, 不变量, 完成证据, 归因, 环境噪声, 139, 假绿, 门槛, 套件全绿]
scope: [norms/verification.md, scripts/, test/, .github/workflows/quality-gate.yml, .github/workflows/publish-release.yml]
status: active
source:
  - changes/20261011-refactor-kill-tdd-verification/brief.md
verified: 2026-10-11
verified-depth: runtime
verified-scope: 本轮以真实命令取证——`check:version`/`check:requires:strict`/`check-knowledge` 三门全绿；`node --test test/pack.test.mjs` 4/4、`test/install-cli.test.mjs` 7/7（沙箱内）；拒绝路径为把旧门槛措辞写回 `norms/verification.md` 后 `check-knowledge --forbid` 判红，回滚后复绿。执行中实测到四种同形噪声：越权（有网）环境 node --test 静默挂死、tty 会话下子进程继承 stdin 永久阻塞、macOS 无 setsid、node 139 段错误使 `spawnSync` 返回 null 状态——它们与真实失败无法凭「无输出」区分，正是本卡「红必须归因」条的成因。
---

# 契约探针与观察点的分工

## 当前结论

彻底去 TDD 之后，工作流里只剩两种东西：**观察点**（不变量的存在性证明）与**契约探针**（可重复执行的机器断言，含既有测试套件、`scripts/check-*.mjs`、产物与安装器契约扫描）。

- **探针绿不是完成证据。** 它只说明既有断言没被打破，不说明本次变更的不变量成立。完成证据永远是「不变量 × 观察点」的对账表。
- **探针红不是自动结论。** 必须归因为「真实回归」或「环境噪声」并写进 brief；未归因的红灯＝未验证。
- **探针是否运行不是门槛。** 但**探针未解释地红着、或用它代替观察点**，是门槛级的阻塞项。
- **新增机检走 `scripts/`，不走测试文件。** 二者是同一能力的两种形态，我们只保留「可重复命令 + 指名它钉哪条不变量」这一种，避免套件膨胀成新的仪式负担。

## 执行约束

- 每条 L/M 级不变量必须有观察点；引用探针时，须在 brief 写明该探针覆盖的是哪条不变量，否则视为未验证。
- 进入 CI（`quality-gate.yml` / `publish-release.yml`）的探针必须能指名它守护的不变量；指不出的不进 CI，也不许拿来代替观察点。
- 环境噪声的可复现形态（须与真实失败区分）：runner 挂死、本机 node 139 段错误风暴使子进程返回 `null` 状态、沙箱禁网、越权（有网）环境下测试运行器静默不产出、子进程继承父 stdin 导致永久阻塞、`tty` 会话与 `setsid` 差异。处置顺序：缩小运行范围（分片 / 单文件 / `--test-name-pattern`）→ 关闭 stdin（`< /dev/null`）→ 降并发 → 禁编译缓存 → 重试至收敛；仍不可得则记为证据缺口与替代观察点（CI run 链接），**禁止以「应该没问题」占位**。
- 取证成本本身是信号：当「把套件跑全绿」消耗的时间超过取不变量观察点的时间，说明流程正在退回 TDD——按本卡纠正，而不是加班满足已废除的旧门槛。

## 适用边界

适用于任何已有自动化套件、又已把验收对象改为不变量的仓库（AI 代理执行场景尤其如此：没有对账表，代理会拿最省事的绿来当完成）。不适用于尚未建立不变量清单的新项目——那里探针仍是主要证据来源，先建领域模型再谈降格。

## 验证方式

1. `scripts/check-knowledge.mjs --forbid` 的禁项集合包含被废除的旧门槛措辞；**禁项字符串只存在于 `.github/workflows/*.yml` 的 forbid 参数里**，规范与卡片一律不逐字复现——否则守卫自己的文档会先被自己判红（本轮实测发生过）。
2. brief「结果」段每条不变量行都有观察点；引用探针处写明覆盖的不变量。
3. 红灯记录中可见归因结论（回归／噪声），未归因视为未完成。
4. CI run 链接作为替代观察点时须可点开且指明 job。

## 关联知识

- [验证策略与复杂度评级](../norms/verification.md)
- [领域模型是工作流的规格载体](domain-driven-shadow-dev.md)
- [Knowledge 约束卡片规范](../norms/knowledge-cards.md)
- [发布链版本权威与产物资产契约](release-artifact-pipeline.md)
