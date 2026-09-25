---
{
  "schema": "shadow-dev/v1",
  "name": "20260925-feature-pack-release",
  "type": "feature",
  "scope": "distribution",
  "status": "archived",
  "baseBranch": "main",
  "branch": "feature/20260925-feature-pack-release",
  "files": [
    "README.md",
    "adapters/claude-code.json",
    "adapters/zcode.json",
    "scripts/pack.mjs",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": 19,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/19"
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "6413705b502a1fbc6127f7cd0f402288c0b19621",
    "verifiedAt": "2026-09-25T03:52:37.152Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "merged-pr:19",
    "planHash": "f0d51329ef2a32b5794823baa4e6b6435c8d3bbade6a8ed5a72ac5bac7af56a3",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "README.md",
        "adapters/claude-code.json",
        "adapters/zcode.json",
        "scripts/pack.mjs",
        "shadow-docs/changes/20260925-feature-pack-release/brief.md",
        "test/pack.test.mjs"
      ],
      "message": "docs(shadow): review 通过记录——20260925-feature-pack-release 结论与知识评估写入 brief",
      "title": "feat(workflow): pack release artifact + host adapter descriptors",
      "body": ""
    }
  },
  "knowledge": {
    "action": "更新",
    "target": "shadow-dev-cli/shadow-docs/knowledge/install-distribution.md",
    "reason": "产物布局从 CLI 单一扩展为 CLI+workflow 双产物;adapters 描述符成为宿主绑定契约;release 不作为 brief task(机械门禁死锁教训)"
  }
}
---

# workflow 打包发布与宿主适配器描述符

## 动机

生态分发反转的第一环:shadow-dev CLI 将成为 shadow 生态统一分发入口(`workflow install`/`bind`),但 workflow 仓的 release 只有 tag 没有产物(v6.2.1 assets 为空),CLI 无物可拉。本 brief 补齐打包发布链路,并让产物自带宿主适配器描述符——新增宿主是数据不是代码。宿主优先级:claude code 为原生宿主(本插件为其开发),zcode 兼容直用。

## 引用规范

- shadow-dev-cli/shadow-docs/knowledge/install-distribution.md
  - 当前结论: 双轨(物化+link)、CURRENT/PREVIOUS 指针、落盘前冒烟、原子发布留回滚、命令面与接缝注释两处同源登记
  - 适用 scope: 分发模型与产物消费方式;该卡「适用边界」明确 pack.mjs 产物布局另论,本 brief 即补这一定义
- 通用 norms/code-style.md
  - 当前结论: 默认代码风格约束
  - 适用 scope: scripts/pack.mjs、test/pack.test.mjs

## 决策

- **选型:** 仿 shadow-dev-cli 仓 `scripts/pack.mjs` 产出 `shadow-dev-workflow-v<ver>.tar.gz` 挂 GitHub release;新增 `adapters/<host>.json` 随产物分发(claude-code.json 原生,zcode.json 兼容)
- **对比方案:** 直写宿主注册表(否决——耦合宿主内部格式,违反托管标记哲学);以 ZCode marketplace 为分发主路径(否决——宿主无关要求,marketplace.json 降级为插件型宿主的可选产物)
- **理由:** CLI 物化轨需要稳定可下载产物;描述符数据化让 CLI 零改动支持新宿主;产物保持最小运行集(marketplace.json/package.json/skills/hooks/rules/knowledge/norms/menu.md/docs),排除 test/changes 等开发文件

## 任务

### Phase 1
- [x] 打包脚本 pack.mjs — `scripts/pack.mjs` — 仿 CLI 仓同名脚本产出 tarball,包根含 marketplace.json/package.json/skills/hooks/rules/knowledge/norms/menu.md/docs,排除 test/changes/开发产物
- [x] 打包契约测试 — `test/pack.test.mjs` — tarball 布局、排除规则、与 package.json 版本一致性断言

### Phase 2
- [x] claude-code 宿主描述符 — `adapters/claude-code.json` — 原生宿主:skills 发现目录、SKILL.md 复制策略、hook 支持声明
- [x] zcode 宿主描述符 — `adapters/zcode.json` — 兼容宿主描述符
- [x] 分发章节改写 — `README.md` — 「安装与分发」改为 CLI 驱动入口,登记 adapters 契约

### Phase 3
- [x] 发布 v6.3.0 — 经 shadow-dev release 域 — tag + release 并上传 tarball 资产,供 CLI workflow 域物化

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 更新
- **候选卡片:** shadow-dev-cli/shadow-docs/knowledge/install-distribution.md
- **理由:** 产物布局从「CLI tarball 单一」扩展为「CLI + workflow(含 adapters)双产物」,install-distribution 卡的适用边界与产物契约需同步扩展
