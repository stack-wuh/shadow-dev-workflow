---
{
  "schema": "shadow-dev/v1",
  "name": "20261107-feature-ai-director-video-skill",
  "type": "feature",
  "scope": "shadow-dev-workflow/skills",
  "status": "reviewed",
  "baseBranch": "main",
  "branch": "feature/20261107-feature-ai-director-video-skill",
  "files": [
    "CLAUDE.md",
    "skills/shadow-dev-video/SKILL.md",
    "skills/shadow-dev-video/ai-director.md",
    "skills/shadow-dev-video/shot-spec.md"
  ],
  "github": {
    "repository": "stack-wuh/shadow-dev-workflow",
    "issue": 88,
    "issueUrl": "https://github.com/stack-wuh/shadow-dev-workflow/issues/88",
    "pullRequest": null,
    "pullRequestUrl": null
  },
  "review": {
    "conclusion": "passed",
    "verifiedCommit": "046c104282c3aae8c87cf421d4737a63f537ba70",
    "verifiedAt": "2026-11-07T10:41:04.623Z"
  },
  "workflow": {
    "operation": null,
    "checkpoint": "issue:88",
    "planHash": "70b9e059485bbca95fc3cdd3bd14818a0daf6d1c67cb13064cf86c915335cd81",
    "updatedAt": null,
    "lastError": null,
    "issuePlan": {
      "title": "[feature] shadow-dev-video 技能升级 AI 导演工作流(资产层/强 schema 分镜/生图子管线/混合渲染)",
      "titleRaw": "[feature] shadow-dev-video 技能升级 AI 导演工作流(资产层/强 schema 分镜/生图子管线/混合渲染)",
      "supplement": "## 动机\n用户裁定技能太简单——运镜缺失、动效平庸、镜头/人物/场景拆解不合格;致郭襄实证 AI 生图来来回回返工多轮,根因是缺资产锚定与验收决策树。五路调研(GitHub 开源管线/八家模型官方指南/中文社区实战/生图一致性工程/视听语言)已沉淀为 skills/shadow-dev-video/ai-director.md 方法论基座。\n\n## 方案\n方案 A:技能在本仓一次 change 全线升级(SKILL.md 重写为 AI 导演工作流 + shot-spec §8 契约 + 触发表补行);wuh.site.video 的机器校验落地为后继 change(20261107-feature-asset-registry-shot-schema,已立项)。\n\n完整 brief:shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md",
      "body": "## 动机\n三件事共同触发:①用户裁定技能太简单——没有 AI 做视频的感觉,运镜缺失、动效平庸、数据变化表现呆板、镜头/人物/场景拆解不合格;②致郭襄项目(wuh.site.video,v10,38 镜/245s)实证痛点:AI 生图(水墨底图)来来回回返工多轮——根因是缺资产锚定、缺验收决策树,靠人肉硬摇;③五路调研(GitHub 开源管线/八家模型官方指南/中文社区实战/生图一致性工程/视听语言)已沉淀为 `skills/shadow-dev-video/ai-director.md`(提案前产出,本 change 收口定稿)。下一部片立项前必须让技能承载新方法论,否则继续在旧管线上烧工时。\n\n## 引用规范\n- `wuh.site.video/shadow-docs/knowledge/video-production-flow.md`(跨仓 active 卡)\n  - 当前结论: 两段式管线、前期五件套+人物视觉设定(character-design.md 已存在)、分镜师 brief 必含(总帧数硬约束/素材编号引用/对账表自查)、渲染只走 CI、版权 BGM 本地 mux\n  - 适用 scope: wuh.site.video videos/ ——约束本 change 技能正文的下游口径;卡片更新由后继 change 落地\n- `wuh.site.video/shadow-docs/knowledge/video-studio-structure.md`(跨仓 active 卡)\n  - 当前结论: 工作室三层结构、`shots-manifest.json` 帧数唯一真源、分镜组件禁内联色值、`pnpm check` 质量门\n  - 适用 scope: 同上\n- `skills/shadow-dev-video/ai-director.md`\n  - 当前结论: AI 导演方法论基座——六段式管线/强 schema 分镜/视听语言(景别·运镜·转场·节奏)/资产设定/生图生视频工程/数据动效/工具矩阵/失败模式总表\n  - 适用 scope: skills/shadow-dev-video/(本 change 正文来源与引用目标)\n- `rules/iron-laws.md`、`norms/verification.md`\n  - 当前结论: 渐进式加载与验证强度按评级匹配;知识治理/brief 契约由机器门执行\n  - 适用 scope: 本 change「结果」段取证\n\n## 决策\n- **选型:** 方案 A——技能在本仓一次 change 全线升级;wuh.site.video 的强 schema 分镜/`shots.mjs` 外键校验/生图资产入库约定为**后继 change**(该仓立项),本 change 只在 SKILL.md 写明下游契约与依赖顺序。\n- **对比方案:** ①B 轻量补丁(否——只追加生图守则,导演层进不了流程,不解决「技能太简单」的裁定);②C 跨两仓一次做完(否——违反单仓单 change 登记,brief 无法登记他仓文件集;且 schema 落地依赖方法论先定稿,顺序倒置)。\n- **理由:** 技能正文是流程契约的载体,先在 workflow-governance 定稿;video-materials 侧照其 brief 落地时同步更新两张知识卡。方法论应用节奏由技能内「分阶段落地」控制:下一部片先做资产层+首帧生图(动效仍全 Remotion),验证生图质量稳定后再引入图生视频氛围镜——风险最低路径。ai-director.md 内容系提案前五路调研沉淀(2026-11-07),本 change 收口定稿(互链+口径对齐),不计为新建套件断言。M 级走共享 checkout inline 分支,不申请 worktree。\n\n## 任务\n### Phase 1 技能正文\n\n- [x] task-1 — `skills/shadow-dev-video/SKILL.md` — 重写:触发词扩充(AI 导演/生图/首帧/角色一致性/分镜);前期管线插入资产层(风格锚点→角色定妆+三视图→场景图,与分镜并行);分镜师 brief 契约补强 schema 字段(景别/运镜/光线/构图/尾帧描述/资产外键引用);生图子管线(每镜 3-4 变体+验收五查+先修后摇)与混合渲染策略;既有渲染工程纪律(镜级缓存/CI 渲染/三重终验)全量保留不回退\n- [x] task-2 — `skills/shadow-dev-video/shot-spec.md` — 镜级产出物契约扩展:资产引用字段(定妆图/场景图/风格锚点路径)、AI 首帧资产的镜级接入规范;与 SKILL.md 口径对账\n- [x] task-3 — `skills/shadow-dev-video/ai-director.md` — 收口定稿:头部标注知识基座身份与调研日期(2026-11-07、五路来源),与 SKILL.md/shot-spec.md 互链,无冲突结论\n\n### Phase 2 门禁与触发表\n\n- [x] task-4 — `CLAUDE.md` — Skill 触发表补 `shadow-dev-video` 行(做视频/宣传片/剧本/分镜/AI 导演/生图/首帧/角色一致性)\n- [x] task-5 — 观察点取证 — `check:knowledge`(技能 frontmatter/死链/废弃 token)+ `check:requires:strict` + `check:brief` + 走查记录,M 级四条被触及不变量逐条对账\n\n## 补充\n## 动机\n用户裁定技能太简单——运镜缺失、动效平庸、镜头/人物/场景拆解不合格;致郭襄实证 AI 生图来来回回返工多轮,根因是缺资产锚定与验收决策树。五路调研(GitHub 开源管线/八家模型官方指南/中文社区实战/生图一致性工程/视听语言)已沉淀为 skills/shadow-dev-video/ai-director.md 方法论基座。\n\n## 方案\n方案 A:技能在本仓一次 change 全线升级(SKILL.md 重写为 AI 导演工作流 + shot-spec §8 契约 + 触发表补行);wuh.site.video 的机器校验落地为后继 change(20261107-feature-asset-registry-shot-schema,已立项)。\n\n完整 brief:shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md\n\n完整 brief：shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md\n\n<!-- shadow-dev:issue-metadata {\"name\":\"20261107-feature-ai-director-video-skill\",\"type\":\"feature\",\"scope\":\"shadow-dev-workflow/skills\",\"status\":\"reviewed\",\"branch\":\"feature/20261107-feature-ai-director-video-skill\",\"baseBranch\":\"main\",\"briefPath\":\"shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md\",\"cliVersion\":\"1.9.0\",\"prUrl\":null,\"issueNumber\":null} -->\n",
      "labels": [
        "feature"
      ]
    },
    "release": {
      "files": [
        "CLAUDE.md",
        "shadow-docs/INDEX.md",
        "shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md",
        "skills/shadow-dev-video/SKILL.md",
        "skills/shadow-dev-video/ai-director.md",
        "skills/shadow-dev-video/shot-spec.md"
      ],
      "message": "feat(skills): shadow-dev-video 升级 AI 导演工作流——资产层/强 schema 分镜/生图子管线/混合渲染",
      "title": "feat(skills): shadow-dev-video 升级 AI 导演工作流(资产层/强 schema 分镜/生图子管线/混合渲染)",
      "body": "## 变更\n- `skills/shadow-dev-video/SKILL.md`:九处定向增补(零回退)——前期管线插入**资产层**(风格锚点/角色定妆三视图/场景图,与分镜并行)、分镜**强 schema 导演列**(景别运镜/光线/构图/尾帧描述/资产外键 + 旁白字数硬表)、第二段插入**逐镜 AI 资产生产**(每镜 3-4 变体 + 验收五查 + 先修后摇)、**混合渲染策略**(数据动效留 Remotion,人物/场景叙事镜走 AI 首帧)、收尾落地节奏(先资产层+首帧生图);触发词扩入 AI 导演/生图/首帧/角色一致性/运镜\n- `skills/shadow-dev-video/shot-spec.md`:新增 §8 AI 首帧资产接入(契约先行:资产入库路径/换图必改镜文件引用的缓存键语义/manifest 扩展字段)+ INV-S7\n- `skills/shadow-dev-video/ai-director.md`(新增):AI 导演方法论基座——2026-11-07 五路调研沉淀(GitHub 开源管线/八家模型官方指南/中文社区实战/生图一致性工程/视听语言),含逐镜词汇表/生图模板/翻车诊断/失败模式总表\n- `CLAUDE.md`:Skill 触发表补 shadow-dev-video 行\n- `shadow-docs/INDEX.md`:补登记 20261102-feature-dsh-host-adapter(PR #80 合入遗留缺口)+ 本 change 台账行\n\n## 影响\n- 行为/触发面:视频技能获得导演层方法论(资产层/生图子管线/混合渲染);宿主技能 description 变更待 pack/bind 产物更新后生效\n- 明确不受影响:不改 CLI 命令面、不改任何 scripts/ 门判定集、不动 requiresCommands 与 cliVersion pin;下游机器校验由 wuh.site.video 后继 change 落地(20261107-feature-asset-registry-shot-schema,已立项)\n- 回滚方式:revert 本 PR 即移除技能增量与台账行,无跨仓副作用\n\n## 验证\n- `npm run check:knowledge` → ok=11 warn=19 fail=0(技能 13 个 frontmatter 一致;引用扫描 74 文件零死链;废弃 token 零命中)\n- `npm run check:requires:strict` → ✓ skills ⊆ requiresCommands ⊆ CLI 命令目录(零新增命令键)\n- `npm run check:brief` → 6 份在途 brief 契约全绿\n- M 级四条被触及不变量观察点全闭合(详见 brief 结果段)\n\n## 关联\n- Closes #88\n- brief: shadow-docs/changes/20261107-feature-ai-director-video-skill/brief.md"
    }
  },
  "knowledge": {
    "action": "无需变更",
    "target": null,
    "reason": "技能正文是 ai-director.md 方法论的执行形态载体,ai-director.md 随技能目录分发即知识载体;本仓六张卡片无视频域卡片,无新增长期事实;跨仓 video-production-flow/video-studio-structure 两卡的更新由素材仓后继 change 落地时执行并补 verified-depth/verified-scope"
  }
}
---

# shadow-dev-video 技能全线升级:引入 AI 导演工作流

## 动机

三件事共同触发:①用户裁定技能太简单——没有 AI 做视频的感觉,运镜缺失、动效平庸、数据变化表现呆板、镜头/人物/场景拆解不合格;②致郭襄项目(wuh.site.video,v10,38 镜/245s)实证痛点:AI 生图(水墨底图)来来回回返工多轮——根因是缺资产锚定、缺验收决策树,靠人肉硬摇;③五路调研(GitHub 开源管线/八家模型官方指南/中文社区实战/生图一致性工程/视听语言)已沉淀为 `skills/shadow-dev-video/ai-director.md`(提案前产出,本 change 收口定稿)。下一部片立项前必须让技能承载新方法论,否则继续在旧管线上烧工时。

## 复杂度评级

- **评级:** M
- **理由:** ①契约变更:无机器契约——不改 CLI 命令面、不改任何 `scripts/` 门判定集、不动 `requiresCommands`/`cliVersion` pin;技能正文是流程契约(方法论),由宿主技能加载承载,内容不机检。②触及面:`skills/shadow-dev-video/` 三文件 + `CLAUDE.md` 触发表一行,纯技能族演进(先例:20261015-feature-tdd-debug-skills 同级 M)。③可发现性:改坏立刻可见(技能 frontmatter 门/死链门红),无隐藏运行时路径。故 M。
- **期望验证深度:** code-read
- **取证策略:** observation(四条被触及不变量全部可用既有机检门取证,不需新建断言套件)

## 领域模型

- **限界上下文:** `workflow-governance` — 技能族演进与开发流程治理。下游:各项目 `shadow-docs/` 与视频项目(`video-materials`,跨仓 wuh.site.video);反腐边界:不改 `requiresCommands`、不改任何 `scripts/` 门判定集、不动跨仓文件。
- **统一语言增量:**
  - **资产层**:前期制作新增的设定资产集合——风格锚点(冻结风格块+参考机制)、角色定妆图+三视图(character sheet)、场景图(空镜无人物);来源 ai-director.md §4。
  - **冻结风格块**:每条生图 prompt 开头不变的「媒介+镜头+光线+调色」块,逐镜只换场景/机位/动作;风格跨镜一致性的第一锚点。
  - **先修后摇**:生图翻车的返工决策树——先修(inpaint/换脸/局部重绘)→再重摇(同 prompt 变体)→最后重写 prompt;重摇只在构图级失败时进行。
  - **混合渲染策略**:镜头类型分流——数据动效/counter/图表/文字留 Remotion 确定性渲染;人物/场景叙事镜走 AI 生图首帧(+可选图生视频);允许 AI 首帧+Remotion 前景动效叠加的混合镜。
  - **尾帧描述(end_frame_desc)**:逐镜表新增字段——该镜结束时画面停在哪,作为下一镜的衔接锚(链式分镜)。
  - **验收五查**:AI 首帧过门标准——人脸与定妆 sheet 相似度、五指完整、文字区干净、风格块生效(色温/颗粒)、与上镜色彩连续性;每镜 3-4 变体选优。
- **被触及既有不变量:**
  - 技能清单门:`skills/shadow-dev-video/SKILL.md` 的 `name` 与目录同名、`description` 非空且与正文触发词一致(`check:knowledge` frontmatter 门)。
  - 引用完整性:ai-director.md / SKILL.md / shot-spec.md 互引路径与 CLAUDE.md 触发表指向全部真实存在(`check:knowledge` 死链扫描)。
  - 能力一致性:技能不引入未声明的 CLI 命令键,`skills ⊆ requiresCommands ⊆ CLI 命令目录`(`check:requires:strict`)。
  - 废弃 token 零命中:新文本不踩 6 个禁项串(`check:knowledge` 扫描)。
- **领域事件:** SKILL.md `description` 变更后,宿主侧生效需 pack/bind 产物更新——发布链感知点,由 publish 攒版承载,不在本 change 执行。

## 引用规范

- `wuh.site.video/shadow-docs/knowledge/video-production-flow.md`(跨仓 active 卡)
  - 当前结论: 两段式管线、前期五件套+人物视觉设定(character-design.md 已存在)、分镜师 brief 必含(总帧数硬约束/素材编号引用/对账表自查)、渲染只走 CI、版权 BGM 本地 mux
  - 适用 scope: wuh.site.video videos/ ——约束本 change 技能正文的下游口径;卡片更新由后继 change 落地
- `wuh.site.video/shadow-docs/knowledge/video-studio-structure.md`(跨仓 active 卡)
  - 当前结论: 工作室三层结构、`shots-manifest.json` 帧数唯一真源、分镜组件禁内联色值、`pnpm check` 质量门
  - 适用 scope: 同上
- `skills/shadow-dev-video/ai-director.md`
  - 当前结论: AI 导演方法论基座——六段式管线/强 schema 分镜/视听语言(景别·运镜·转场·节奏)/资产设定/生图生视频工程/数据动效/工具矩阵/失败模式总表
  - 适用 scope: skills/shadow-dev-video/(本 change 正文来源与引用目标)
- `rules/iron-laws.md`、`norms/verification.md`
  - 当前结论: 渐进式加载与验证强度按评级匹配;知识治理/brief 契约由机器门执行
  - 适用 scope: 本 change「结果」段取证

## 决策

- **选型:** 方案 A——技能在本仓一次 change 全线升级;wuh.site.video 的强 schema 分镜/`shots.mjs` 外键校验/生图资产入库约定为**后继 change**(该仓立项),本 change 只在 SKILL.md 写明下游契约与依赖顺序。
- **对比方案:** ①B 轻量补丁(否——只追加生图守则,导演层进不了流程,不解决「技能太简单」的裁定);②C 跨两仓一次做完(否——违反单仓单 change 登记,brief 无法登记他仓文件集;且 schema 落地依赖方法论先定稿,顺序倒置)。
- **理由:** 技能正文是流程契约的载体,先在 workflow-governance 定稿;video-materials 侧照其 brief 落地时同步更新两张知识卡。方法论应用节奏由技能内「分阶段落地」控制:下一部片先做资产层+首帧生图(动效仍全 Remotion),验证生图质量稳定后再引入图生视频氛围镜——风险最低路径。ai-director.md 内容系提案前五路调研沉淀(2026-11-07),本 change 收口定稿(互链+口径对齐),不计为新建套件断言。M 级走共享 checkout inline 分支,不申请 worktree。

## 任务

### Phase 1 技能正文

- [x] task-1 — `skills/shadow-dev-video/SKILL.md` — 重写:触发词扩充(AI 导演/生图/首帧/角色一致性/分镜);前期管线插入资产层(风格锚点→角色定妆+三视图→场景图,与分镜并行);分镜师 brief 契约补强 schema 字段(景别/运镜/光线/构图/尾帧描述/资产外键引用);生图子管线(每镜 3-4 变体+验收五查+先修后摇)与混合渲染策略;既有渲染工程纪律(镜级缓存/CI 渲染/三重终验)全量保留不回退
- [x] task-2 — `skills/shadow-dev-video/shot-spec.md` — 镜级产出物契约扩展:资产引用字段(定妆图/场景图/风格锚点路径)、AI 首帧资产的镜级接入规范;与 SKILL.md 口径对账
- [x] task-3 — `skills/shadow-dev-video/ai-director.md` — 收口定稿:头部标注知识基座身份与调研日期(2026-11-07、五路来源),与 SKILL.md/shot-spec.md 互链,无冲突结论

### Phase 2 门禁与触发表

- [x] task-4 — `CLAUDE.md` — Skill 触发表补 `shadow-dev-video` 行(做视频/宣传片/剧本/分镜/AI 导演/生图/首帧/角色一致性)
- [x] task-5 — 观察点取证 — `check:knowledge`(技能 frontmatter/死链/废弃 token)+ `check:requires:strict` + `check:brief` + 走查记录,M 级四条被触及不变量逐条对账

## 结果

- 实际耗时: 2026-11-07 单日(propose 与 apply 同日;执行中修正一次——整篇重写稿作废改外科增补:仓库副本含 v12 实战补遗等未同步到已安装副本的新内容,重写会回退,改为九处定向增补零回退)
- 验证(M 级:冒烟 + 每条被触及不变量一个观察点 + 走查;全部门禁只作门槛):

| 不变量 | 观察点 |
|---|---|
| 技能 frontmatter 门 | `npm run check:knowledge` → `[ok] 技能 13 个:name/description 与目录一致性检查完成`(shadow-dev-video description 扩入 AI 导演/生图/首帧/角色一致性/运镜) |
| 引用完整性 | 同门 → `[ok] 引用扫描 74 个文件、路径断言 零死链、enumeration=git`(ai-director.md / shot-spec.md / SKILL.md / CLAUDE.md 互引全解析;`scripts/mux-film.sh`、`scripts/shots.mjs` 跨仓脚本引用为先存 warn,在途常态) |
| 能力一致性 | `npm run check:requires:strict` → `✓ skills ⊆ requiresCommands ⊆ CLI 命令目录`(declared=29 skills-referenced=23 undeclared=[],零新增命令键) |
| 废弃 token 零命中 | 同 check:knowledge → `摘要: ok=11 warn=19 fail=0`(fail=0 含废弃残留扫描;19 warn 逐条归因:知识卡归档搬迁解析/verified-scope 为先存,brief 未进 git 为在途常态,提交后自动消解) |

- **门槛**:`npm run check:brief` → `✅ brief 契约门:6 份在途 brief 的规格段与对账闭合成立`(本 brief M 级 ok;2 条 GRANDFATHERED 为门生效前在途,豁免)
- **先存缺口修复**:check:knowledge 首跑 fail=1——台账缺 `20261102-feature-dsh-host-adapter`(PR #80 合入遗留,非本 change 引入)→ `shadow-dev index rebuild plan/execute`(planHash 4f824e8a…)补登记后复跑绿
- **走查**:SKILL.md 前期 1–6 / 第二段 1–7 重编号连续;v12 实战补遗 A–H 与执行纪律逐条保留零回退;CLAUDE.md 触发表新行紧随 tts 行;shot-spec §8 + INV-S7 契约先行登记
- 未验证项(明说):INV-S7 的机器校验器随素材仓后继 change 才存在,本 change 只登记契约与走查;生图子管线/混合渲染策略的 runtime 效果待下一部片验证(落地节奏:先资产层+首帧生图,动效仍全 Remotion)

## 知识评估

- **预期影响:** 无需变更(本仓)
- **候选卡片:** 无本仓卡片;跨仓 `wuh.site.video/shadow-docs/knowledge/video-production-flow.md`(前期五件套→资产层扩展)与 `video-studio-structure.md` 的更新由后继 change 落地时执行
- **理由:** 技能正文是 ai-director.md 方法论的执行形态载体,ai-director.md 本身即知识文档(随技能目录分发);本仓六张卡片无视频域卡片,无需变更
