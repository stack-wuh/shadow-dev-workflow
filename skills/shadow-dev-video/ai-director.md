# 如何做一个 AI 导演

> 知识基座 · 调研综述 · 2026-11-07
> 来源:GitHub 开源项目(MoneyPrinterTurbo / NarratoAI / ai-shortVideo-pipeline / Seedance2-Storyboard-Generator 等)、八家视频模型官方指南(Sora 2 / Runway Gen-4 / Veo 3.1 / Kling / Pika / Luma / 即梦 / Hailuo)、中文社区实战教程(B站/知乎/腾讯云/博客园/CSDN)。
> 用途:`shadow-dev-video` 技能升级的知识基座。先读这份,再动 SKILL.md。
> 互链:执行流程见同目录 `SKILL.md`(两段式管线+资产层+生图子管线);镜级契约见 `shot-spec.md`(§8 AI 首帧资产接入)。本文件 § 编号被上述两文件引用,增删章节须同步对账。

---

## 0. 一页总纲

**AI 导演的工作不是写 prompt,而是管三件事:**

1. **资产**——角色/场景/风格先变成可复用的设定资产,跨镜引用,而不是每镜现摇现想
2. **语言**——每一镜有景别/运镜/转场/节奏的导演意图,而不是"让它动一动"
3. **工程**——强 schema 分镜 + 单镜独立重生成 + 「先修后摇」返工决策树,把抽卡成本变成可预算项

### 痛点对照(我们踩过的坑 → 本文对应章节)

| 我们的痛点 | 行业共识 | 章节 |
|---|---|---|
| 生图翻车,来来回回好几遍 | 抽卡是常态(熟练者 ~5 次出一镜,成片率 ~20%);系统性解法 = 资产锚定 + 先修后摇,不是人肉硬摇 | §5 |
| 镜头/人物/场景拆解不合格 | 分镜必须是**强 schema 数据结构**,角色/场景是外键引用的资产库,LLM 只填枚举字段 | §2 |
| 没有运镜、没有镜头感 | 视听语言有现成语义表:景别×情绪、运镜×情绪、转场×叙事功能 | §3 |
| 动效平庸 | 有可直接执行的动效原则(ease-in/out、overlap、staging、follow through) | §7 |
| 数据变化表现呆板 | counter/图表/kinetic typography 有成熟手法清单 | §7 |

---

## 1. 全景工作流:六段式管线

```
剧本(文字层) → 分镜(结构层) → 资产设定(设定层) → 生图(帧层) → 生视频(动态层) → 后期(合成层)
```

开源项目 pipeline 的五条共识([ai-shortVideo-pipeline](https://github.com/myccarl/ai-shortVideo-pipeline)、[Seedance2-Storyboard-Generator](https://github.com/liangdabiao/Seedance2-Storyboard-Generator)、[story-flicks](https://github.com/alecm20/story-flicks)):

1. **分镜是结构化 JSON,不是散文**——可校验、可单镜重生成
2. **角色/场景/风格独立建模、跨镜复用**——资产库先行
3. **单镜可独立重生成**,不重跑全片(与我们的镜级缓存同构)
4. **一致性 = 锚点注入 + 参考图 + 首尾帧,三件套**
5. **质量门控放在生图后、生视频前**——帧层返工分钟级,动态层返工烧钱

两条返工经济学铁律(与我们现有"文字层返工分钟级、分镜层返工全表重排"的定稿门禁同构):

- **越靠前的层越便宜**:剧本改一行 < 分镜重排 < 重摇一张图 < 重生成一段视频
- **每层定稿后才许进下一层**;带后门(局部返修)但禁止跨层大返工

---

## 2. 剧本 → 分镜:分镜是数据结构,不是散文

### 2.1 强 schema(SceneShot)

综合 [ai-shortVideo-pipeline 的 pydantic schema](https://github.com/myccarl/ai-shortVideo-pipeline/blob/main/layers/L2_creative/schemas.py) 与中文社区分镜表([OSCHINA AI漫剧分镜](https://my.oschina.net/u/3748291/blog/19760389)):

| 字段 | 说明 | 约束 |
|---|---|---|
| `scene_no` / `shot_no` | 场次/镜号 | 全片唯一 |
| `narration_segment` | 该镜对应的旁白段 | 字数硬表(见 2.2) |
| `duration_sec` | 预估时长 | **≤10s**(动作超时强制拆镜) |
| `character_ids` | 出场角色 | **外键校验:必须在 characters 资产库中** |
| `environment_id` | 场景 | 外键校验:environments 资产库 |
| `time_of_day` | 时段 | 枚举(影响光线) |
| `subject_action` | 主体动作 | 写"慢",因果链用"然后/立刻/紧接着"串联 |
| `subject_emotion` | 情绪 | 枚举 |
| `wardrobe` / `key_props` | 服装/关键道具 | 引用 props 资产编号 |
| `camera` | 景别+角度+运镜 | **每镜一种镜头语言,不重复** |
| `lighting_mood` | 光线氛围 | 枚举或冻结风格块内选 |
| `composition` | 构图 | rule of thirds / centered / negative space… |
| `transition_out` | 出转场 | 引用 §3.4 转场表 |
| `sfx` | 音效点 | 显式,含"静场也写一个声音" |
| `end_frame_desc` | **尾帧描述** | 该镜结束时画面停在哪——下一镜的衔接锚 |

### 2.2 旁白字数硬表(防音画漂移)

来自 [ai-shortVideo-pipeline schemas.py](https://github.com/myccarl/ai-shortVideo-pipeline/blob/main/layers/L2_creative/schemas.py):

> 2.5s ≤ 20 字 · 5s ≤ 40 字 · 10s ≤ 82 字

旁白字数与时长硬绑定,分镜定稿即校验——这是"来回来去配音对不上"的根治法。

### 2.3 素材编号 + @引用 + 尾帧链式

[Seedance2-Storyboard-Generator](https://github.com/liangdabiao/Seedance2-Storyboard-Generator) 的三段式分镜:

- 资产编号:**C=角色 / S=场景 / P=道具**,分镜 prompt 中用「参考@图片1」引用,不复述外观
- 每镜独立一段「时间轴 prompt」(0-3s / 3-6s…),人物处只写"@图片1 伸手取伞"
- 每镜末尾写**尾帧描述**,作为下一镜的首帧锚点,链式衔接

### 2.4 分镜拆解纪律(中文社区实战)

- 单镜 ≤10s,长动作强制拆分([博客园 AI短剧全攻略](https://www.cnblogs.com/wuuu/p/19095969))
- **相邻镜头组必须换空间开场**——两镜同构图同机位必跳
- 写完剧本先列「人物×场次」表,按表挂参考图([CSDN 即梦六步工作流](https://blog.csdn.net/2601_97073519/article/details/166855488))
- 每格分镜写清"本镜结束时停在哪",否则下一镜接不上

---

## 3. 视听语言:导演课速成

### 3.1 景别 × 情绪

| 景别 | 英文/prompt 词 | 情绪功能与时机 |
|---|---|---|
| 大远景 | extreme wide / establishing shot | 开场定地理与尺度,人物渺小/孤独;章节重启 |
| 远景 | wide shot | 语境交代,"呼吸缓冲" |
| 中景 | medium shot | 对话主力,身体语言与环境平衡 |
| 近景 | medium close-up | 情绪开始聚焦 |
| 特写 | close-up | 戏剧主力,情绪浓度最高 |
| 大特写 | extreme close-up | 眼睛/手指,最大张力 |
| 插入 | insert shot | 道具/屏幕/文字,传递剧情信息 |

法则:**情绪能量越高镜头越紧,越低越宽**([StudioBinder](https://www.studiobinder.com/blog/types-of-camera-shots-sizes-in-film))。

### 3.2 运镜 × 情绪(每条含滥用警告)

| 术语 | 中文 | 情绪功能 | 滥用警告 |
|---|---|---|---|
| push in | 推近 | 专注、紧张升温 | 关键台词才推,别每镜都推 |
| pull out | 拉远 | 揭示、孤立、告别 | 只做"结论感" |
| pan / tilt | 摇/俯仰 | 扫描空间、reveal | 写起点终点,匀速=监控感 |
| tracking shot | 跟拍 | 跟随主体 | 与主体速度匹配 |
| arc / orbit | 环绕 | 英雄时刻、产品展示 | 全片环绕=廉价 |
| crane up/down | 升降 | 宏大开场/收束 | 短片一次足够 |
| dolly zoom | 滑变 | 认知冲击 | 只用于"世界翻转"时刻 |
| whip pan | 甩镜 | 能量、硬转场 | 连用≤2 次 |
| handheld | 手持 | 纪实、临场 | 数据片慎用 |
| FPV / aerial | 穿越/航拍 | 沉浸开场钩子 | 产品片仅开场用 |
| locked / static | 固定机位 | 稳定叙事 | **"The camera remains still."**(否定词的正面替代) |

总警告:**全片持续运动等于没有运动;每个运镜必须有叙事动机**([StudioBinder 运镜总表](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film))。

### 3.3 转场 × 叙事功能

| 转场 | 功能 |
|---|---|
| cut on action 动作中切 | 掩盖剪辑点,保持动量(默认转场) |
| match cut 匹配剪辑 | 形状/概念相似,制造隐喻 |
| J-cut / L-cut | 声音先入/延续,情绪锚定 |
| speed ramp 变速 | 强调关键瞬间 |
| whip transition 甩转 | 接甩镜的硬转场 |

([Adobe 剪辑语言](https://www.adobe.com/creativecloud/video/post-production/cuts-in-film.html))

### 3.4 节奏(具体数字)

- ASL(平均镜头长):电影感 5-8s ≈ 全片 15-25 镜;广告节奏 1.5-3s ≈ 40-80 镜([Filmmakers Academy](https://www.filmmakersacademy.com/glossary/average-shot-length-of-films))
- 节奏曲线:**开场 establishing 最长(5-8s) → 信息段 2-4s → 能量峰 1-2s → 呼吸缓冲 3-5s → 高潮最短(≤1.5s) → 收尾回到 4s+**;严禁匀速剪切

### 3.5 电影感来源(可数字模拟的清单)

24fps+180° 快门运动模糊 · 浅景深分离主体 · 细颗粒 · Letterbox(2.39:1 宏大 / 1.85:1 亲密)· Anamorphic 横向光斑+椭圆 bokeh。

---

## 4. 资产设定:角色 / 场景 / 风格

### 4.0 第 0 步永远是风格锚点

[腾讯云商业级流程](https://cloud.tencent.com/developer/article/2697299):项目启动先定义「项目风格锚点」一次、全局复用——**风格锚点三选一**:固定 sref code(MJ)/ 自训风格 LoRA / 固定一张风格参考图走 IP-Adapter style 通道。然后每条 prompt 开头放**冻结风格块**:

> 媒介 + 镜头 + 光线 + 调色(不变的部分)

逐镜只换:场景/机位/动作(变的部分)。

⚠️ **seed 锁定基本无效**——官方明确 seed 是起始噪声,不能锁风格或角色([MJ 官方文档](https://docs.midjourney.com/hc/en-us/articles/32604356340877-Seeds));一致性靠参考机制 + 重复的详细 prompt,seed 只用于同 prompt A/B 对照。

### 4.1 角色设定:Character Sheet 五步([Scenario 指南](https://www.scenario.com/blog/generate-character-turnarounds-scenario))

1. **定妆 Hero 图**:1 张高质量正面主图(高清、光线干净)
2. **三视图 turnaround**:`character reference sheet, front view, 3/4 view, side profile, back view, white background, full body`
3. **修版**:inpainting 校正五官、服装细节,确保各视图自洽
4. **建身份锚**:三选一——定妆图喂 PuLID / --oref;或裁图训 LoRA;或存为风格+角色双参考
5. **逐镜生成**:冻结风格块 + 角色锚 + 机位光线,生成后过 FaceDetailer

### 4.2 角色卡「不可变特征」写法([腾讯云](https://cloud.tencent.com/developer/article/2697299))

- 用不可变特征列表:「银白短发(长度到下颌线)、左眼下泪痣、黑丝带耳饰」
- 服装不写"保持一致",写**结构级描述**:「版型一致(领口形状/袖口结构/腰线位置/披肩长度保持一致)」
- 视频层加**不可变宣言**:「服装版型全程不变,不出现新增配饰、不改变发型、不修改服装剪裁」
- 多角色:每角色单独一句「\<苏棠\>对应@图片1,只采用外貌、发型和服装」,结尾加「两人的外貌、服装、站位和台词不互相交换」(即梦官方规则:参考主体 1-8 个最稳)

### 4.3 场景图模板([Nano Banana Pro 实践](https://cloud.tencent.com/developer/article/2697299))

> [风格锚点含色调]。[镜头类型]的[场景主题]。[空间结构与纵深]。[关键物件与细节]。[光线来源与方向],[光质与色温]。[氛围与情绪]。[画幅],[质量词],[禁止项]

场景空镜**必须写"无人物"**;场景图与角色图分开设,生成时分镜引用。

### 4.4 一致性技术选型

| 方案 | 成本 | 一致性 | 适用 |
|---|---|---|---|
| MJ --oref(V7) | 订阅 | 强(`--ow` 400 增强像似,过高反劣化) | 单主角快速出图 |
| Flux/SDXL 角色 LoRA | 15-30 张图+训练 | **最强** | 固定主角的多镜生产 |
| PuLID(-Flux) | 免费 | 接近 InstantID 且姿态自由度高 | **影视关键帧首选免训练方案** |
| InstantID | 免费 | 高保真但锁姿态表情 | 严格按定妆照复刻 |
| IP-Adapter FaceID v2 | 免费 | 中,风格兼容最好 | 与风格 LoRA 叠加 |
| ReActor 换脸 | 免费 | 后处理兜底 | 面部漂移最后一道工序 |
| StoryDiffusion / Phantom | 免费 | 连续叙事图 / 1-3 图锁主体 | 连续分镜序列 |

(来源:[MJ Omni Reference 文档](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference)、[PuLID vs InstantID vs FaceID](https://aiofm.info/en/guides/pulid-vs-instantid-vs-faceid)、[Flux LoRA 训练](https://sanj.dev/post/train-stable-diffusion-lora-self-portraits))

---

## 5. 生图工程:首帧质量是全片的下限

### 5.1 首帧七要素模板([博客园](https://www.cnblogs.com/wuuu/p/19095969))

```
{景别},{角色外观(引用资产)},{主体静态描述},{环境场景},{情绪氛围},{视觉风格(冻结风格块)},{光影效果}
```

三条原则:
- **首帧只写构图不写动作**——动作描述对生图无意义,只描述静态瞬间
- **适度模糊**——写太细 AI 反而乱加东西;留负空间给运镜余地([Runway](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide))
- 英文逗号短语式书写,句号会把语义切段导致后半降权

### 5.2 电影感词汇表(实测有效——模型在摄影语料上训练,术语=真实摄影信号)

- **镜头**:`35mm lens`(环境叙事)、`85mm f/1.4`(人像压缩+浅景深)、`anamorphic lens flare`、`shot on ARRI Alexa`
- **光线**:`Rembrandt lighting`(最可靠)、`golden hour`、`chiaroscuro`、`rim light`(主体分离)、`low-key`
- **胶片/调色**:`shot on Kodak Portra 400`(去塑料感第一词)、`35mm film grain`、`teal and orange grading`
- **构图**:`rule of thirds`、`negative space`、`shallow depth of field`、`dutch angle`
- **去 AI 味**:正向 `imperfect skin, visible pores, candid expression, subtle asymmetry`;负向 `plastic skin, airbrushed, CGI, 3d render`;MJ 加 `--style raw`([drawstory.ai](https://drawstory.ai))

### 5.3 分辨率与 upscale

- 首帧按 **1344×768**(精确 16:9、模型友好)生成,别直接 1920×1080——视频模型会裁切拉伸([Kling 官方](https://kling.ai/blog/ai-image-to-video-quality-optimization-guide))
- Upscale 链:SUPIR(开源创意增强,Magnific 平替)→ Topaz(保真收尾);Magnific=幻觉细节,Topaz=保真

### 5.4 翻车诊断与修法(先修后摇)

| 翻车 | 系统性修法 |
|---|---|
| 手部崩坏 | ADetailer/手部模型(~90% 成功率)→ 无效再手动 inpaint;根源上避免「手部特写+复杂手势」构图 |
| 面部漂移 | ReActor+crop&stitch 换脸兜底;PuLID 提权重;避免 CodeFormer 强度过高(改身份) |
| 文字乱码 | 用图像编辑模型改字,**不重摇**;或构图阶段避开文字区 |
| 构图失控 | ControlNet(depth/canny/pose)锁构图 |
| AI 味过重 | 换写实模型 / `--style raw` + Portra + 颗粒;负向词救不了风格化模型 |
| 多人双胞胎 | 每人名字后标参考图编号;>4 人分组生图再合成 |

### 5.5 验收标准与抽卡成本现实

**每镜出 3-4 变体 + 1 张对照样**,验收五查:人脸与定妆 sheet 相似度、五指完整、文字区干净、风格块生效(色温/颗粒)、与上镜的色彩连续性。

**决策树:先修(inpaint/换脸/局部重绘)→ 再重摇(同 prompt 变体)→ 最后重写 prompt**。重摇只在构图级失败时进行。

成本现实(中文团队实测, [博客园](https://www.cnblogs.com/wuuu/p/19095969)、[知乎漫剧案例](https://zhuanlan.zhihu.com/p/2037933030094934966)):
- 熟练者 ~5 次出一镜(成片率 ~20%),新手十次以上——**来来回回好几遍是生态常态,解法是把变量压少(资产锚定),不是期待一次命中**
- 视频环节成本:即梦 Pro 10s 约 10 元、可灵大师版约 20 元;控本关键 = 前置剧本分镜质量 + 降抽卡

### 5.6 审-修-锁:审核环编排(2026-11-07,「多次生成不满意」的解法)

逻辑内核(带规范审,不是审得勤):**规范先于生成**(评审对照显式清单,没有清单的「不满意」= 随机游走)、**生成与评审分离**(生成是抽样,评审是判别——把宝从「摇中」改到「摇一次、量一次、修一次」)、**失败分类**(构图级→重摇 / 局部缺陷→inpaint / 系统性漂移→停下修 prompt·资产层)、**停止线**(每轮只动一个变量,超 10 摇 = 系统性问题)。

**环的编排:**

1. **锁**——风格块 + 定妆身份锚 + 构图 brief 先冻结。**铁律:基准 = 规范,永远不是上一张图**;胜者只继承构图,身份与风格每轮回规范重新锚定(否则逐代漂移,身份锚被冲掉)
2. **草**——草稿档(低步数/低清/草图模型)毛坯图 2 选 1 锁构图,成本 ≈ 成图 15%,赛后在草稿档;与 animatic「先简后精」同哲学
3. **精**——成图档只出一对:冠军 vs 挑战者(同构图同规范),五查定胜负,胜者交付,败者**不进基准**
4. **修**——不过五查先分类:局部缺陷(手/文字/脸)走 inpaint ≤2 次,重摇只留给构图级失败;修不好 → 停,按 §5.4 系统性修法
5. **账**——摇修账本:每资产记摇数/修数/失败类,>10 触发系统性排查

**Token 账(每资产,成图=1)**:纯重摇 ~5.0(成片率 20% 的代价)< 全迭代锦标赛 ~7.0+(每轮 ×2 几何增长,禁用)< **审-修-锁 ~3.3**(草稿 0.15 + 一对 2 + 修复 ~1.2)。贵的变量是重摇,不是审核——审核是 LLM 判别(对照五查看图),几乎不计。迭代发生在修复层,不发生在锦标赛层。

---

## 6. 生视频工程:图管"是什么",prompt 管"动什么"

### 6.1 各家 prompt 公式(官方指南核实)

| 模型 | 公式 | 来源 |
|---|---|---|
| Sora 2 | 场景散文 + Cinematography(shot/lens/lighting/mood) + **Actions 逐"拍"列出** + Dialogue 块 + Background Sound | [官方 Cookbook](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide) |
| Runway Gen-4 | 图生视频**只写运动**,按"主体运动→镜头运动→场景运动→风格"叠加,模板 "The camera [motion] as the subject [action]" | [官方指南](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide) |
| Veo 3.1 | Cinematography→Subject→Action→Context→Style & Ambiance | [Google 官方](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) |
| Kling 3.0 | Scene→Characters→Action→Camera→**Audio&Style**(音频写进 prompt);≤125 字符可控性最佳 | [lanshu 整理](https://github.com/cclank/lanshu-awesome-ai-video-kit/blob/main/methodology/09-kling-公式.md) |
| 即梦 | 主体+场景+动作+运镜+氛围 | [官方](https://jimeng.jianying.com) |
| Hailuo | 一句可读镜头=主体+可见动作+场景+一个运镜,方向词 `[Push in]` 置于句首/尾 | [Prompt Handbook 整理](https://minimax-ai.chat/guide/hailuo-video-prompts) |

**图生视频铁律(Sora/Runway/Pika 三家一致)**:首帧图只负责"是什么",prompt 只写"接下来发生什么"——**复述图中细节会降低运动量**。

### 6.2 运镜写法三原则(各家共识)

1. **每镜头一个运镜 + 一个主体动作**——多运镜多动作必崩
2. **速度+方向显式**:`slow push-in`、`pan from left to right`
3. 运镜与画面内既有运动线索一致(首帧图有尘雾/运动模糊时,先清图再加运镜)

### 6.3 多镜衔接

- **短切优先**:两段 4s 剪辑优于一段 8s(Sora 官方结论)
- **首尾帧链**:Veo 用图像模型造首/尾帧,prompt 写转场动作;即梦勾「使用尾帧」;Seedance 用尾帧描述链式
- **时间戳脚本**(单次生成内多镜头):Veo `[00:00-00:02]` 分镜块,每块一个机位+一个动作;Kling `[Shot 1: Wide shot]…`
- 延长拼接防跳变:**前段删尾 6 帧+后段删头 1 帧**;续写以"切镜时刻"结尾([火山方舟 12 问](https://github.com/cclank/lanshu-awesome-ai-video-kit/blob/main/methodology/08-避坑12问.md))
- 角色描述**逐字复用**跨镜(Sora);灯光逻辑跨镜一致

### 6.4 音频

- Veo:台词引号 + `A woman says "…"`;SFX 前缀;`Ambient noise:` 前缀
- Sora:台词独立 Dialogue 块标注说话人;4s 镜头只容 1-2 句短对白;**静场也写一个声音做节奏锚**("distant traffic hiss")
- 台词口型:海螺/可灵支持多语言对口型

### 6.5 官方 don't 清单(汇总去重)

1. **不用否定句**(Runway 无负向);Veo 支持但要描述场景而非罗列
2. 不写抽象概念词("magic/joyful"→改写成可见物理动作)
3. 不复述首帧图内容;不用对话式指令
4. 不堆多个运镜/多主体同时动作——崩了就「**冻机位、简动作、清背景**」逐层加回(Sora)
5. 避免模糊词:"beautiful street"→"wet asphalt, zebra crosswalk, neon signs reflecting in puddles"
6. 禁词防崩(中文):「不能出现拖影、重影、闪烁、局部融化、五官漂移、服装变形或背景跳变」+ 负面必加「毁容、面部扭曲、肢体变形」

---

## 7. 数据与动效:确定性动效的正确打开方式

> 这是 Remotion 管线的强项。**用户裁定（2026-11-08，某长片首渲复盘）：数据动效是必要项，不是加分项——静态的数字与图表一帧展示最终值＝没有过程＝没有冲击力＝违规**。凡分镜出现量（计数/帧数/秒数/百分比/进度），motion-spec 必须有对应数据令牌，覆盖矩阵走查同核；缺令牌＝UE 大师未交付。唯一例外见 §7.5「量才滚，标识不滚」。

### 7.1 数字滚动(counter)

1. ease-out 落定精确值,**不 overshoot**
2. **tabular figures 等宽数字**防抖动
3. odometer 逐位滚动 + 个十百位 stagger
4. 0.5-2s 完成,保留千分位格式
5. Remotion:`spring()` + `interpolate` 映射([官方文档](https://www.remotion.dev/docs/interpolate))

### 7.2 图表动画

1. 入场 300-800ms cubicOut:柱从基线生长 / 线 draw-in / 环 sweep 角度
2. 数据切换用 **morph 过渡**而非重绘([ECharts data-transition](https://echarts.apache.org/handbook/en/how-to/animation/data-transition/))
3. **动画数值通道本身**,不只动 opacity
4. 坐标轴先稳定再动数据
5. 排名流动叙事(bar chart race)是数据片最强钩子([Flourish](https://flourish.studio/visualisations/bar-chart-race) 为对标)
6. Remotion 实现基元(2026-11-10 增补):线 draw-in=`@remotion/paths evolvePath`(真长度驱动,**禁猜 pathLen**——v3 实证 13 处猜值=起步死区+变速扭曲);morph=`interpolatePath`;有机运动=`noise2D`;数字滚动=spring+interpolate。令牌→基元决策表查技能 `remotion-capabilities.md` §1

### 7.3 动效原则(可直接执行)

1. 入场 ease-out、出场 ease-in;UI 级 200-350ms spring(Linear 体系,[designlang.app/motion](https://designlang.app/motion))
2. **Overlap 错峰**:同屏元素间 30-80ms 延迟,严禁同时启动
3. **Follow through**:主元素到位后,附属元素(阴影/角标/刻度)继续收敛 1-2 帧
4. **Anticipation**:大位移前先反向预备几帧
5. **Staging**:同一时刻只有一个视觉焦点;数字滚动时其余全部静止
6. Kinetic typography:按语义组 stagger(词组间 30-80ms),mask 逐行 reveal;运动必须服务信息强调,拒绝装饰性飞字
7. **每个动效回答"为什么动"——无动机即删除**

### 7.4 对标作品

Apple 发布会数据页(一镜一焦点、超大数字+产品特写交替)· Stripe 官网动效 · Linear(动效纪律标杆)· Kurzgesagt(1-2s 快切+画面内持续运动)· Wendover(图表化叙事)· Flourish bar chart race。

### 7.5 数据令牌命名与落定纪律(2026-11-08 历程片实证)

- **令牌五件**(命名进 motion-spec,代码落 motion-tokens.ts):`NUM-ROLL`(0→N ease-out ~40f,tabular-nums 防抖)/`NUM-ODOMETER`(逐位滚动,右先左后,机械计数器质感)/`NUM-SLAM`(双数同滚同停,末帧 1.05→1 落定——「两数相等」的对比句自带动作)/`CHART-GROW`(条形基线错峰生长,线随后浮现)/`CHART-DRAW`(折线 stroke-dashoffset 从左往右描画,条形跟随揭示)
- **量才滚,标识不滚**:run 号/时间戳/ID 是身份,滚了反而假;帧数/计数/秒数/百分比是量,必滚
- **落定对音点**:数字落定的那一帧对齐音效点(咔哒/印章/递进音)——数据动效的「钩」在落定瞬间
- 时长与显著性成比例:计数母题的收官数(如全片「11 版」)逐版快滚(每版一跳、越跳越快),普通量 40f 即可;图表入场遵守 §7.3 Overlap 错峰
- 实证:历程片首渲复盘 retrofit 9 镜(s02/s07/s11/s23/s27/s28/s29/s30/s36),帧数/分镜零改动、CI 子集一次重渲——**数据令牌应在 motion-spec 期就位,retrofit 是补救不是流程**;分镜师排「画面」列时即注明数据变化方式(从几滚到几/图表类型)

---

## 8. 工具矩阵(2026-11 时点)

| 环节 | 推荐 | 备注 |
|---|---|---|
| 剧本/分镜 | Claude(实测拆分镜最稳)、豆包、DeepSeek | LLM 只填 schema 字段 |
| 生图 | MJ V7(--oref/--sref)、Flux(+LoRA)、即梦(免费额度大)、Seedream、Nano Banana Pro | 一致性选型见 §4.4 |
| 图生视频 | 可灵(表现力最强,易用力过猛)、即梦 Seedance(均衡可控)、Vidu(细腻)、海螺(口型强) | 电影感组合:可灵+Luma |
| 配音 | MiniMax 海螺语音(情感好)、剪映(覆盖 80% 日常)、ElevenLabs(专业多角色) | 注意商用授权 |
| BGM/SFX | incompetech 等 CC-BY(现有做法正确)+ 剪映音效库 | 署名清单随片交付 |
| 剪辑/合成 | 剪映 / ffmpeg(现有管线) | — |

GitHub 方法论仓库:[lanshu-awesome-ai-video-kit](https://github.com/cclank/lanshu-awesome-ai-video-kit)(604 条 prompt+21 篇 SOP)、[awesome-short-drama-skills](https://github.com/UnderleveledBuilder/awesome-short-drama-skills)(83 个剧本/分镜 skill)、[smixs/visual-skills](https://github.com/smixs/visual-skills)(agent 版"AI 导演"技能:Murch 剪辑理论/蒙太奇)。

---

## 9. 失败模式总表(全来源汇总)

| # | 失败模式 | 解法 | 章节 |
|---|---|---|---|
| 1 | 人物 ID 跨镜漂移 | 定妆图+PuLID/oref/LoRA;另备大头照作人脸参考;角色描述逐字复用 | §4 §6.3 |
| 2 | 多人双胞胎 | 每人标注参考图编号;>4 人分组生图 | §4.2 |
| 3 | 风格跨镜漂移 | 冻结风格块前缀;sref/风格 LoRA;参考图先转目标风格 | §4.0 |
| 4 | 手部/五官崩坏 | FaceDetailer/ADetailer 先修;避免手部特写构图 | §5.4 |
| 5 | 运镜崩坏 | 一运镜一动作;速度方向显式;「冻机位、简动作、清背景」降级法 | §6.2 §6.5 |
| 6 | 动作僵硬夸张 | 动作写"慢";因果链连接词;禁主观词 | §2.1 |
| 7 | 音画漂移 | 旁白字数硬表;台词显式;静场写声音 | §2.2 §6.4 |
| 8 | 拼接跳变 | 首尾帧链;删尾 6 帧+删头 1 帧;相邻镜换空间开场 | §2.4 §6.3 |
| 9 | 字幕/水印乱入 | 约束词显式「不要字幕」「无背景音乐」 | §6.5 |
| 10 | 复用性差导致全片重摇 | 强 schema + 资产库 + 单镜独立重生成 | §1 §2 |
| 11 | seed 迷信 | seed 只做 A/B 对照;一致性靠参考机制 | §4.0 |

---

## 10. 落地路线:shadow-dev-video 升级建议(待评审)

现管线(Remotion 确定性渲染)+ 本文档方法论,建议按三层升级,**混合渲染策略**是关键决策:

### 10.1 混合渲染策略(核心决策)

| 镜头类型 | 渲染方式 | 理由 |
|---|---|---|
| 数据动效/counter/图表/文字 | **Remotion(保持现有)** | 确定性、可编辑、镜级缓存 |
| 人物/场景叙事镜头 | **AI 生图首帧 +(可选)图生视频** | AI 生成有"生命感";Remotion 画不出人物 |
| 混合镜 | AI 首帧/背景板 + Remotion 前景动效叠加 | 两者优势叠加,且首帧可复用为资产 |

### 10.2 三层升级

- **A · 资产层(新增)**:`materials.md` 之外新增 `characters.md` / `environments.md` / `style-anchor.md`(冻结风格块+定妆图+三视图),进素材仓;生图走 bailian-gen 或 MJ/Flux,产出物入库到 `videos/<slug>/assets/characters/` 等
- **B · 分镜 schema 升级**:storyboard.md 的逐镜表扩为 §2.1 的强 schema(camera/lighting/composition/end_frame_desc/environment_id/character_ids 外键),`shots-manifest.json` 增加视觉资产引用字段——分镜师 subagent 按 schema 填表,导入脚本做外键与字数校验(`environment_id`)
- **C · 生图-生视频子管线 + 门控**:每镜 3-4 变体 → 验收五查(§5.5)→ 先修后摇;生图后加质量门控再进视频/动效层;返工只动单镜(与镜级缓存同构,零管线改动)

### 10.3 分阶段落地(先小后大)

1. **先只做资产层+首帧生图**:AI 出首帧/背景板,动效仍全 Remotion——风险最低,直接解决"生图效果差"(资产锚定+验收决策树)
2. 验证生图质量稳定后,再引入图生视频片段(转场镜/氛围镜)
3. 最后考虑 AI 音频(台词/SFX)——现有 TTS 管线已够用

---

## 附:来源索引

- 开源管线:[MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)(~140k★) · [NarratoAI](https://github.com/linyqh/NarratoAI) · [ai-shortVideo-pipeline](https://github.com/myccarl/ai-shortVideo-pipeline) · [Seedance2-Storyboard-Generator](https://github.com/liangdabiao/Seedance2-Storyboard-Generator) · [story-flicks](https://github.com/alecm20/story-flicks) · [Index-anisora(B站)](https://github.com/bilibili/Index-anisora)
- 官方指南:[Sora 2 Cookbook](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide)(质量最高,唯一全谱系) · [Runway Gen-4](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide) · [Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) · [Kling](https://kling.ai/blog/kling-ai-prompt-guide) · [MJ Docs](https://docs.midjourney.com)
- 中文实战:[腾讯云五大模型跑通同角色](https://cloud.tencent.com/developer/article/2697299) · [博客园 AI 短剧全攻略](https://www.cnblogs.com/wuuu/p/19095969) · [CSDN 即梦六步](https://blog.csdn.net/2601_97073519/article/details/166855488) · [知乎·当 AI 开始导演](https://zhuanlan.zhihu.com/p/1986121846601573302) · [知乎·木子瑞三视图](https://zhuanlan.zhihu.com/p/1887821957254329621)
- 视听语言:[StudioBinder 景别](https://www.studiobinder.com/blog/types-of-camera-shots-sizes-in-film) / [运镜](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film) / [蒙太奇](https://www.studiobinder.com/blog/soviet-montage-theory) · [Adobe 剪辑](https://www.adobe.com/creativecloud/video/post-production/cuts-in-film.html) · [Filmmakers Academy ASL](https://www.filmmakersacademy.com/glossary/average-shot-length-of-films)
