---
name: shadow-dev-video
description: wuh.site 视频工作室制作流程——从需求到成片的两段式管线（前期四件套 → 正式制作 → 可视化渲染出片）。触发词：做视频、宣传片、分镜、animatic、出片、视频工作室。
---

# Shadow Dev Video — 视频制作流程

为 wuh.site.video 视频工作室制作长片（≥2min）。两段式：前期定稿后再正式制作，避免在错误叙事上烧动效工时。素材仓库：`github/wuh.site.video`（工作室三层结构，见其项目内知识卡）。

## 两段式管线

### 第一段 · 前期制作（一个 change）
1. **素材库** `materials.md`：真实素材全溯源——站点源码细节 / 线上 API 数据 / 人文金句，每节标注来源与抓取日期
2. **分镜脚本** `storyboard.md`：分镜师 subagent 产出——逐镜表（镜号/画面/镜头语言/文案/时长/转场/音效点）+ 帧数对账表（各幕相加 = 总帧数，30fps）
3. **动效规范** `motion-spec.md`：UE 动效大师 subagent 产出——令牌化（曲线/弹性/镜头/粒子/转场/调色）+ 全镜覆盖矩阵（每镜入场/持续/出场/转场必有令牌）
4. **Animatic 分镜板**：真实内容单色简板（**不是空框**）预演节奏，渲染后交用户评审定稿

用户定稿 → 另立 change 进第二段。

### 第二段 · 正式制作（一个 change）
1. **令牌库先行**：`motion-tokens.ts` 落地规范全部令牌（曲线基元/弹性参数/节奏网格/七幕调色/高频动效函数）
2. **逐幕全彩实装**：按 Act 拆文件，多幕可并行 subagent（独立文件零共享状态）；每幕照规范覆盖矩阵的令牌实装
3. **配乐多轨**：CC-BY 曲目（incompetech 等）多段交叉淡化对拍 90 BPM；`public/<slug>/` 入库（staticFile 以 public/ 为根）；署名清单随片交付
4. **可视化渲染出片**：`scripts/render-film.mjs`（节点仪表盘：清场→分段渲染→帧数校验→拼接→CFR 终装→音轨修复→终验，进度条 + 状态文件全程可见）

## 双模式工作法（设计模式 → 产出模式）

> 分镜拆分必须合理：**一镜一改、改完秒拼**，不为一个分镜重渲整段。核心效率设计。

### 🎬 设计模式（导演模式 · 调试期）
- **导演监视器**：`pnpm studio`（Remotion Studio）时间轴逐帧 scrub——像导演一样看到哪帧有问题，直接报帧号
- **镜级渲染**：从 storyboard 逐镜帧表生成 `shots-manifest.json`（镜号/起止帧/源文件/内容 hash），每镜独立渲染
- **热修循环**：改 scene 文件 → hash 变化 → 只重渲那一镜（收敛梯重试）→ ffmpeg 重拼全片（秒级）→ 立即看效果
- 迭代成本：单镜 2–5 分钟（对比整段重渲 30–40 分钟）
- 状态：设计目标（2026-10-25 提出），镜级管线代码待立项；当前过渡期用 `render-film.mjs` 分段级执行同一原则

### 🏭 产出模式（生产档 · 定稿后）
一条命令按生产档渲染（crf16 + CFR 终装 + 音轨完整链 + 三重终验）出成片，与设计模式共用镜清单与拼接器。

## 执行纪律（实战坑位，逐条必守；详见素材仓 render-stability-playbook）

- **渲染前清场是铁律**：`lsof -ti :3211 | xargs kill -9` + pkill 孤儿 Chrome——端口僵尸是数小时连败的头号真凶
- **帧号只用局部**：Sequence 挂载后 useCurrentFrame 已是局部帧；镜内动画 `frame - shotStart`，禁止再减幕起点（六幕全军覆没的教训）
- **改 N 处引用 grep 清零**；typecheck 必须跑出明确绿/红（静默失败=没验证），绿后才渲
- **全屏动画 radial-gradient 禁用**：本机 Chrome 确定性崩溃，用纯色 opacity 渐隐替代
- **渲染前 rm 旧产物**（防存在性检查假阳性）；渲染任务独占串行（防 pkill/端口互杀）
- **分块收敛梯**：长渲染连败 → 360f → 120f → 30f 细块逐级必收敛
- **终装必 CFR**（修拼接卡顿）；出片三重验证（帧数/video-audio 两路时长/分段音量）
- **音频素材验格式**：原站可能误发视频文件，afinfo/ffprobe 验后转 m4a；Audio startFrom ≤ 曲长 − 段时长

## 收尾

- 成片交用户验收 → 反馈微调只重渲对应段 → 定稿进 shadow-dev-review/release
- 新经验回写素材仓知识卡（video-production-flow / render-stability-playbook），本技能引用卡片
