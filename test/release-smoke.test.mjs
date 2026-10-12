// 钉住 INV-1 payload-contract · INV-2 materialized-layout · INV-3 no-hardcoded-skill-count · INV-4 offline-reproducible
// 取证策略 assert-first：这些不变量是「CI 脚本文本读哪些字段、怎么拼路径」的静态可机检断言，
// 而观察点取证需要真发一次版——成本差一个量级，故先写红断言再实现门。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BT = '`'; const DQ = String.fromCharCode(39);
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const GATE = join(ROOT, 'scripts', 'check-release-smoke.mjs')
const REAL = join(ROOT, '.github', 'workflows', 'publish-release.yml')

// 事故原文的复刻：读 current + 手拼 prefix/$CUR/... + 硬编码 skills 数
const BROKEN = [
  '      - name: 发布冒烟',
  '        run: |',
  '          shadow-dev workflow execute --json > "$SMOKE/exec.json"',
  '          CUR=$(node -pe "JSON.parse(...).data.current" "$SMOKE/exec.json")',
  '          ROOT="$SMOKE/prefix/$CUR/shadow-dev-workflow"',
  '          [ "$N" = "9" ] || { echo "x skills count"; exit 1; }',
].join('\n')

const GOOD = [
  '      - name: 发布冒烟',
  '        run: |',
  '          VER=$(node -pe "JSON.parse(...).data.version" "$SMOKE/exec.json")',
  '          ROOT="$SMOKE/prefix/shadow-dev-workflow-$VER"',
  '          EXPECTED=$(find skills -name SKILL.md | wc -l | tr -d " ")',
  '          [ "$N" = "$EXPECTED" ] || { echo "x skills count"; exit 1; }',
].join('\n')

function fixture (text) {
  const dir = mkdtempSync(join(tmpdir(), 'rel-smoke-'))
  mkdirSync(join(dir, '.github', 'workflows'), { recursive: true })
  const wf = join(dir, '.github', 'workflows', 'publish-release.yml')
  writeFileSync(wf, text, 'utf8')
  mkdirSync(join(dir, 'skills', 'demo'), { recursive: true })
  writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), '---\nname: demo\n---\n', 'utf8')
  return { dir, wf }
}
function run (args) {
  try {
    return { code: 0, out: execFileSync(process.execPath, [GATE, ...args], { encoding: 'utf8', cwd: ROOT }) }
  } catch (e) {
    return { code: e.status ?? -1, out: (e.stdout || '') + (e.stderr || '') }
  }
}

test('INV-1 拒绝路径：读 data.current 判红并定位行号', () => {
  const fx = fixture(BROKEN)
  const r = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /SMOKE_UNKNOWN_FIELD/)
  assert.match(r.out, /publish-release\.yml:\d+/)
})

test('INV-2 拒绝路径：prefix/$CUR/shadow-dev-workflow 的手拼形状判红', () => {
  const fx = fixture(BROKEN.replace(/data\.current/, 'data.version'))
  const r = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /SMOKE_BAD_LAYOUT/)
})

test('INV-3 拒绝路径：硬编码 skills 数字判红', () => {
  const fx = fixture(GOOD.replace('$EXPECTED', '9'))
  const r = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /SMOKE_HARDCODED_SKILLS/)
})

test('INV-1..3 正例：读 version + 布局派生 + 动态期望值判绿', () => {
  const fx = fixture(GOOD)
  const r = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /fail=0/)
})

test('INV-5 真实仓库的 publish-release.yml 必须过静态对账（防回归到事故原文）', () => {
  const r = run(['--root', ROOT, '--workflow', REAL, '--no-materialize'])
  assert.equal(r.code, 0, r.out)
})

test('INV-4 门在无 workflow 文件时响亮判红而非静默通过', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rel-smoke-none-'))
  const r = run(['--root', dir, '--no-materialize'])
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /SMOKE_WORKFLOW_MISSING/)
  rmSync(dir, { recursive: true, force: true })
})

test('INV-4 离线物化：--from 本地资产安装到隔离 prefix 后断言布局与技能数', { skip: process.env.SHADOW_SMOKE_SKIP_MATERIALIZE === '1' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'rel-smoke-mat-'))
  const r = run(['--root', ROOT, '--materialize-tmp', dir])
  assert.equal(r.code, 0, r.out.slice(-900))
  if (process.platform === 'win32') {
    // 本机受 execution-layer 的 bash -c tar 路径缺陷限制，门必须显式 deferred 而不是静默通过
    assert.match(r.out, /SMOKE_MATERIALIZE_DEFERRED/)
    assert.match(r.out, /deferred=1/)
  } else {
    assert.match(r.out, /OK materialized root=.*skills=\d+/)
    assert.match(r.out, /deferred=0/)
  }
  rmSync(dir, { recursive: true, force: true })
})

// 回归即夹具：下面这段是 v7.0.1 发布链 run 38214942988 判红时的 yml 原文（变量被写成反引号形态）。
// 门对该原文必须判红——否则它守的是想象中的世界，而不是上一次真实失败。
const REAL_FAILURE = [
  '      - name: 发布冒烟（隔离 prefix：plan --release → execute → status → bind plan）',
  '        run: |',
  '          N=$(find "' + BT + 'ROOT' + BT + '/skills" -name SKILL.md | wc -l | tr -d ' + DQ + ' ' + DQ + ')',
  '          EXPECTED=$(find skills -name SKILL.md | wc -l | tr -d ' + DQ + ' ' + DQ + ')',
  '          [ "' + BT + 'N' + BT + '" = "' + BT + 'EXPECTED' + BT + '" ] || { echo "x materialized skills count=' + BT + 'N' + BT + ' expected ' + BT + 'EXPECTED' + BT + '"; exit 1; }',
].join('\n')

test('INV-1 failure-as-fixture：v7.0.1 真实失败原文必须被门判红', () => {
  const fx = fixture(REAL_FAILURE)
  const r = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /SMOKE_BACKTICK_SUBST/)
})

test('INV-4 no-double-green：修复后的真实 yml 不得含任何反引号变量形态', () => {
  const r = run(['--root', ROOT, '--workflow', REAL, '--no-materialize'])
  assert.equal(r.code, 0, r.out)
  assert.doesNotMatch(r.out, /SMOKE_BACKTICK_SUBST/)
})

test('摘要位：--no-materialize 不得被读成「离线物化一致」（门的自我防线）', () => {
  const fx = fixture(GOOD)
  const off = run(['--root', fx.dir, '--workflow', fx.wf, '--no-materialize'])
  assert.equal(off.code, 0, off.out)
  assert.match(off.out, /materialized=0/)
  assert.doesNotMatch(off.out, /离线物化一致/)
  assert.match(off.out, /离线腿按 flag 跳过/)
})
