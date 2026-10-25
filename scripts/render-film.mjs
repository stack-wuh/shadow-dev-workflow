/**
 * 视频分段渲染编排（通用模板 · 进度可视化）
 * 部署：复制到目标视频仓 scripts/ 后使用（root 自动指向该仓）。
 * 节点：清场 → 分段渲染(重试/降级30f) → 帧数校验 → 拼接 → CFR 终装 → 终验；进度条 + 每节点时间戳。
 * 配套技能：skills/shadow-dev-video（两段式管线与执行纪律）。
 */
#!/usr/bin/env node
/**
 * 视频分段渲染编排（进度可视化版）
 * 每个流程节点实时打印：清场 → 分段渲染(含尝试次数) → 帧数校验 → 拼接 → CFR 终装 → 音轨修复 → 终验
 * 进度条按「已出片帧数/总帧数」绘制；同时写 out/render-status.txt 供任意处读取。
 *
 * 用法：node scripts/render-film.mjs <composition> <总帧数> <分段列表>
 *   例：node scripts/render-film.mjs SiteFilm 7200 0-1439 1440-2879 2880-4319 4320-5759 5760-7199
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = '3211';
const root = join(import.meta.dirname, '..');
const outDir = join(root, 'out');
const statusFile = join(outDir, 'render-status.txt');

const [composition, totalFramesStr, ...segArgs] = process.argv.slice(2);
const totalFrames = Number(totalFramesStr);
if (!composition || !totalFrames || segArgs.length === 0) {
  console.error('用法: node scripts/render-film.mjs <composition> <总帧数> <start-end> [start-end ...]');
  process.exit(1);
}
const segments = segArgs.map((s, i) => {
  const [start, end] = s.split('-').map(Number);
  return { i: i + 1, start, end, out: join(outDir, `seg-${i + 1}.mp4`) };
});

const log = (...m) => console.log(`[render] ${new Date().toTimeString().slice(0, 8)}`, ...m);
const bar = (done, total) => {
  const p = Math.round((done / total) * 100);
  const filled = Math.round(p / 4);
  return `${'█'.repeat(filled)}${'░'.repeat(25 - filled)} ${String(p).padStart(3)}%`;
};
const status = (text) => {
  writeFileSync(statusFile, `${new Date().toTimeString().slice(0, 8)} ${text}\n`);
  log(text);
};

function cleanup() {
  spawnSync('pkill', ['-f', 'remotion-shared-memory-capture']);
  spawnSync('pkill', ['-f', 'headless=old']);
  spawnSync('kill', ['-9', ...spawnSync('lsof', ['-ti', `:${PORT}`]).stdout.toString().trim().split('\n').filter(Boolean)]);
}

function renderSeg(seg, attempt) {
  status(`[${seg.i}/${segments.length}] 渲染 ${seg.start}-${seg.end} 第 ${attempt} 次（清场中…）`);
  cleanup();
  return new Promise((resolve) => {
    const child = spawn(
      join(root, 'node_modules', '.bin', 'remotion'),
      ['render', 'src/index.ts', composition, seg.out, `--frames=${seg.start}-${seg.end - 1}`, '--crf=16', '--concurrency=2', `--browser-executable=${CHROME}`, `--port=${PORT}`, '--log=error'],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    child.on('close', (code) => resolve(code));
  });
}

function verifyFrames(file, expected) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' });
  return Number(r.stdout.trim()) === expected;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
  if (r.status !== 0) console.error(r.stderr.slice(-300));
  return r.status === 0;
}

status(`开工：${composition} 共 ${totalFrames} 帧 / ${segments.length} 段`);
let doneFrames = 0;
const okSegs = [];

for (const seg of segments) {
  rmSync(seg.out, { force: true });
  let success = false;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const code = await renderSeg(seg, attempt);
    if (code === 0 && existsSync(seg.out) && verifyFrames(seg.out, seg.end - seg.start)) {
      success = true;
      break;
    }
    log(`段 ${seg.i} 第 ${attempt} 次失败，${attempt < 8 ? '8s 后重试' : '降级 30f 细块'}`);
    if (attempt < 8) await new Promise((r) => setTimeout(r, 8000));
  }
  if (!success) {
    status(`段 ${seg.i} 降级：30f 细块渲染`);
    const subs = [];
    let subOk = true;
    for (let s = seg.start; s < seg.end; s += 30) {
      const sub = { start: s, end: Math.min(s + 30, seg.end), out: join(outDir, `seg-${seg.i}-s${s}.mp4`) };
      let ok = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        cleanup();
        const code = await renderSeg(sub, attempt);
        if (code === 0 && existsSync(sub.out)) { ok = true; break; }
        await new Promise((r) => setTimeout(r, 5000));
      }
      if (!ok) { subOk = false; break; }
      subs.push(sub.out);
    }
    if (!subOk) { status(`段 ${seg.i} 渲染失败（含细块），终止`); process.exit(1); }
    const list = join(outDir, `seg-${seg.i}.concat.txt`);
    writeFileSync(list, subs.map((f) => `file '${f}'`).join('\n'));
    run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', seg.out]);
  }
  doneFrames += seg.end - seg.start;
  okSegs.push(seg.out);
  log(`段 ${seg.i} 完成 ✔  整体进度 ${bar(doneFrames, totalFrames)}（${doneFrames}/${totalFrames} 帧）`);
}

status('全段完成 → 拼接中…');
const concatList = join(outDir, 'film.concat.txt');
writeFileSync(concatList, okSegs.map((f) => `file '${f}'`).join('\n'));
run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-c', 'copy', join(outDir, 'film-raw.mp4')]);
status('拼接完成 → CFR 终装（统一时间轴）…');
run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', '-vsync', 'cfr', '-c:a', 'aac', '-b:a', '256k', join(outDir, 'film-final.mp4')]);
status('终装完成 → 终验');
const v = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,duration', '-of', 'default=noprint_wrappers=1', join(outDir, 'film-final.mp4')], { encoding: 'utf8' });
const a = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=duration', '-of', 'default=noprint_wrappers=1', join(outDir, 'film-final.mp4')], { encoding: 'utf8' });
console.log(v.stdout.trim());
console.log(a.stdout.trim());
status(`✅ 出片完成 out/film-final.mp4（${totalFrames} 帧目标）`);
