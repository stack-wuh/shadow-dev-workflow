// 钉住 INV-1 / INV-2 / INV-4 / INV-6：brief 契约门的拒绝路径、对账闭合与不追溯范围。
// 取证策略: assert-first（见 brief「复杂度评级」节）。夹具与真实 brief 同构（shadow-dev/v1 的 JSON frontmatter）——
// 夹具用 YAML 而门读 JSON 时，断言会全绿而门在生产路径上静默半读，这是本变更实测过的最坏失效形态。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const GATE = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'check-brief.mjs')

const fmOf = (name, meta) => JSON.stringify({ schema: 'shadow-dev/v1', name, status: 'branched', files: [], ...meta }, null, 2)
function fixture (name, body, meta = {}) {
  const root = mkdtempSync(join(tmpdir(), 'brief-gate-'))
  const dir = join(root, 'shadow-docs', 'changes', name)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'brief.md')
  writeFileSync(file, '---\n' + fmOf(name, meta) + '\n---\n\n' + body, 'utf8')
  return { root, file, name }
}
function rewrite (fx, body, meta = {}) {
  writeFileSync(fx.file, '---\n' + fmOf(fx.name, meta) + '\n---\n\n' + body, 'utf8')
}
function run (root) {
  try {
    return { code: 0, out: execFileSync(process.execPath, [GATE, '--root', root], { encoding: 'utf8', env: { ...process.env, SHADOW_DEV_NO_GIT: '1' } }) }
  } catch (e) {
    return { code: e.status ?? -1, out: (e.stdout || '') + (e.stderr || '') }
  }
}

const INV1 = 'INV-1 brief-contract'
const L = (extra, result) => '## 复杂度评级\n- **评级:** L\n- **取证策略:** assert-first\n\n## 领域模型\n\n- **限界上下文:** workflow-governance — 流程治理。\n- **聚合与不变量:**\n  - ' + INV1 + '：L 级 brief 必含领域模型段\n  - INV-2 reconciliation-closure：每条 INV 在结果段有观察点\n' + (extra || '') + '## 结果\n' + (result || '')
const bt = (s) => s

test('INV-1 拒绝路径：L 级缺领域模型段必须判红并定位条目', () => {
  const fx = fixture('20261012-refactor-x', bt('# t\n\n## 复杂度评级\n- **评级:** L\n- **取证策略:** observation\n'))
  const r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /MISSING_DOMAIN_MODEL/)
  assert.match(r.out, /20261012-refactor-x\/brief\.md/)
})

test('INV-1 正例：L 级清单带 INV 编号时判绿', () => {
  const fx = fixture('20261012-refactor-ok', bt(L()))
  const r = run(fx.root)
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /ok=1/)
})

test('INV-1 格式：清单条目缺 INV 编号或编号重复都判红', () => {
  const fx = fixture('20261012-refactor-bad', '')
  rewrite(fx, bt('## 复杂度评级\n- **评级:** L\n- **取证策略:** observation\n\n## 领域模型\n\n- **聚合与不变量:**\n  - 聚合：断言\n'))
  let r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /BAD_INV_FORMAT/)
  rewrite(fx, bt('## 复杂度评级\n- **评级:** L\n- **取证策略:** observation\n\n## 领域模型\n\n- **聚合与不变量:**\n  - INV-1 a：x\n  - INV-1 b：y\n'))
  r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /DUPLICATE_INV/)
})

test('INV-2 对账闭合：published 下缺观察点判红，补齐或标注证据缺口判绿', () => {
  const fx = fixture('20261012-refactor-pub', bt(L()), { status: 'published' })
  let r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /UNRECONCILED INV-1/)
  assert.match(r.out, /UNRECONCILED INV-2/)
  rewrite(fx, bt(L('', '\n| INV-1 | 观察点：node scripts/check-brief.mjs → ok=1 |\n| INV-2 | 证据缺口：runner 挂死，替代观察点 CI run 1 |\n')), { status: 'published' })
  r = run(fx.root)
  assert.equal(r.code, 0, r.out)
})

test('INV-2 阶段边界：branched 只校格式不追对账（否则刚立项即判红，阻塞一切后续 change）', () => {
  const fx = fixture('20261012-refactor-early', bt(L()), { status: 'branched' })
  const r = run(fx.root)
  assert.equal(r.code, 0, r.out)
})

test('INV-4 边界：S 级新建套件断言文件判红，L 级带 assert-first 放行', () => {
  const fx = fixture('20261012-chore-s', '## 复杂度评级\n- **评级:** S\n\n## 结果\n- 验证: —\n', { files: ['test/newone.test.mjs'] })
  let r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /ASSERT_FIRST_NEEDS_L/)
  rewrite(fx, bt(L()), { files: ['test/newone.test.mjs'] })
  r = run(fx.root)
  assert.equal(r.code, 0, r.out)
})

test('INV-4 取证策略取值非法判红', () => {
  const fx = fixture('20261012-refactor-strat', bt('## 复杂度评级\n- **评级:** L\n- **取证策略:** red-green\n\n## 领域模型\n\n- **聚合与不变量:**\n  - INV-1 a：x\n'))
  const r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /BAD_EVIDENCE_STRATEGY/)
})

test('INV-6 不追溯：archive 目录下的不合规 brief 不参与判定', () => {
  const fx = fixture('20261012-refactor-old', bt(L()))
  const arch = join(fx.root, 'shadow-docs', 'changes', 'archive', '20260101-chore-legacy')
  mkdirSync(arch, { recursive: true })
  writeFileSync(join(arch, 'brief.md'), '---\n' + JSON.stringify({ schema: 'shadow-dev/v1', name: 'legacy', status: 'archived' }) + '\n---\n\n## 复杂度评级\n- **评级:** L\n', 'utf8')
  const r = run(fx.root)
  assert.equal(r.code, 0, r.out)
  assert.doesNotMatch(r.out, /20260101-chore-legacy/)
})

test('门的自我防线：frontmatter 非 JSON 时拒绝半读', () => {
  const fx = fixture('20261012-chore-yaml', '')
  writeFileSync(fx.file, '---\nname: yaml\nstatus: branched\n---\n\n## 复杂度评级\n- **评级:** L\n', 'utf8')
  const r = run(fx.root)
  assert.equal(r.code, 1)
  assert.match(r.out, /BAD_FRONTMATTER/)
})
