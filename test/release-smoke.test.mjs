// 发布冒烟契约门的断言集：唯一实现存在、CI 只委派、字段与条目齐备、无第二份实现、真实失败原文仍是夹具。
// 取证策略 assert-first。本文件与门源码都不含反斜杠转义与模板字面量——这是「手写多层转义源码」连续四次自伤后定下的生成方式。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const GATE = join(ROOT, 'scripts', 'check-release-smoke.mjs')
const REAL_YML = join(ROOT, '.github', 'workflows', 'publish-release.yml')
const REAL_SH = join(ROOT, 'scripts', 'release-smoke.sh')
const NL = String.fromCharCode(10)
const BT = String.fromCharCode(96)

const GOOD_SH = [
'#!/usr/bin/env bash',
'set -euo pipefail',
  '  shadow-dev workflow plan --release "$REL" --json > "$WORK/plan.json"',
'echo "OK plan version=$PLAN_VER missing=$MISS"',
'VER=$(jq "$WORK/exec.json" .data.version)',
'echo "OK execute version=$VER"',
'ROOT="$WORK/prefix/shadow-dev-workflow-$VER"',
'PTR=$(jq "$WORK/status.json" .data.current)',
'echo "x CURRENT 指针=$PTR 物化版本=$VER"',
'test -f "$ROOT/norms/verification.md"',
  'N=$(find "$ROOT/skills" -name SKILL.md | wc -l)',
  'EXPECTED=$(find skills -name SKILL.md | wc -l)',
'echo "x materialized skills count=$N expected $EXPECTED"',
'echo "OK materialized root=$ROOT skills=$N"',
'echo "OK bind plan host-version=$BIND_VER"',
].join(NL)

const DELEGATED = ['      - name: 发布冒烟（唯一实现：scripts/release-smoke.sh）', '        run: |', '          bash scripts/release-smoke.sh --release "$GITHUB_REF_NAME"'].join(NL)
const INLINE = ['      - name: 发布冒烟（唯一实现）', '        run: |', '          bash scripts/release-smoke.sh --release "$GITHUB_REF_NAME"', '          VER=$(jq "$WORK/exec.json" .data.version)'].join(NL)
const NOT_DELEGATED = ['      - name: 发布冒烟', '        run: |', '          echo 手搓一段'].join(NL)

function fixture (yml, shText) {
  const dir = mkdtempSync(join(tmpdir(), 'rsm-'))
  mkdirSync(join(dir, '.github', 'workflows'), { recursive: true })
  mkdirSync(join(dir, 'scripts'), { recursive: true })
  const wf = join(dir, '.github', 'workflows', 'publish-release.yml')
  const sk = join(dir, 'scripts', 'release-smoke.sh')
  writeFileSync(wf, yml, 'utf8')
  if (shText !== undefined) writeFileSync(sk, shText, 'utf8')
  return { dir, wf, sk }
}
function run (args) {
  try { return { code: 0, out: execFileSync(process.execPath, [GATE, ...args], { encoding: 'utf8', cwd: ROOT }) } }
  catch (e) { return { code: e.status === undefined ? -1 : e.status, out: String(e.stdout || '') + String(e.stderr || '') } }
}
const base = (fx) => ['--root', fx.dir, '--workflow', fx.wf, '--smoke', fx.sk, '--no-materialize']

test('INV-1 未委派判红', () => {
  const r = run(base(fixture(NOT_DELEGATED, GOOD_SH)))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_NOT_DELEGATED/)
})

test('INV-1 步骤体内残留断言原文判红并给行号', () => {
  const r = run(base(fixture(INLINE, GOOD_SH)))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_INLINE_ASSERTION/); assert.match(r.out, /publish-release.yml:4/)
})

test('INV-2 借字段判红（exec.json 读 current）', () => {
  const r = run(base(fixture(DELEGATED, GOOD_SH.replace('.data.version', '.data.current'))))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_UNKNOWN_FIELD/)
})

test('INV-4 真实失败原文（反引号形态）必须判红', () => {
  const broken = GOOD_SH.replace('N=$(find ', 'N=$(find ' + BT + 'ROOT' + BT)
  const r = run(base(fixture(DELEGATED, broken)))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_BACKTICK_SUBST/)
})

test('INV-2 断言条目缺失必须点名缺哪一条', () => {
  const r = run(base(fixture(DELEGATED, GOOD_SH.replace('echo "OK bind plan host-version=$BIND_VER"', 'echo x'))))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_ASSERTION_MISSING/); assert.match(r.out, /bind 宿主版本一致/)
})

test('INV-2 手拼路径判红', () => {
  const r = run(base(fixture(DELEGATED, GOOD_SH.replace('prefix/shadow-dev-workflow-$VER', 'prefix/$CUR/shadow-dev-workflow'))))
  assert.equal(r.code, 1); assert.match(r.out, /SMOKE_BAD_LAYOUT/)
})

test('正例：委派与条目齐备判绿', () => {
  const r = run(base(fixture(DELEGATED, GOOD_SH)))
  assert.equal(r.code, 0, r.out); assert.match(r.out, /fail=0/)
})

test('INV-3 门自身不得成为第二份实现', () => {
  const src = readFileSync(GATE, 'utf8').split(NL)
  const drivers = src.filter((l) => !l.trim().startsWith('//') && l.includes('workflow execute'))
  assert.equal(drivers.length, 0, drivers.join(NL))
  assert.ok(readFileSync(GATE, 'utf8').includes('SMOKE_DUPLICATION'))
})

test('真实仓库：yml 与唯一实现必须双双合规', () => {
  const r = run(['--root', ROOT, '--workflow', REAL_YML, '--smoke', REAL_SH, '--no-materialize'])
  assert.equal(r.code, 0, r.out.slice(0, 700))
})

test('摘要位：离线腿未跑不得被读成一致', () => {
  const r = run(base(fixture(DELEGATED, GOOD_SH)))
  assert.match(r.out, /materialized=0/)
  assert.doesNotMatch(r.out, /离线腿跑通同一份脚本/)
})
