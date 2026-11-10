# Remotion 能力地图（官方基元优先）

> 状态：2026-11-10 立项（用户四项拍板：子包全量 / 转场协议不动+令牌吸收 / three 先行+Blender 契约先行 / v3 一并升级），素材仓 wuh.site.video 同日落地实证（描画引擎真长度化 + 13 处硬编码 dasharray 清零 + typecheck 全绿）。
> 定位：SKILL.md 第二段 step1「令牌库先行」的实现基元字典——镜内新动效**先查本文件再造轮子**；自研需在令牌注释里说明官方基元为何不适用。
> 版本纪律：所有 `@remotion/*` 与 `remotion` 同版本钉死（现 **4.0.538，无 `^`**）——官方明言混版本冲突。升版本 = 像素基线重标定（同 Chrome 漂移口径）。

## 0. 已引入包清单（素材仓已装）

| 包 | 版本 | 能力 | 状态 |
|---|---|---|---|
| `@remotion/paths` | 4.0.538 | SVG 路径引擎：evolvePath 描画 / interpolatePath morph / getPointAtLength 沿迹 | ✅ 在用（`inkDraw`） |
| `@remotion/noise` | 4.0.538 | 确定性 simplex 噪声 noise2D/3D/4D(seed, …) | ✅ 在用（`handheld`/`driftAngle`） |
| `@remotion/motion-blur` | 4.0.538 | CameraMotionBlur（shutterAngle/samples）/ Trail 拖尾 | 已装待用（快镜按需） |
| `@remotion/shapes` | 4.0.538 | SVG 形状组件（Star/Pie/Ring/Triangle/Circle…） | 已装待用（倒计时环/图表底元） |
| `@remotion/transitions` | 4.0.538 | TransitionSeries + 20+ presentation + springTiming/linearTiming | 已装待用（**仅镜内**，§3） |
| `@remotion/three` | 4.0.538 | ThreeCanvas（R3F 帧驱动）/ useOffthreadVideoTexture | 已装待用（§4.1） |
| `@remotion/captions` | 4.0.538 | cue 官方类型 + parseSrt/parseVtt | 已装待用（与 CAPTION_CUES 对齐） |
| `@remotion/sfx` | 4.0.538 | MIT 音效库，免署名，−3dB 峰值归一 | 已装（SFX v2 素材源，shot-spec §7） |
| `@remotion/rough-notation` | 4.0.538 | 手绘标注动画（underline/circle/highlight/box） | 已装待用（纸墨批注感；细节待补核） |
| `three` + `@react-three/fiber` | 0.180.0 / 9.8.2 | 3D 底座 | 已装 |

## 1. 令牌 → 官方基元决策表

motion-spec 出令牌时按下表选实现基元；UE 动效大师产出每令牌须标「实现基元」列。

| 动效意图 | 基元 | 备注 |
|---|---|---|
| 入场/落定/弹性 | `spring(frame, fps, config)` | **默认弹性**；线性=例外需注释（v3 实证：62 镜 spring 0 处 = 缺席） |
| 描边生长/擦除 | `evolvePath(progress, d)`（@remotion/paths） | 真长度驱动；**禁猜 pathLen**（v3 实证 13 处：猜大=起步死区+变速扭曲） |
| 路径 morph | `interpolatePath(a, b, t)` | 先 `normalizePath`；两路径指令数须匹配 |
| 沿路径运动 | `getPointAtLength` + `getTangentAtLength` | 运镜轨迹/粒子沿迹/笔尖跟随 |
| 有机颤动/尘埃/纸纹 | `noise2D(seed, x, y)`（**三参**）/ `noise3D` | 确定性 ✓ 符合 §3 规则 6；替代 Math.sin 波场（正弦感一眼假） |
| 快速横移/甩镜 | `CameraMotionBlur`（shutterAngle/samples） | 叠层混合可能改色——纸墨调色镜先抽帧验色再定稿 |
| 风格化拖尾 | `Trail` | 非物理模糊 |
| 图形底元 | `@remotion/shapes` | 环形倒计时/星/饼图 |
| 镜内多场景切换 | `TransitionSeries` + 官方 presentation | 只在镜文件内部；装配层禁用（§3） |
| 手绘标注 | `RoughNotation` | 纸墨批注/圈点重点 |
| 字幕 cue | `@remotion/captions` 类型 + parseSrt/parseVtt | 自研 CAPTION_CUES 结构向官方类型对齐 |
| SFX 素材 | `@remotion/sfx` | MIT 免署名；SFX v2 演进时启用（shot-spec §7） |
| 3D | `ThreeCanvas` | §4.1；gl:'angle' 铁律 |

## 2. 已入库基元（brand/motion.ts「官方基元层」，影片经 motion-tokens 重导出使用）

```ts
inkDraw(progress, pathD)            // → { strokeDasharray, strokeDashoffset } 真长度描画，展开到 <path {...} />
handheld(seed, frame, amp?)         // → { dx, dy, rot } noise2D 手持颤动（≤3px/0.35°@amp1）
driftAngle(seed, x, y, t)           // → 方向角 noise3D 漂移场（尘埃/纸纹粒子）
springEnter(frame, delay, fps, fromY?, config?) // → CSSProperties 弹性入场
TRANS.slideOut/slideIn/wipeOut/wipeIn/flashVeil/flashReveal(frame, dur) // 转场曲线两侧镜像（§3）
```

## 3. 转场架构（决策 #10：协议不动 + 令牌吸收）

- **跨镜交接态协议不变**（shot-spec §3 规则 4）：出镜尾/入镜首各自实现自己的一半；`TRANS` 六函数保证两侧曲线同形（同 easing 同窗口），拼接无缝。
- **TransitionSeries 只用于镜内多场景切换**（一镜内 scene A→B→C）；装配层禁用——它要求相邻两镜同容器渲染，破坏镜级缓存粒度（一镜改动 → 两镜重渲）。
- 确需电影级 canvas 跨镜效果（filmBurn/zoomBlur 类）：按「联合渲染单元」另立 spec 修订评审，不走本表。

## 4. 3D 双路线（决策 #11：three 先行，Blender 契约先行）

### 4.1 three / R3F（现役路线）

- `<ThreeCanvas>` 内 `useCurrentFrame()` 直驱（动画写进 markup，不用 useFrame）；`<Sequence layout="none">`——Sequence 默认返回 div，ThreeCanvas 内不允许。
- **服务端渲染必须显式 `chromiumOptions: { gl: 'angle' }`**（renderMedia/renderFrames/getCompositions 参数；config 文件对 Node API 不生效）。CI 无 GPU → 软件渲染慢，3D 镜单独 timeout 预算。
- CI 实证先例：zhi-guo-xiang `InkStage`（raw three 三 pass 水墨舞台，headless WebGL 可出图）。R3F 与 raw three 两路线并存；要 R3F 生态（drei 等）用 ThreeCanvas，要极致可控可循 InkStage。
- 确定性：场景禁 Math.random/Date.now 即成立；GL 光栅化同版本 Chrome 同像素——Chrome 版本已在漂移检测口径内。

### 4.2 Blender（契约先行，首个 3D 镜需求出现再落 CI 基建）

- **无官方集成**；社区标准管线：`blender -b -P render.py`（bpy 无头渲染）→ PNG 帧序列 `public/<slug>/three/sNN-vN/` → 镜内 `staticFile` 按帧取 → Remotion 只做合成（字幕/动效/调色叠加）。
- **建模走 bpy 程序化脚本入库**（.blend 二进制不入库）——「入库可复现的一切」纪律；git 可 diff。
- **Blender 版本钉死 = 像素基线**（类比 Chrome 155→156 漂移教训）；帧序列版本号进目录名，**换渲必改镜文件引用**（shot-spec §8 缓存键语义同构）。
- **本机不渲铁律延伸到 Blender**；CI 每镜独立 matrix job + artifact 中转（复用 render-film.yml 编排模式）。Cycles 无 GPU 只能 CPU 渲，每帧秒级起——成本核算先行。

## 5. 反模式清单（v3 实证沉淀）

- ❌ 猜 pathLen（`strokeDasharray={1600}`）：起步死区+变速扭曲——用 `inkDraw`
- ❌ `Math.sin` 有机运动：正弦感一眼假——用 `noise2D`（注意三参签名）
- ❌ 入场落定全 interpolate 手调曲线：默认 `spring`/`springEnter`
- ❌ 装配层 TransitionSeries：破坏镜级缓存
- ❌ `@remotion/*` 版本带 `^`：与 remotion 核心混版本冲突
- ❌ CSSProperties 直接展开进 SVG props（TS 报宽类型）：走 `style={…}`（v2 先例）
- ⚠️ 存量债：v2（14 处 pathDraw 猜长度）/ site-film（s33 手写 pathDrawSlow）为已交付冻结片**不在制品内修**；若返工对应镜，顺手迁移到 inkDraw

## 6. 参考链接

- transitions: https://www.remotion.dev/docs/transitions
- three: https://www.remotion.dev/docs/three （含 gl:angle 服务端渲染口径）
- GPU: https://www.remotion.dev/docs/gpu （headless 默认禁 GPU；Lambda 无 GPU）
- paths: https://www.remotion.dev/docs/paths
- noise: https://www.remotion.dev/docs/noise
- motion-blur: https://www.remotion.dev/docs/motion-blur
- captions: https://www.remotion.dev/docs/captions
- sfx: https://www.remotion.dev/docs/sfx （≥4.0.429）
