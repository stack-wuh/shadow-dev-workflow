---
{
  "schema": "shadow-dev/v1",
  "name": "20261110-docs-remotion-capabilities",
  "type": "docs",
  "scope": "skills/shadow-dev-video",
  "status": "committed",
  "baseBranch": "main",
  "branch": "docs/20261110-docs-remotion-capabilities",
  "files": [
    "skills/shadow-dev-video/SKILL.md",
    "skills/shadow-dev-video/ai-director.md",
    "skills/shadow-dev-video/remotion-capabilities.md",
    "skills/shadow-dev-video/shot-spec.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 91,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/91",
    "pullRequest": 92,
    "pullRequestUrl": "https://github.com/stack-wuh/shadow-dev-workflow/pull/92"
  },
  "review": {
    "conclusion": "pending",
    "verifiedCommit": null,
    "verifiedAt": null
  },
  "workflow": {
    "operation": null,
    "checkpoint": "2665aeef9ec200a65feab8f5bb2281373921a9a5",
    "planHash": "61e01aeb5ee518182e9f006771f6ffb37b90c5892e8b8b17da2fba3523e8a32a",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[docs] Remotion 能力地图整合进 shadow-dev-video 技能：官方基元优先 + 三维管线契约",
      "titleRaw": "[docs] Remotion 能力地图整合进 shadow-dev-video 技能：官方基元优先 + 三维管线契约",
      "supplement": "调研实证：v3 动效只用「帧循环+interpolate」，官方子包 0 个、spring 0 处、描画 13 处猜长度。用户四项拍板（子包全量/协议不动+令牌吸收/three 先行+Blender 契约先行/v3 一并升级），素材仓已同日落地实证。本 change 新建 remotion-capabilities.md 能力地图 + SKILL.md/shot-spec.md/ai-director.md 修订（白名单扩容、§9 三维管线、INV-S8、决策 #8–#11）。详见 shadow-docs/changes/20261110-docs-remotion-capabilities/brief.md",
      "body": "## 动机\n调研实证（2026-11-10）：在制 v3（62 镜）动效只用了 Remotion 的「帧循环 + interpolate」（279 处）——spring 0 处、`@remotion/*` 子包 0 个、SVG 描画 13 处猜路径长度（起步死区+变速扭曲）。官方生态的弹性物理/路径引擎/确定性噪声/转场库/3D 帧驱动全部闲置。用户四项拍板（子包全量 / 转场协议不动+令牌吸收 / three 先行+Blender 契约先行 / v3 一并升级），素材仓 wuh.site.video 已同日落地实证（9 包钉 4.0.538 + brand/motion 官方基元层 + 描画引擎真长度化 + typecheck 全绿）；本 change 把能力地图与契约写进技能，使后续影片的动效设计站在官方基元上。\n\n## 引用规范\n- `skills/shadow-dev-video/shot-spec.md`\n  - 当前结论: 镜级产出物规范（一镜一文件一缓存）；import 白名单未纳入官方 @remotion/* 子包；SFX v2 演进口径无素材源；三维镜无契约\n  - 适用 scope: skills/shadow-dev-video/\n- `skills/shadow-dev-video/SKILL.md`\n  - 当前结论: 第二段令牌库先行未约束实现基元来源（v3 实证 62 镜 spring 0 处）；motion-spec 未要求实现基元列\n  - 适用 scope: skills/shadow-dev-video/\n\n## 决策\n- **选型:** 新建 `remotion-capabilities.md`（§0 包清单 / §1 令牌→基元决策表 / §2 已入库基元 / §3 转场架构 / §4 3D 双路线 / §5 反模式 / §6 链接）；SKILL.md 三处（第二段契约行 + step1 官方基元优先 + step5 实现基元列）；shot-spec.md 四处（§3 白名单扩容冻结清单、§7 补 @remotion/sfx 素材源、新增 §9 三维资产管线、INV-S8 + 决策记录 #8–#11）；ai-director.md §7.2 补 Remotion 实现基元条目\n- **对比方案:** A 并进 SKILL.md 单文件（SKILL 已过长，子包细节会淹没主流程，弃）；B 只记素材仓知识卡（技能是跨片方法论载体，知识卡是单仓实证——能力地图必须随技能走，弃）\n- **理由:** 用户四项拍板 + 素材仓同日实证回填；文档与代码同源（基元层 brand/motion.ts 已入库）\n\n## 任务\n### Phase 1 文档落地（已在工作树完成，apply 提交）\n- [x] 新建 remotion-capabilities.md — `skills/shadow-dev-video/remotion-capabilities.md`\n- [x] SKILL.md 契约行/官方基元优先/实现基元列 — `skills/shadow-dev-video/SKILL.md`\n- [x] shot-spec.md 白名单/§7 sfx/§9 三维管线/INV-S8/决策 #8–#11 — `skills/shadow-dev-video/shot-spec.md`\n- [x] ai-director.md §7.2 基元条目 — `skills/shadow-dev-video/ai-director.md`\n\n## 补充\n调研实证：v3 动效只用「帧循环+interpolate」，官方子包 0 个、spring 0 处、描画 13 处猜长度。用户四项拍板（子包全量/协议不动+令牌吸收/three 先行+Blender 契约先行/v3 一并升级），素材仓已同日落地实证。本 change 新建 remotion-capabilities.md 能力地图 + SKILL.md/shot-spec.md/ai-director.md 修订（白名单扩容、§9 三维管线、INV-S8、决策 #8–#11）。详见 shadow-docs/changes/20261110-docs-remotion-capabilities/brief.md\n\n完整 brief：shadow-docs/changes/20261110-docs-remotion-capabilities/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261110-docs-remotion-capabilities\",\"type\":\"docs\",\"scope\":\"skills/shadow-dev-video\",\"status\":\"proposed\",\"branch\":null,\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261110-docs-remotion-capabilities/brief.md\",\"cliVersion\":\"1.9.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "docs"
      ]
    },
    "commit": {
      "files": [
        "shadow-docs/INDEX.md"
      ],
      "message": "docs(shadow): 台账 INDEX 登记 20261110 change（knowledge gate 红修）"
    }
  }
}
---

# Remotion 能力地图整合进 shadow-dev-video 技能

## 动机

调研实证（2026-11-10）：在制 v3（62 镜）动效只用了 Remotion 的「帧循环 + interpolate」（279 处）——spring 0 处、`@remotion/*` 子包 0 个、SVG 描画 13 处猜路径长度（起步死区+变速扭曲）。官方生态的弹性物理/路径引擎/确定性噪声/转场库/3D 帧驱动全部闲置。用户四项拍板（子包全量 / 转场协议不动+令牌吸收 / three 先行+Blender 契约先行 / v3 一并升级），素材仓 wuh.site.video 已同日落地实证（9 包钉 4.0.538 + brand/motion 官方基元层 + 描画引擎真长度化 + typecheck 全绿）；本 change 把能力地图与契约写进技能，使后续影片的动效设计站在官方基元上。

## 复杂度评级

- **评级:** S
- **理由:** 纯技能文档：新增 1 文件（remotion-capabilities.md）+ 3 文件修订（SKILL.md / shot-spec.md / ai-director.md），零代码、零运行时契约变更——shot-spec 增补的 §9 与白名单扩容是「契约文档化」（素材仓代码已先行实证）
- **期望验证深度:** code-read
- **取证策略:** observation

## 领域模型

（S 级免填；docs 变更，不触碰聚合不变量）

## 引用规范

- `skills/shadow-dev-video/shot-spec.md`
  - 当前结论: 镜级产出物规范（一镜一文件一缓存）；import 白名单未纳入官方 @remotion/* 子包；SFX v2 演进口径无素材源；三维镜无契约
  - 适用 scope: skills/shadow-dev-video/
- `skills/shadow-dev-video/SKILL.md`
  - 当前结论: 第二段令牌库先行未约束实现基元来源（v3 实证 62 镜 spring 0 处）；motion-spec 未要求实现基元列
  - 适用 scope: skills/shadow-dev-video/

## 决策

- **选型:** 新建 `remotion-capabilities.md`（§0 包清单 / §1 令牌→基元决策表 / §2 已入库基元 / §3 转场架构 / §4 3D 双路线 / §5 反模式 / §6 链接）；SKILL.md 三处（第二段契约行 + step1 官方基元优先 + step5 实现基元列）；shot-spec.md 四处（§3 白名单扩容冻结清单、§7 补 @remotion/sfx 素材源、新增 §9 三维资产管线、INV-S8 + 决策记录 #8–#11）；ai-director.md §7.2 补 Remotion 实现基元条目
- **对比方案:** A 并进 SKILL.md 单文件（SKILL 已过长，子包细节会淹没主流程，弃）；B 只记素材仓知识卡（技能是跨片方法论载体，知识卡是单仓实证——能力地图必须随技能走，弃）
- **理由:** 用户四项拍板 + 素材仓同日实证回填；文档与代码同源（基元层 brand/motion.ts 已入库）

## 任务

### Phase 1 文档落地（已在工作树完成，apply 提交）
- [x] 新建 remotion-capabilities.md — `skills/shadow-dev-video/remotion-capabilities.md`
- [x] SKILL.md 契约行/官方基元优先/实现基元列 — `skills/shadow-dev-video/SKILL.md`
- [x] shot-spec.md 白名单/§7 sfx/§9 三维管线/INV-S8/决策 #8–#11 — `skills/shadow-dev-video/shot-spec.md`
- [x] ai-director.md §7.2 基元条目 — `skills/shadow-dev-video/ai-director.md`

## 结果

- 实际耗时: —
- 验证: —

## 知识评估

- **预期影响:** 新增
- **候选卡片:** 本技能 `remotion-capabilities.md` 即为载体；素材仓知识卡回写（video-production-flow / render-stability-playbook）随 v3 出片 runtime 验证后进行
- **理由:** 官方基元层属「导演方法论 + 工程契约」双重载体，归技能
