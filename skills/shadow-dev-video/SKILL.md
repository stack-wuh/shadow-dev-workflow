---
name: shadow-dev-video
description: wuh.site 视频工作室制作流程——从需求到成片的两段式管线（前期五件套 → 正式制作 → CI 渲染出片 → 旁白/字幕/配乐终混）。触发词：做视频、宣传片、剧本、编剧、分镜、animatic、出片、视频工作室、渲染、旁白、字幕、配乐、BGM、终混。
---

# Shadow Dev Video — 视频制作流程

为 wuh.site.video 视频工作室制作长片（≥2min）。两段式：前期定稿后再正式制作，避免在错误叙事上烧动效工时。素材仓库：`github/wuh.site.video`（工作室三层结构，见其项目内知识卡）。

> **渲染只在 GitHub Actions。** 本机（8 核 / 16GB 集显）跑不动 Remotion，本地起渲染会把机器堵死（实测 88 个僵尸 chrome-headless、一条跑了 2h50m 占 82% CPU，导致后续抽帧全部 SIGSEGV）。本机只允许：文本处理、音频处理（ffmpeg/sox/python+numpy）、git、`gh`、读 CI 产物抽帧。

## 两段式管线

### 第一段 · 前期制作（一个 change）
1. **素材库** `materials.md`：真实素材全溯源——站点源码细节 / 线上 API 数据 / 人文金句，每节标注来源与抓取日期
2. **剧本** `script.md`：编剧 subagent 产出——叙事轴（含真实时间线对账与顺序取舍，如情感蒙太奇非编年须显式声明）、幕结构、情绪节奏曲线、逐幕梗概、全片文案与金句使用规划（每处标注素材编号）。只定「讲什么、按什么情绪讲」，不碰帧数与镜头语言。**交用户评审定稿后才许进分镜**——文字层返工分钟级，分镜层返工是全表重排
3. **分镜脚本** `storyboard.md`：分镜师 subagent 产出——把定稿剧本镜头化：逐镜表（镜号/画面/镜头语言/文案/时长/转场/音效点）+ 帧数对账表（各幕相加 = 总帧数，30fps）；文案照抄剧本不改写，叙事要动回剧本层先改剧本
4. **动效规范** `motion-spec.md`：UE 动效大师 subagent 产出——令牌化（曲线/弹性/镜头/粒子/转场/调色）+ 全镜覆盖矩阵（每镜入场/持续/出场/转场必有令牌）
5. **Animatic 分镜板**：真实内容单色简板（**不是空框**）预演节奏，渲染后交用户评审定稿

用户定稿 → 在素材仓检出父目录执行 `node wuh.site.video/scripts/shots.mjs import` 一次性导入生成 `shots-manifest.json`（帧数唯一机器真源，此后改帧只改 manifest，storyboard 对账表由脚本反生成）→ 另立 change 进第二段。

### 第二段 · 正式制作（一个 change）
> 契约：镜级产出物规范（一镜一文件一 Sequence 一缓存），全文见本技能目录 `shot-spec.md`（2026-10-31 四项决策定稿）。
1. **令牌库先行**：`motion-tokens.ts` 落地规范全部令牌（曲线基元/弹性参数/节奏网格/调色/高频动效函数）
2. **逐镜全彩实装**：一镜一文件 `shots/sNN.tsx`（局部帧 0 起、自包含、不透明底、转场挂出镜尾帧+交接态协议），多镜可并行 subagent（独立文件零共享状态）；每镜照覆盖矩阵令牌实装；装配层只做 manifest 遍历 + ShotShell 全局视觉 + 音轨，禁镜内容
3. **配乐多轨**：CC-BY 曲目（incompetech 等）多段交叉淡化对拍，独立 `SiteFilmAudio` comp（镜渲染恒无音轨，SFX v1 冻结）；`public/<slug>/` 入库（staticFile 以 public/ 为根）；署名清单随片交付
4. **配音轨（配音师 subagent）**：走 `shadow-dev-tts` 管线（工具 `D:\works\qwen-tts`，Token Plan 端点与音色白名单实证见素材仓知识卡 `tts-voiceover-pipeline`）——**双声部设计**（讲述者/纸的声音，各只说该说的，不做解释性旁白）、**落点对位表**（人声只踩音乐回落谷/衰减尾/自然静默；高潮段与留白禁区一字不进）、逐句合成 + 按时间轴静音对齐整轨，人声轨与 BGM 各占一路进装配层 mux；配音文案改动必须同步字幕表与 storyboard 机器真源
5. **CI 渲染出片**（`.github/workflows/render-film.yml`，runner 钉 `ubuntu-24.04`）：`bundle`（预打包 + 校验单元 + 生成镜清单）→ `shots` 矩阵（一镜一 job，fail-fast 关）→ `assemble`（清点缺镜 → 拼接 → 三重终验）。
   - **派发必须带 `--ref <branch>`**：不带就跑默认分支 main（本次因此在 main 的旧 manifest 上渲出一支 245s / 38 镜的废片）
   - 单镜重跑：Re-run failed jobs；或 `workflow_dispatch` 传 `shots` 子集
   - 本机取回：`gh run download <run> -n <timestamp>-<slug> -D out/ci`，用 ffmpeg 按时间点抽帧验收（渲在云上、抽帧看结果，这才是「本地看片」的正确姿势）
6. **终混**：无声成片 + 旁白轨（adely 到正片起点）+ BGM 避让床 → `amix` → 限幅 → AAC；脚本 `scripts/mux-film.sh`

## 评审循环（云上出草片 → 本机抽帧看）

> 本机不开 Remotion Studio、不跑 `remotion still`。导演工作改为「推一版 → 拉下来抽帧 → 按时间点提意见」。

1. 推改动 → `gh workflow run render-film.yml --ref <branch> -f film=<slug>`
2. 等 15–25 分钟（40+ 镜并行）→ `gh run download` 取成片
3. 抽帧验收：按用户说的时间点 ±3s 取帧，另加 12–16 帧均匀抽帧拼 4×4 contact sheet，一次看全片构图与节奏
4. 用户反馈以「时间点 + 感受」为准（"3:59 收剑入匣太难看"）：先换算镜号（`帧 = (秒 − 4) × 30`，片头 4s），再定位组件
5. 单镜返工：`workflow_dispatch` 传 `shots: "s09 s11"` 只重渲那几镜

**别把「本地能出图」当验收**：本地抽帧受机器状态影响，同一帧可能渲出半成品；CI 出片才作数。

## 执行纪律（实战坑位，逐条必守；详见素材仓 render-stability-playbook）

- **本机不渲（第一铁律）**：所有渲染走 GitHub Actions。万一必须本地跑（用户明确要求），先清场：`lsof -ti :3211 | xargs kill -9`、`pkill -f chrome-headless-shell`、`pkill -f puppeteer_dev_chrome_profile`——僵尸 Chrome 是数小时连败与 SIGSEGV 的头号真凶（本次残留 88 个）
- **帧号只用局部**：Sequence 挂载后 useCurrentFrame 已是局部帧；镜内动画 `frame - shotStart`，禁止再减幕起点（六幕全军覆没的教训）
- **镜渲染确定性**：随机只 `random(seed)`，禁 `Date.now`/`Math.random`/渲染期网络请求——同 bundle 同帧同像素是镜级缓存成立的前提
- **长任务三禁**：禁阻塞等待（>3 分钟一律后台+轮询）；禁无心跳裸跑（`render-status.json` 的 `updatedAt` 是活/卡唯一判据，停更 120s=卡死即杀，同任务 3 轮止损后通知+停）；禁静默硬磨（每单元完成播报一行进度，会话级 45 分钟无进展停下汇报）。编排进程自身段错误（exit 139）由「退出必通知 + 缓存续跑 ≤3 次」外层保险丝兜底
- **改 N 处引用 grep 清零**；typecheck 必须跑出明确绿/红（静默失败=没验证），绿后才渲
- **全屏动画 radial-gradient 禁用**：本机 Chrome 确定性崩溃，用纯色 opacity 渐隐替代
- **渲染前 rm 旧产物**（防存在性检查假阳性）；渲染任务独占串行（防 pkill/端口互杀）
- **分块收敛梯**：长渲染连败 → 360f → 120f → 30f 细块逐级必收敛
- **终装必 CFR**（修拼接卡顿）；出片三重验证（帧数/video-audio 两路时长/分段音量）
- **音频素材验格式**：原站可能误发视频文件，afinfo/ffprobe 验后转 m4a；Audio startFrom ≤ 曲长 − 段时长

## v12 实战补遗（2026-11-07 · 《风陵 · 致郭襄》学到的，全部踩过）

### A. 时间轴三层真源，只认一层
`storyboard.md`（七列严格表，含「文案·字幕」与「转场（进入本镜）」列）→ `node scripts/shots.mjs import` → `shots-manifest.json`（**唯一机器真源**）→ `node scripts/shots.mjs sync`（生成 `manifest.ts` / `registry.ts` / `routes.tsx`）。
- 真源之外的时长写了就是错的：分镜抬头、剧本里的「总时长」都会过期，**只信 manifest**
- `import` 自带对账（各幕 Σ 帧 vs 幕表），对不上会红——**这条对账是资产，别绕过**

### B. Remotion 三个必炸的坑
1. **`useVideoConfig().durationInFrames` 在装配层是根时长**（如 9060），不是镜长。任何拿它算推进进度的组件，装进序列后推拉近乎静止（1.000→1.002）。镜内一律用**显式传入 `total` + `frame`** 的 `ShotScene/ShotSlide`。本次 21 镜中招，从上一版一直带着。
2. **`interpolate` 的 `inputRange` 必须严格递增**。写死淡入淡出窗（`[from, from+10, to-12, to]`）遇到短于 22f 的元素就变成 `[132,142,138,150]` → 抛 `inputRange must be strictly monotonically increasing` → 该镜三次重试全败 → 整片拼不出。**淡变窗按实际时长自适应**，并留 ≥1f 满亮度。
3. **兜底写在组件里，不能只写在数据校验里**：生成器警告 ≠ 渲染安全。

### C. 旁白：按镜铺，不按幕铺
- 错误做法：每幕从幕起点 +0.5s 顺序排，排到幕尾就停 → 句子逐幕漂移（实测最重 −16.17s）、幕尾空 4–13s、部分镜全静音、另一些镜凭空多句
- 正确做法：**行 → 镜**先建映射（分镜字幕列是逐字文案，`／` 分隔；字符串匹配为主，不中的按顺序 + 幕归属就近判定并登记），再在镜内顺序排（首句 +0.6s、句间 0.35s、末句 ≤ 镜尾 −0.25s；塞不下时压气口 → 溢出到下一镜并报告）
- 真人录音整段（开场 / 收尾）**不许切开重排**：静音段检测 + 归一化互相关对齐（r=1.000 说明就是音轨原样片段），只登记行级时间
- 铺完必核：每镜占用/占比、该静的镜是否全静、重叠=0、句间最小间隔、镜内偏移中位数

### D. 字幕：行级 + 跟人声
- 数据结构 `CAPTION_CUES: Record<shotId, CaptionCue[]>`，组件按 `useCurrentFrame()` 挑当前活跃一条；老写法 `<Caption text start end />` 保留兼容
- 落点由旁白反推：`start = 旁白start − 2f`、`end = 旁白end + 16f`，夹在 `[inSide+10, 镜长 − 下一镜 inSide − 10]`（墨洇单侧 20f）
- **一镜挤不下就丢后一句字幕，不要叠字**；跨镜句子在镜界切分；诗按原字、不改标点

### E. 配乐：cue 驱动的避让床，终混再叠加
- 旁白占时可能远超直觉（本次 62 条占 82.5%），先**量**再排：哪些空档够「站出」，其余托底/让位
- 避让参数：attack 120ms / release 500ms / 目标 −38 dBFS、前瞻随深度（0.22s + 28ms/dB）
- **单位坑**：淡入淡出函数把「秒」当毫秒算会静默失效（实测 24 条淡化只有 0.35–3ms ≈ 全硬切），用 `int(round(sec*sr))`
- 复用段落必须报「第几次听到 + 占全片百分比」；接缝查阶跃与零交叉；`amix` 后验峰值不削顶
- **BGM 床与画面解耦**：改配乐不必重渲视频，只重出床 + 重新 mux；改旁白则必须重算 BGM（避让点绑定 cue）

### F. 改结构（删镜 / 改时长）的影响链（按序执行，缺一步就翻车）
1. `storyboard.md` 删/改行 → 重算各镜起止窗与幕界 → 同步八幕表与各幕标题（`import` 会对账，不修就红）
2. `node scripts/shots.mjs import` → `sync`
3. **镜号整体前移**：`git mv` 改名，再批量改文件里的 `S<号>` 注释与 `<Caption cue="sNN" />`（漏了字幕就挂错镜）
4. 被分摊到帧数的镜：`TOTAL` + 关键帧节奏一起重排（只改 TOTAL 会「动作走完干等」）
5. 旁白重铺 → 字幕重算 → BGM 避让重算
6. 重渲 + 重新 mux
- **总时长不变的分摊法**：删掉一镜的帧数分给邻居，任何镜别超过 12s（本次 240f 拆成 +120/+120）

### G. 素材与隐私纪律（仓库是公开的）
- 不入库：真人照片原图、录音与克隆样本、参考图、**版权音乐**（`git rm --cached` + `.gitignore`；历史里仍可取出，彻底清除才做 `filter-repo`）
- 成片 mp4 通常 200MB+，**不进 git**（超单文件上限 + 含真人素材），放 Release 或本地交付
- 入库的是可复现的一切文本与图片：剧本、分镜、底图、组件、cue/lay/审计表、配乐方案、混音脚本

### H. 多 agent 并行的分工纪律
- 按幕切片（A1–A4 / A5–A8），一镜一文件、零共享状态；**禁止任何 agent 在本机起渲染**（否则僵尸 Chrome 把机器堵死，全员抽帧 SIGSEGV）
- 每个 agent 交付时自报：改了几镜、底图名逐个核对结果、有没有留旧组件、哪些是它自己判断的
- Lead 最后统一提交，提交前 `git status` 核对是否混入二进制/隐私文件

## 收尾

- 成片交用户验收 → 反馈微调只重渲对应段 → 定稿进 shadow-dev-review/release
- 新经验回写素材仓知识卡（video-production-flow / render-stability-playbook / tts-voiceover-pipeline），本技能引用卡片
- 配音坑位与音色白名单变更回写素材仓 `tts-voiceover-pipeline` 知识卡，与 `shadow-dev-tts` 技能双向同步
