// brief 契约门：把 SDD 的规格层从散文变成机器判定（只读盘，不改盘）。
// 钉住：INV-1 规格段存在且清单非空带编号 · INV-2 对账闭合 · INV-4 断言优先有边界 · INV-6 历史不追溯。
// 用法：node scripts/check-brief.mjs [--root <dir>]
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const argv = process.argv.slice(2)
const argOf = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null }
const root = resolve(argOf('--root') || process.cwd())

// 门自本变更起只作用于新立项与其后在途 brief（INV-6）。名单只减不增：archive 消解一份就删一行。
// 往里塞新 brief 等于把门关掉；追溯判红历史 brief 只会逼执行者改旧文档换绿灯，那是伪证不是修复。
const GRANDFATHERED = new Set([
  '20261010-build-quality-gate',
  '20261010-refactor-domain-driven-workflow',
])

const STRATEGIES = new Set(['assert-first', 'observation'])
const CLOSURE_STATES = new Set(['reviewed', 'committed', 'published', 'archived'])
const CLOSED_RE = /观察点|证据缺口|替代观察点|未验证/

const fails = [], warns = [], oks = []
const relOf = (name) => 'shadow-docs/changes/' + name + '/brief.md'
const bad = (code, rel, detail) => fails.push(code + ' ' + rel + ': ' + detail)

function listActiveBriefs () {
  const dir = join(root, 'shadow-docs', 'changes')
  if (!existsSync(dir)) return []
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === 'archive') continue
    const abs = join(dir, e.name, 'brief.md')
    if (!existsSync(abs)) continue
    out.push({ name: e.name, abs })
  }
  return out
}

function splitFrontmatter (text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)
  if (!m) return { fm: '', body: text }
  return { fm: m[1], body: text.slice(m[0].length) }
}

function parseFm (fm) {
  // brief 的 frontmatter 是 shadow-dev/v1 JSON。解析不了就判红，绝不退回默认值——
  // 退回默认值会让门在真实 brief 上静默半读，而断言照旧全绿（本变更实测踩过）。
  try { return JSON.parse(fm) } catch (e) { return null }
}

const norm = (p) => String(p).replace(/\\/g, '/')

function sectionOf (body, title) {
  const lines = body.split(/\r?\n/)
  const start = lines.findIndex((l) => l.startsWith('## ' + title))
  if (start < 0) return null
  const out = []
  for (let i = start + 1; i < lines.length; i++) { if (/^##\s/.test(lines[i])) break; out.push(lines[i]) }
  return out
}

function invItems (domainLines) {
  const items = []
  let collecting = false
  for (const line of domainLines) {
    if (/-\s*\*\*聚合与不变量:\*\*/.test(line)) { collecting = true; continue }
    if (!collecting) continue
    if (/^\s*-\s*\*\*[^*]+:\*\*/.test(line)) { collecting = false; continue }
    if (/^\s*-\s+\S/.test(line)) items.push(line.trim())
  }
  return items
}

function check (b) {
  const rel = relOf(b.name)
  const raw = readFileSync(b.abs, 'utf8')
  const { fm, body } = splitFrontmatter(raw)
  const meta = parseFm(fm)
  if (GRANDFATHERED.has(b.name)) {
    warns.push('GRANDFATHERED ' + rel + ' status=' + ((meta && meta.status) || '?') + '（门生效前的在途 brief，豁免追溯；archive 后从名单删除）')
    return 'grandfathered'
  }
  if (!meta || typeof meta !== 'object') { bad('BAD_FRONTMATTER', rel, 'frontmatter 不是可解析的 shadow-dev/v1 JSON——status 与 files 不可判定，拒绝半读'); return 'fail' }
  const status = meta.status || 'draft'
  const files = Array.isArray(meta.files) ? meta.files.map(norm) : []
  const rating = (/-\s*\*\*评级:\*\*\s*([SML])/.exec(body) || [])[1] || null
  const strategy = (/-\s*\*\*取证策略:\*\*\s*([a-zA-Z-]+)/.exec(body) || [])[1] || null
  const touchesSuite = files.some((p) => /(^|\/)test\/[^/]+\.(mjs|js|cjs)$/.test(p))
  const before = fails.length
  const domain = sectionOf(body, '领域模型')
  const result = sectionOf(body, '结果') || []
  let ids = []

  if (!rating) bad('MISSING_RATING', rel, '缺「## 复杂度评级」的 **评级:** S|M|L 行——门无法判定强度')

  if (rating === 'L') {
    if (!domain) bad('MISSING_DOMAIN_MODEL', rel, 'L 级缺「## 领域模型」段（rules/iron-laws.md §7：缺段即视为未开始）')
    else {
      const items = invItems(domain)
      if (!items.length) bad('EMPTY_INV_LIST', rel, '「聚合与不变量」清单为空——没有不变量就没有验收对象')
      for (const it of items) {
        const m = /\bINV-\d+\b/.exec(it)
        if (!m) { bad('BAD_INV_FORMAT', rel, '清单条目缺 INV-n 编号：' + it.slice(0, 50)); continue }
        if (ids.includes(m[0])) bad('DUPLICATE_INV', rel, '编号重复：' + m[0] + '——对账表的行键必须唯一')
        ids.push(m[0])
      }
    }
    if (!strategy) bad('MISSING_EVIDENCE_STRATEGY', rel, 'L 级缺 **取证策略:** assert-first|observation（propose 确认时批准）')
    else if (!STRATEGIES.has(strategy)) bad('BAD_EVIDENCE_STRATEGY', rel, '取证策略取值非法：' + strategy + '（只允许 assert-first | observation）')
    else if (touchesSuite && strategy !== 'assert-first') bad('ASSERT_FIRST_NEEDS_STRATEGY', rel, 'files 含套件断言文件但取证策略不是 assert-first')
  } else if (rating === 'M') {
    if (!domain) bad('MISSING_DOMAIN_MODEL', rel, 'M 级缺「## 领域模型」最小形态（归属上下文 + 被触及既有不变量）')
    else if (!/-\s*\*\*限界上下文:\*\*/.test(domain.join('\n'))) bad('MISSING_CONTEXT_LINE', rel, 'M 级领域模型段缺 **限界上下文:** 行')
  }

  if (touchesSuite && rating !== 'L') bad('ASSERT_FIRST_NEEDS_L', rel, '评级=' + (rating || '?') + ' 却新建套件断言文件——断言优先只在 L 级可用（INV-4）')

  if (ids.length && CLOSURE_STATES.has(status)) {
    for (const id of new Set(ids)) {
      const line = result.find((l) => l.includes(id))
      if (!line || !CLOSED_RE.test(line)) bad('UNRECONCILED ' + id, rel, '在「## 结果」段缺观察点行，也未标注证据缺口')
    }
  }

  if (fails.length === before) {
    oks.push(rel + ' 评级=' + rating + ' status=' + status + ' 不变量=' + new Set(ids).size + ' 对账=' + (CLOSURE_STATES.has(status) && ids.length ? 'closed' : 'n/a'))
    return 'ok'
  }
  return 'fail'
}

if (!existsSync(join(root, 'shadow-docs'))) { console.log('摘要: briefs=0 ok=0 warn=0 fail=0 (无 shadow-docs，跳过)'); process.exit(0) }
const briefs = listActiveBriefs()
let nOk = 0, nGf = 0
for (const b of briefs) { const r = check(b); if (r === 'ok') nOk++; else if (r === 'grandfathered') nGf++ }
const out = []
for (const o of oks) out.push('[.] ' + o)
for (const w of warns) out.push('[!] ' + w)
for (const x of fails) out.push('✗ ' + x)
if (!fails.length) out.push('✅ brief 契约门：' + briefs.length + ' 份在途 brief 的规格段与对账闭合成立（archive 目录不追溯）')
console.log(out.join('\n'))
console.log('摘要: briefs=' + briefs.length + ' ok=' + nOk + ' warn=' + nGf + ' fail=' + fails.length)
if (fails.length) { console.error('✗ brief 契约门判红 ' + fails.length + ' 项——release 阻塞，指针不动'); process.exit(1) }
