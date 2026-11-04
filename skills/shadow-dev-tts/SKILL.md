---
name: shadow-dev-tts
description: 产出音频——Qwen TTS 配音管线，文案到可进剪辑软件的旁白 WAV（Token Plan/百炼双通道自动识别）。触发词：配音、旁白、解说、TTS、语音合成、音频、声优、音色、读稿、出音频、AI 声音。
---

# Shadow Dev TTS — 配音音频产出

把文案变成视频旁白音频。工具载体：shadow-dev-cli 仓 `tools/qwen-tts/`（`tts.py` 零依赖单文件，Python 3.10+；API Key 存工具目录 `.api_key`——不入库，环境变量 `DASHSCOPE_API_KEY` 亦可）。执行真相与实证记录：shadow-dev-cli 仓的 `qwen-tts-voiceover` 知识卡（domain: media-tts）。

## 快速出片（默认路径）

1. 文案落成 UTF-8 txt → `cd <cli仓>/tools/qwen-tts && python tts.py 文案.txt --name <slug>`
2. 成品 `tts-output/<slug>/final.wav`（44.1kHz / 16bit / 单声道），直接拖进剪辑软件；分段原件在 `segments/`（单段失败可只重跑该段）
3. 通道按 Key 前缀自动识别；换通道/模型/音色用 `--plan` / `--model` / `--voice`；`--voices` 列表、`--dry-run` 只看分段不烧额度

## 通道与音色速查

| 通道 | Key 前缀 | 模型 | 音色体系 | 适用 |
|------|----------|------|----------|------|
| token | `sk-sp-` | `qwen-audio-3.0-tts-plus` | CosyVoice（已验证 `longanhuan_v3.6`） | 订阅 Credits 抵扣，出片首选 |
| standard | `sk-` | `qwen3-tts-flash` | Cherry/Ethan 等 48 音色 | 按量计费，多语种/方言 |

## 执行纪律（实证坑位，逐条必守）

- **Key 与端点必须配对**：`sk-sp-` 只能走 `token-plan.<region>.maas.aliyuncs.com` 专属端点，喂给通用端点恒 401 `InvalidApiKey`；三套计费体系（订阅 Credits / 免费额度 / 按量）凭证完全隔离，不互抵。
- **WAV 头必须重写**：服务端返回的 nframes 是占位坏值（5s 音频被标成 ~6.8h），工具内置 `sanitize_wav` 落盘前修复；绕过工具手工拼音频时必须同样修复，否则剪辑软件时长错乱。
- **URL 即时落盘**：响应里的音频 URL 有时效（约 24h），合成后立刻下载，不把 URL 当持久产物引用。
- **显式 wav + 44100**：面向剪辑的规格写死（format=wav, sample_rate=44100）；换 mp3 等格式会破坏纯 Python 的 WAV 拼接路径。
- **单请求 ≤600 字**：工具按 480 字句子边界自动切分再拼接，长文案永远走工具，不手工分段。
- **先试后量**：计费按 `usage.characters`（与输入字数不同源），批量出片前短文案试音色、`--dry-run` 核分段，满意再跑全篇。
- **长文案出片纪律**：后台运行 + 每段完成播报一行进度；失败重试只跑失败段，不整篇重来。

## 验收

- 机器：`wave` 回读 final.wav——头字段自洽、时长 ≈ 预期朗读时长、44100Hz/16bit/mono。
- 人工：试听语速/情绪/断句（数字、英文词、标点停顿最易翻车），不满意换音色或改文案标点重跑。

## 协作与收尾

- 与 `shadow-dev-video` 协作：本技能产旁白音频，成片音轨（配乐/SFX/mux）由 video 管线装配层消费。
- 新音色验证结论、新坑位：回写 shadow-dev-cli 仓 `media-tts` 域知识卡或本技能目录，冲突时以知识卡为准。
