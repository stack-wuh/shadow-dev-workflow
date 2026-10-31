# 镜级产出物规范（Shot Pipeline Spec）

> 状态：定稿 2026-10-31（四项决策见文末记录），**待 runtime 验证**——site-film 全量迁移 change 即验证场，验证通过后回写素材仓知识卡 video-production-flow。
> 适用：wuh.site.video 长片正式制作（≥2min）。本文件是 SKILL.md 第二段的展开契约。

## 0. 核心原则

**一镜 = 一文件一组件一 Sequence 一缓存。** 镜是唯一产物单元：改一镜只重渲一镜（约 1–3 分钟）+ 秒级拼接；改片长只重渲受影响镜，其余全缓存命中。装配层与渲染层永不出现「全片重渲」。

## 1. 目录契约

```
videos/<slug>/
  shots-manifest.json    # 帧数唯一机器真源（§2）
  shots/
    s01.tsx … sNN.tsx    # 一镜一文件，default export，局部帧 0 起（§3）
  components/            # 跨镜共享组件（CameraRig 等）
  motion-tokens.ts       # 动效令牌（前期 motion-spec 的代码落地）
  SiteFilm.tsx           # 纯装配：manifest 遍历 + ShotShell + 内联音轨，零镜内容（§4）
  SiteFilmAudio.tsx      # 音轨唯一事实源，独立 Composition（§4）
  routes.ts              # 生成物：manifest → 镜 comp + film comp + audio comp（§4）
```

镜文件命名 `sNN.tsx`：NN 与分镜镜号对齐，补零两位（≥100 镜升三位）。

## 2. shots-manifest.json——帧数唯一机器真源

```json
{
  "film": "site-film",
  "fps": 30,
  "totalFrames": 7200,
  "shots": [
    { "id": "s01", "act": 1, "title": "黑场微光",
      "startFrame": 0, "durationFrames": 220, "source": "shots/s01.tsx" }
  ]
}
```

- `startFrame` 由前缀和生成，**禁止手填**（防对账漂移）。
- 生成路径：分镜定稿 → `node scripts/shots.mjs import`（一次性解析 storyboard 逐镜表，此为 markdown 唯一被解析的时刻）；此后改帧只改 manifest → `node scripts/shots.mjs sync`（反生成帧数对账表贴回 storyboard，标注「生成区块勿手改」+ 重生成 routes.ts）。
- `node scripts/shots.mjs check` 校验 INV-S1/S2/S6，渲染前必跑。

## 3. 镜组件规则（铁律）

1. **不自带 Sequence**：装配层以 `<Sequence from={startFrame} durationInFrames={durationFrames}>` 包裹，Sequence 内 `useCurrentFrame` 天然从 0 起。`frame - 120` 式手算偏移被机制消灭（Act1 条件分支 + 手算偏移即本次重构的病灶）。
2. **自包含**：禁 import 其他 shots/ 文件、禁读镜外帧。import 白名单：react / remotion / brand 令牌 / 本片 motion-tokens / 本片 components/。
3. **不透明底色自备**：镜渲染必须自带完整像素——本机 Chrome 部分透明叠渲染确定性崩溃（render-stability-playbook）。
4. **转场挂出镜尾帧 + 交接态协议**：出镜尾帧按分镜表转场列把画面带到交接态（黑场/白场/光点/冻帧，交接态须显式写明）；受入镜首帧必须从同一交接态起步。两侧各自渲染、拼接自然无缝。本质属「入场揭示」的转场在 motion-spec 覆盖矩阵标注「入场侧」为例外。
5. **确定性**：随机只 `random(seed)`；禁 `Date.now`/`Math.random`/渲染期网络请求；真实数据静态化入仓。同 bundle 同帧同像素是镜级缓存成立的前提。
6. **v1 镜文件禁 `<Audio>`**（SFX 冻结，演进口径 §7）。

## 4. 装配契约

- `SiteFilm.tsx` 只做三件事：manifest 遍历（Sequence from/dur）→ `ShotShell` → Shot；外加内联 `<SiteFilmAudio/>`（Studio 预览有声；单镜 comp 不含它，故镜 mp4 无音轨）。
- `ShotShell` 承接全部全局视觉（底色、暖纸肌理垫底等）——**装配层禁止任何覆盖全片的视觉 overlay**（否则单镜渲染缺像素，INV-S4）。
- `SiteFilmAudio.tsx`：BGM 编排唯一事实源（手写艺术编排，不进 manifest；校验器只查不越总帧）；独立注册 comp，音轨单独渲染 wav → ffmpeg aac 256k。
- `routes.ts` 为生成物：全部镜 comp（durationInFrames=镜时长）+ film comp + audio comp，`<Folder>` 分组；`src/Root.tsx` 永不再改。
- 单镜独立渲染 = 独立 comp 上的完整像素，与成片内该镜逐像素一致（这是镜级缓存语义正确的根基）。

## 5. 渲染管线 v2（render-film.mjs 演进）

1. **bundle 一次**：Node API `bundle()` 复用（或 `remotion bundle` + 逐镜 `--bundle` 挂载）——45 次独立渲染绝不各自重新 bundle。
2. **缓存键** = hash(镜源文件 + import 依赖闭包[esbuild metafile，跟随 import 出 shots/ 但排除 node_modules] + 时长/fps)；产物 `out/shots/<film>/sNN-<hash8>.mp4`。改共享组件只重渲引用它的镜。
3. **看门狗（2026-10-31 定稿）**：`renderMedia` 挂 `makeCancelSignal`，onProgress 心跳停更 120s → 击杀本次渲染自动重试；同镜 3 轮止损 → 终败通知 + 退出。编排进程自身的段错误（exit 139）由外层保险丝兜底：退出必 osascript 通知 + 依赖镜级缓存续跑 ≤3 次。
4. **Chrome 版本漂移检测**：脚本开工时对比 `out/.last-render-chrome.json` 记录的版本——Chrome 自动升级会静默作废像素基线（实测漂移地板 ≈0.99 SSIM），检测到漂移先提示标定、验收按漂移门口径（≥0.99 All + 最差镜逐帧走查无结构性差异）。
5. **逐镜渲染**未命中者：清场铁律、独占串行、concurrency=2 不变。
6. **镜帧数校验**：ffprobe nb_frames = durationFrames（INV-S5）。
7. **降级链**：镜级失败 → 360f→120f→30f 收敛梯 → 仍败终败通知退出。
8. **组装**：ffmpeg **concat 滤镜 + trim 帧级对齐**（demuxer 拼接会补重复帧，playbook 实证）→ CFR 终装 → SiteFilmAudio 渲染 mux → 三重终验（帧数/两路时长/分段音量）+ 音轨边界不越总帧。
9. 仪表盘进度按镜粒度，状态文件照旧。
10. **驱动器双轨（2026-10-31 用户拍板）**：A 轨 = `render-all.sh` 非 Node 外层驱动——`remotion bundle` 预打包一次 + 逐镜 `--only --bundle-dir` 短命进程 ×3 重试 + 退出必通知 + `--assemble` 终装；段错误（exit 139）最多损失一镜，驱动器自身不是 Node。B 轨 = GitHub Actions `render-film.yml` 手动触发，复用同一驱动器（`CHROME_EXECUTABLE=none` 交 Remotion 下载 headless-shell），作为 A 轨做不下去时的承接；CI 有字体漂移（sans/mono 无 Linux 字体），成片用于链路验证与兜底，像素定稿以本机为准——字体资产化（入仓 + @remotion/fonts）后消除。
8. **进度与可见性（2026-10-31 定稿：HTML 面板 + macOS 通知）**：
   - 数据源 = Remotion 官方进度流：Node API `renderMedia` 的 `onProgress`（`progress`/`renderedFrames`/`encodedFrames`/`stitchStage`——CLI 进度条同款数据源，文档明言）；返回值 `slowestFrames`（最慢 10 帧）顺手入 status 供性能诊断
   - 三层事件：阶段级（bundle/清场/逐镜/拼接/终装/mux/终验）、镜级（镜号/缓存命中/重试；**开场即报「N 镜已缓存，本次重渲 M 镜 ≈ X 分钟」**）、帧级（onProgress 节流写 status）
   - 产物：`out/render-status.json`（结构化，面板/通知唯一数据源）+ `render-status.txt`（人读兼容）
   - HTML 面板 `out/render-progress.html`：status 事件整页重写内嵌数据（大百分比/当前镜号/缓存统计/阶段条/最近日志），浏览器 tab 常驻 meta refresh——零依赖零端口（不给清场纪律添活）
   - macOS 通知（osascript）：开工 / 每幕完成 / 全部完成 / 失败四类，粒度常量置顶可调；**重试静默、终败才通知**（带镜号与已降级层级）——失败可见性优先于进度可见性
   - Studio Renders 面板只跟踪 UI 里点 Render 按钮发起的渲染，脚本管线不进面板；手动单渲测试片可从 Studio 点按钮白嫖该面板

## 6. 迁移验收（site-film 试点）

- 45 镜机械拆分（按幕并行 subagent）：条件分支与手算偏移（`frame - 120` 类）全部换算为局部帧；Act 全局垫底下沉 ShotShell。
- 验收三关：全镜帧数校验绿 → 全片重渲与已交付成片 SSIM 比对（拆分零回归）→ 三重终验。
- 迁移 change release 时回写知识卡：本规范转 active/runtime，video-production-flow 更新（含旧「三件套/四件套」口径修正）。

## 7. SFX 演进口径（v2 预留）

v1 冻结：镜渲染无音轨，音轨唯一来源 SiteFilmAudio。启用镜内 SFX 时：镜文件可内嵌 `<Audio>`，渲染口径升级为全镜统一 aac/48k + 无声镜垫静音轨（官方口径 `renderMedia` 传 `enforceAudioTrack: true`，专为后续 concat 设计），终验增音轨时长/偏移两项。**镜文件、manifest、装配契约全不动——只动渲染与拼接层**（v1 冻结不为将来锁死路径）。

## 不变量（review 对账用）

- INV-S1：Σ durationFrames = totalFrames = film comp `durationInFrames`
- INV-S2：镜号连续唯一、source 文件存在、startFrame = 前缀和、幕边界与 storyboard 幕表一致
- INV-S3：shots/ 内 import 全在白名单（无跨镜 import、无 `<Audio>`）
- INV-S4：装配层零镜内容、零全片视觉 overlay（SiteFilm.tsx 走查）
- INV-S5：每镜渲染 nb_frames = durationFrames
- INV-S6：routes.ts 与 manifest 一致（生成物校验）

## 决策记录（2026-10-31，用户拍板）

1. **帧数真源**：manifest 真源 + 对账表反生成。弃 storyboard 解析生成（复合格式解析脆、每次渲染都依赖解析）；弃双手工对账（漂移重演，只是从无声变成报错）。
2. **转场归属**：默认挂出镜尾帧 + 交接态协议。依据：现有分镜表转场列语义全为出镜侧（镜 3 渐暗、镜 15 白光涨满），分镜师零改动。弃受入镜（需重定义列语义）；弃无默认（不可 lint、无惯例）。
3. **SFX**：v1 冻结。弃镜内嵌（concat 音频流苛刻，为未必要的内容预付最贵复杂度）；弃进音轨编排（卡点信息与镜内容分离两处）。
4. **site-film**：全量迁移另立 change。弃不迁移（「反馈微调只重渲对应段」是技能写死的常态流程，现役痛点）；弃惰性迁移（装配层双形态最脏）。
5. **进度展示层**：HTML 面板 + macOS 通知（重试静默、终败才通知）。Remotion 接入点在数据层——`renderMedia.onProgress` 官方进度流；Studio Renders 面板只跟踪 UI 发起的渲染，脚本管线不适用。弃 SwiftBar（多一依赖）；弃 Bark 手机推送（v2 后长渲场景收窄）。
6. **卡死预防三层**（2026-10-31 用户拍板）：A 层看门狗——心跳停更 120s 击杀重试、同镜 3 轮止损、编排进程段错误由「退出必通知 + 缓存续跑 ≤3 次」兜底；B 层执行协议——agent 长任务禁阻塞等待/禁无心跳裸跑/禁静默硬磨（SKILL.md 执行纪律「长任务三禁」）；C 层机器侧——内存守卫 + Chrome 版本漂移检测（升级即标定）。`render-status.json.updatedAt` 为活/卡唯一判据。
7. **运行时替代（2026-10-31 用户拍板 A+B 双轨）**：Node 只是控制平面（像素在 Chrome、编码在 Rust compositor、拼接在 ffmpeg），段错误治理靠进程隔离而非换引擎。弃：编排进程内自愈（V8 段错误无法自捕）、Bun 运行时（Remotion 不支持且若根因是硬件照崩）、Remotion Cloud（收藏为后续选项）。前置事实：Chrome 155→156 自动升级实测像素漂移地板 ≈0.99 SSIM——Chrome 版本必须纳入漂移检测。
