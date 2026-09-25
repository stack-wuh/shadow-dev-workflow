---
{
  "schema": "shadow-dev/v1",
  "name": "20260925-fix-pack-adapters",
  "type": "fix",
  "scope": "distribution",
  "status": "branched",
  "baseBranch": "main",
  "branch": "fix/20260925-fix-pack-adapters",
  "files": [
    "package.json",
    "scripts/pack.mjs",
    "test/pack.test.mjs"
  ],
  "github": {
    "repository": null,
    "issue": null,
    "issueUrl": null,
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": null,
    "planHash": "3c055352ce1f6732715fef40bb78bd1afe8553a1a85433411f2da907b6c7ed50",
    "updatedAt": null,
    "lastError": null,
    "release": {
      "files": [
        "package.json",
        "scripts/pack.mjs",
        "shadow-docs/changes/20260925-fix-pack-adapters/brief.md",
        "test/pack.test.mjs"
      ],
      "message": "fix(pack): 产物补 adapters/ 描述符——bind 域 release 轨依赖(发 v6.3.1)",
      "title": "20260925-fix-pack-adapters",
      "body": ""
    }
  }
}
---

# pack 产物补 adapters 描述符(发 v6.3.1)

## 动机

CLI workflow 域的 `bind` 从产物读取 `adapters/<host>.json`,但 v6.3.0 的 pack 打包清单漏了 `adapters/`,release 轨装出的产物无法 bind(报 `ADAPTERS_MISSING`;link 轨不受影响)。补齐清单并发 v6.3.1。

## 引用规范

- shadow-dev-cli/shadow-docs/knowledge/install-distribution.md
  - 当前结论: 双轨/落盘前冒烟/产物契约两处同源登记
  - 适用 scope: pack 产物布局以其消费方(bind 域)契约为准
- 通用 norms/code-style.md
  - 当前结论: 默认代码风格约束
  - 适用 scope: scripts/pack.mjs、test/pack.test.mjs

## 决策

- **选型:** `pack.mjs` 的 DIRS 增加 `adapters`;`package.json` 版本升 6.3.1;契约测试补 adapters 存在断言
- **对比方案:** 让 bind 从产物外寻找描述符(否决——描述符必须随产物单一来源分发)
- **理由:** 一行清单修复 + 测试钉住;补丁位递增

## 任务

### Phase 1
- [x] 契约测试补 adapters 断言 — `test/pack.test.mjs` — TDD 红:adapters 未在产物中
- [x] pack 清单补 adapters + 版本升 6.3.1 — `scripts/pack.mjs` `package.json` — 绿

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 更新
- **候选卡片:** shadow-dev-cli/shadow-docs/knowledge/install-distribution.md
- **理由:** workflow 产物契约新增 adapters/ 必备项(bind 域依赖),与 CLI 侧 scope 扩展同源
