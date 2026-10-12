#!/usr/bin/env node
// 知识治理门：把「卡片字段、source 存在性、active 路由覆盖、引用死链、废弃残留、孤儿规范、技能清单」
// 从 AI 本机手跑的一次性脚本固化成可重复、可 CI 的非零退出断言。
// 用法：npm run check:knowledge [-- --forbid 'tokenA,tokenB'] [--strict]
// 语义：[fail] 计入退出码；[warn] 只提示（存量卡片豁免项走这里，见 norms/knowledge-cards.md「不回溯迁移」）。
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const fails = [], warns = [], oks = []
const ok = m => oks.push(`[ok] ${m}`)
const warn = m => warns.push(`[warn] ${m}`)
const fail = m => fails.push(`[fail] ${m}`)
// 读容忍 CRLF、判读恒 LF：windows runner 的 actions/checkout 按 core.autocrlf 检出 CRLF，而本门的
// frontmatter 定界（`---\n`）、表格与引用扫描全部按 \n 解析——不归一会让 8 个技能集体误报「缺 name/description」
// （实证：PR #44 的 windows gate 第 7 步 fail=21，ubuntu/macos 同 run 全绿）。与 shadow-dev-cli 的 brief 行尾契约同源。
const read = p => readFileSync(join(root, p), 'utf8').replaceAll('\r\n', '\n')
const SKIP_DIRS = new Set(['.git', 'dist', 'node_modules', '.agents'])

// 文件集合必须由 git 给出，不是 readdirSync。反例（2026-10-12 复盘实证）：本仓 .gitignore 里的 .zcode/
// 存宿主会话计划，内含一句指向拆仓前旧单文件 CLI 入口的历史引用（该路径已随 20260916 拆仓消失），被无过滤的 walk() 读进引用扫描后，
// 本机 check:knowledge 永久 fail=1、CI 干净 checkout 恒绿——同一 commit 两处结论分裂，门自身不可信，
// 「本机四门全绿」于是从合法观察点退化成不可能兑现的承诺。该弱点在 20261010-feature-workflow-context-map
// brief 里就记为「门应跳过 ignored 路径」，一直没人修。
// 口径分两层：引用扫描＝tracked + 未跟踪但未 ignore；台账断言＝仅 tracked（未提交的在途 brief 不参与，
// 否则 apply 中途会把在建目录误判成台账漂移）。git 不可用时退回 walk，但必须响亮 warn——静默降级是本仓所有门的禁项。
function gitLs(args) {
  if (process.env.SHADOW_DEV_NO_GIT === '1') return null // 退化路径的可复现开关，供拒绝路径观察点使用
  try {
    return execFileSync('git', ['-C', root, 'ls-files', '-z', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split('\0').filter(Boolean).map(p => p.split('\\').join('/'))
  } catch { return null }
}
let enumeration = 'git'
const trackedFiles = gitLs(['--cached'])
const scanFiles = gitLs(['--cached', '--others', '--exclude-standard'])
if (!trackedFiles || !scanFiles) {
  enumeration = 'readdir'
  warn('git 不可用：文件枚举退回 readdir，被 ignore 的路径未过滤，本门结论可能与干净 checkout 的 CI 分裂（可用 SHADOW_DEV_NO_GIT=1 复现该退化）')
}
const walkAll = () => {
  const out = []
  ;(function walk(dir) {
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue
      const rel = dir === '.' ? e.name : dir + '/' + e.name
      if (e.isDirectory()) walk(rel)
      else out.push(rel)
    }
  })('.')
  return out
}
const inSkip = p => p.split('/').some(seg => SKIP_DIRS.has(seg))
const trackedList = trackedFiles || walkAll().filter(p => !inSkip(p))
const scanList = scanFiles || trackedList.concat(walkAll().filter(p => !inSkip(p) && !trackedList.includes(p)))

// 1) 知识卡与规范：frontmatter 字段、status 枚举、source 存在性、active 卡路由覆盖
const REQUIRED = ['title', 'domain', 'keywords', 'scope', 'status', 'source', 'verified']
const DEPTH = ['verified-depth', 'verified-scope']
function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return null
  const end = text.indexOf('\n---', 4)
  if (end < 0) return null
  const data = {}, lines = text.slice(4, end + 4).split('\n')
  let listKey = null
  for (const line of lines) {
    if (!line.trim()) continue
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) { data[listKey] = [...(data[listKey] || []), item[1].trim()]; continue }
    const kv = /^([A-Za-z-]+):\s*(.*)$/.exec(line.trim())
    if (!kv) { listKey = null; continue }
    const [, k, raw] = kv
    if (raw === '') { listKey = k; data[k] = data[k] || [] }
    else if (raw.startsWith('[')) { listKey = null; data[k] = raw.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) }
    else { listKey = null; data[k] = raw.replace(/\s+#.*$/, '').trim().replace(/^['"]|['"]$/g, '') }
  }
  return data
}
// source 解析要容忍归档搬迁：archive 流程会把 brief 移到 changes/archive/<name>/，
// 而卡片按规范写的是 changes/<name>/brief.md。只查字面路径会让每张卡在它的来源 change 归档那天集体失效
// （实测本仓 3 张跨项目卡里 2 张已因此判红）。返回 'ok' | 'archived' | 'missing'。
function sourceResolve(p) {
  if (p.startsWith('user-feedback/')) return 'ok' // 口头来源不要求落盘文件
  if (existsSync(join(root, p))) return 'ok'
  const bases = ['shadow-docs', '']
  if (bases.some(base => existsSync(join(root, base, p)))) return 'ok'
  const archived = p.replace(/^changes\//, 'changes/archive/')
  if (archived !== p && bases.some(base => existsSync(join(root, base, archived)))) return 'archived'
  return 'missing'
}
const cardDirs = ['knowledge']
const menuText = read('menu.md')
const cards = []
for (const dir of cardDirs) {
  for (const f of readdirSync(join(root, dir)).filter(x => x.endsWith('.md'))) {
    const rel = `${dir}/${f}`, data = parseFrontmatter(read(rel))
    if (!data) { fail(`${rel}: 缺少 frontmatter（卡片必须可路由）`); continue }
    cards.push({ rel, data })
    const missing = REQUIRED.filter(k => !(k in data))
    if (missing.length) fail(`${rel}: 缺字段 ${missing.join(', ')}`)
    if ('status' in data && !['active', 'deprecated'].includes(data.status)) fail(`${rel}: status 非法「${data.status}」`)
    const sources = Array.isArray(data.source) ? data.source : data.source ? [data.source] : []
    if (!sources.length) fail(`${rel}: source 为空`)
    for (const src of sources) {
      const r = sourceResolve(src)
      if (r === 'missing') fail(`${rel}: source 无法解析 → ${src}`)
      else if (r === 'archived') warn(`${rel}: source 已通过归档搬迁解析（卡片写 ${src}，实际在 .../archive/）`)
    }
    for (const k of DEPTH) if (!(k in data)) warn(`${rel}: 缺 ${k}（按存量豁免视为 code-read，触碰时必须补齐）`)
    if (data.status === 'active' && !menuText.includes(f)) fail(`${rel}: active 卡未进 menu.md 路由`)
    if (data.status === 'deprecated' && !/无替代|replaced|superseded|替代/.test(read(rel))) warn(`${rel}: deprecated 未写明替代关系`)
  }
}
ok(`知识卡 ${cards.length} 张：字段/枚举/source/路由检查完成`)

// 1b) domain 值域：卡片 domain 必须是项目上下文地图（shadow-docs/domain.md）的登记名。
// 值域取「限界上下文 / 横切实践 / 外部上游」三张表首列的反引号名称；横切实践可作 domain 值，但不是业务上下文。
// 地图缺失只 warn：尚未建图的仓不该被本门的规范升级卡住（与「存量卡片不回溯迁移」同源）。
const DOMAIN_SECTIONS = ['## 限界上下文', '## 横切实践', '## 外部上游']
function loadDomainVocab() {
  if (!existsSync(join(root, 'shadow-docs', 'domain.md'))) return null
  const vocab = new Set()
  let inSection = false
  for (const line of read('shadow-docs/domain.md').split('\n')) {
    if (line.startsWith('## ')) { inSection = DOMAIN_SECTIONS.some(k => line.trim().startsWith(k)); continue }
    if (!inSection || !line.startsWith('|')) continue
    const m = /^`([^`]+)`$/.exec((line.split('|')[1] || '').trim())
    if (m) vocab.add(m[1])
  }
  return vocab
}
const domainVocab = loadDomainVocab()
let domainChecked = 0
for (const { rel, data } of cards) {
  if (!data.domain) continue
  if (!domainVocab) { warn('无法校验卡片 domain：缺 shadow-docs/domain.md 上下文地图（后续卡片须先建图）'); break }
  if (domainVocab.has(data.domain)) { domainChecked++; ok(`${rel}: domain「${data.domain}」∈ 地图值域`) }
  else fail(`${rel}: domain「${data.domain}」不在上下文地图值域内（合法值: ${[...domainVocab].join(', ')}）`)
}
if (domainVocab) console.log(`[.] 上下文地图值域: ${[...domainVocab].join(', ')}（命中 ${domainChecked}/${cards.length} 卡）`)

// 1c) 变更台账：INDEX 是 change 的对外视图，必须与 git 里的目录集合和每个 brief 的 status 同源。
// 立项实证：20261012-refactor-flow-order-publish-stage 的 PR #49 已 merged，brief 既没归档也没进 INDEX，
// 而它正是「归档并入 release 末段」那条新流程的第一次自证——门看不见台账漂移，等于新流程没有闭环证据。
// 修复走 CLI 的 index rebuild plan/execute（唯一合法写入方），禁止手改 INDEX（rules/iron-laws.md §6）。
const LEDGER = 'shadow-docs/INDEX.md'
const ledgerText = existsSync(join(root, LEDGER)) ? read(LEDGER) : ''
if (!ledgerText) fail(`${LEDGER}: 缺失或为空（变更台账是归档闭环的对外视图）`)
const LIFECYCLE = ['draft', 'proposed', 'branched', 'reviewed', 'committed', 'published', 'archived', '✅ 完成']
const rows = new Map()
for (const line of ledgerText.split('\n')) {
  const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
  if (cells.length !== 3 || !cells[0] || cells[0] === '变更' || /^:?-{2,}:?$/.test(cells[0].replace(/-/g, '-'))) continue
  if (/^\s*$/.test(cells[0].replace(/[-: ]/g, ''))) continue
  rows.set(cells[0], { status: cells[1], path: cells[2] })
}
const briefDirs = new Map()
for (const p of trackedList) {
  const m = /^shadow-docs\/changes\/(?:archive\/)?([^/]+)\/brief\.md$/.exec(p)
  if (m) briefDirs.set(m[1], { archived: p.startsWith('shadow-docs/changes/archive/'), path: p })
}
const briefStatus = p => {
  try { return JSON.parse(read(p).slice(read(p).indexOf('{'), read(p).indexOf('\n---', 4))).status } catch { return null }
}
let ledgerLive = 0, ledgerArchived = 0
for (const [name, d] of briefDirs) {
  const row = rows.get(name)
  if (!row) { fail(`台账缺条目 ${name}（${d.archived ? '已归档' : '在途'}目录已进 git，INDEX 未登记；用 shadow-dev index rebuild plan/execute 补）`); continue }
  if (d.archived) {
    ledgerArchived++
    if (row.status !== '✅ 完成') fail(`台账条目 ${name} 状态为「${row.status}」，已归档目录应为「✅ 完成」`)
    if (!row.path.includes('/archive/')) fail(`台账条目 ${name} 指向 ${row.path}，已归档 brief 的条目路径应含 changes/archive/`)
  } else {
    ledgerLive++
    const st = briefStatus(d.path)
    if (st === null) { fail(`台账条目 ${name}: brief frontmatter 无法解析，status 不可判定`); continue }
    if (st === 'archived') fail(`台账条目 ${name}: brief status 为 archived，但目录仍在 changes/ 下未移入 archive/`)
    if (!LIFECYCLE.includes(row.status)) fail(`台账条目 ${name} 状态列为非法值「${row.status}」（不在 brief 生命周期枚举内，台账被手改过）`)
    // 在途 change 的滞后是**结构性**的，不是漂移：INDEX 是派生视图，只有 CLI 的 index rebuild/archive 会重写它，
    // 而 brief.status 在 branch/review/release 每一步都会前进。本 change 自己撞上的第一条反例——
    // index rebuild 写下行（branched）后 release 才把 brief 推到 published，若按严格相等执法，
    // 每个在途 change 的 release 提交都必然判红，门就成了自毁装置。滞后降为 warn，非法值与缺条目仍判红。
    if (row.status !== st) warn(`台账条目 ${name} 状态列为「${row.status}」，brief.status 已前进到「${st}」（在途滞后，archive 或 index rebuild 时消解）`)
  }
}
for (const [name, row] of rows) {
  if (briefDirs.has(name)) continue
  // 允许「条目已登记、目录尚未提交」的在途形态（index rebuild 早于 commit 是合法顺序，
  // 本 change 自己就走这条：先 index rebuild execute 写台账，再由 release 把 brief 与 INDEX 同批提交）。
  // 真正要判红的是路径本身不存在——那是写错的或目录已被移动的死条目。
  if (existsSync(join(root, row.path))) { warn(`台账条目 ${name} 指向 ${row.path}，但该 brief 尚未进 git（在途变更，提交后自动消解）`); continue }
  fail(`台账幽灵条目 ${name} → ${row.path}（INDEX 有行但磁盘上没有对应 brief.md；路径写错或目录已被移动）`)
}
ok(`变更台账 INDEX 条目 ${rows.size} / 已跟踪变更目录 ${briefDirs.size}（在途 ${ledgerLive}、已归档 ${ledgerArchived}）`)

// 2) 技能清单：SKILL.md 必有 name + description，且 name 与目录同名（宿主按 name 发现技能）
const skillDirs = readdirSync(join(root, 'skills')).filter(d => statSync(join(root, 'skills', d)).isDirectory())
for (const d of skillDirs) {
  const rel = `skills/${d}/SKILL.md`
  if (!existsSync(join(root, rel))) { fail(`${rel}: 目录内缺 SKILL.md`); continue }
  const fm = parseFrontmatter(read(rel)) || {}
  for (const k of ['name', 'description']) if (!(k in fm)) fail(`${rel}: frontmatter 缺 ${k}`)
  if ('name' in fm && fm.name !== d) fail(`${rel}: name「${fm.name}」与目录名「${d}」不一致`)
}
ok(`技能 ${skillDirs.length} 个：name/description 与目录一致性检查完成`)

// 3) 引用死链：live 文件里指向 norms|knowledge|rules|docs|adapters|scripts 的路径必须存在
const REF = /(?<![\w/.-])((?:norms|knowledge|rules|docs|adapters|scripts)\/[A-Za-z0-9_.-]+\.(?:md|json|mjs|sh))/g
// 变更集（工作树/暂存/相对 base）内的文件才允许存在「尚未落盘的新路径」引用，否则一律判死链
const changedFiles = new Set((() => {
  try {
    return execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' })
      .split('\n').filter(Boolean).map(l => l.slice(3).trim().split(' -> ').pop())
  } catch { return [] }
})())
// rel 始终是仓库根相对路径，且 shadow-docs/** 不进引用扫描：归档 brief 是历史叙述，
// 按现行文本执法会把「当时怎么写」误判成「现在怎么写错」。
const live = scanList.filter(p => /\.(md|json|mjs|sh)$/.test(p) && !p.startsWith('shadow-docs'))
const dead = []
for (const rel of live) for (const m of new Set(read(rel).match(REF) || [])) {
  if (!existsSync(join(root, m)) && !changedFiles.has(rel) && !changedFiles.has(m)) dead.push(`${rel} → ${m}`)
}
for (const rel of live) {
  if (!changedFiles.has(rel)) continue
  for (const m of new Set(read(rel).match(REF) || [])) if (!existsSync(join(root, m))) warn(`变更文件 ${rel} 引用了尚未落盘的 ${m}（提交前需确认该文件真实存在）`)
}
dead.forEach(d => fail(`死链 ${d}`))
ok(`引用扫描 ${live.length} 个文件、路径断言 ${dead.length ? dead.length + ' 处死链' : '零死链'}、enumeration=${enumeration}`)

// 4) 孤儿规范：每个 norms/*.md 至少要被 menu 路由或被某处引用命中
for (const f of readdirSync(join(root, 'norms')).filter(x => x.endsWith('.md'))) {
  const hit = menuText.includes(f) || live.some(rel => rel !== `norms/${f}` && read(rel).includes(f))
  if (!hit) fail(`norms/${f}: 未被 menu 路由也未被任何文件引用（孤儿规范永远不会被执行）`)
}
ok('孤儿规范检查完成')

// 5) 废弃残留：--forbid 'a,b' 传入的 token 不允许出现在 live 文件
const forbidIdx = process.argv.indexOf('--forbid')
const forbid = forbidIdx >= 0 ? (process.argv[forbidIdx + 1] || '').split(',').map(x => x.trim()).filter(Boolean) : []
// 禁项作用于**规范文本**，不作用于历史路径溯源：frontmatter 的 source 块记录的是 brief 真实路径，
// 而 change 目录名本身可能内嵌被禁字样（实测：本仓一条以「干掉旧验证制度」命名的 change，
// 让引用它做来源的三张卡集体判红）。逐行扫描并跳过 source 块，既保住执法力度，
// 又不逼执行者为了绿灯去改历史溯源。同一条纪律反过来也约束注释与散文：禁项串只活在 CI 参数里。
function forbidHits(rel, token) {
  const lines = read(rel).split('\n')
  const hits = []
  let inSource = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^source:\s*$/.test(line)) { inSource = true; continue }
    if (inSource) {
      if (/^\s+-\s/.test(line)) { continue }
      inSource = false
    }
    if (line.includes(token)) hits.push(i + 1)
  }
  return hits
}
for (const token of forbid) {
  const hits = []
  for (const rel of live) {
    for (const ln of forbidHits(rel, token)) hits.push(`${rel}:${ln}`)
  }
  if (hits.length) fail(`残留 token「${token}」出现在: ${hits.join(', ')}`)
}
if (forbid.length) ok(`废弃 token 扫描完成（${forbid.length} 项）`)

console.log(oks.join('\n'))
if (warns.length) console.log(warns.join('\n'))
if (fails.length) console.error(fails.join('\n'))
console.log(`\n摘要: ok=${oks.length} warn=${warns.length} fail=${fails.length}`)
if (process.argv.includes('--strict') && warns.length) { console.error('✗ --strict：warn 也判红'); process.exitCode = 1 }
else process.exitCode = fails.length ? 1 : 0
