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
const live = []
// rel 必须始终是仓库根相对路径：用绝对路径拼 walk 会让 startsWith('shadow-docs') 守卫失效，
// 把 shadow-docs/changes/archive/** 的数十份历史 brief 当 live 文件读进来（既慢又会让历史文本污染判定）。
;(function walk(dir) {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue
    const rel = dir === '.' ? e.name : `${dir}/${e.name}`
    if (e.isDirectory()) walk(rel)
    else if (/\.(md|json|mjs|sh)$/.test(e.name) && !rel.startsWith('shadow-docs')) live.push(rel)
  }
})('.')
const dead = []
for (const rel of live) for (const m of new Set(read(rel).match(REF) || [])) {
  if (!existsSync(join(root, m)) && !changedFiles.has(rel) && !changedFiles.has(m)) dead.push(`${rel} → ${m}`)
}
for (const rel of live) {
  if (!changedFiles.has(rel)) continue
  for (const m of new Set(read(rel).match(REF) || [])) if (!existsSync(join(root, m))) warn(`变更文件 ${rel} 引用了尚未落盘的 ${m}（提交前需确认该文件真实存在）`)
}
dead.forEach(d => fail(`死链 ${d}`))
ok(`引用扫描 ${live.length} 个文件、路径断言 ${dead.length ? dead.length + ' 处死链' : '零死链'}`)

// 4) 孤儿规范：每个 norms/*.md 至少要被 menu 路由或被某处引用命中
for (const f of readdirSync(join(root, 'norms')).filter(x => x.endsWith('.md'))) {
  const hit = menuText.includes(f) || live.some(rel => rel !== `norms/${f}` && read(rel).includes(f))
  if (!hit) fail(`norms/${f}: 未被 menu 路由也未被任何文件引用（孤儿规范永远不会被执行）`)
}
ok('孤儿规范检查完成')

// 5) 废弃残留：--forbid 'a,b' 传入的 token 不允许出现在 live 文件
const forbidIdx = process.argv.indexOf('--forbid')
const forbid = forbidIdx >= 0 ? (process.argv[forbidIdx + 1] || '').split(',').map(x => x.trim()).filter(Boolean) : []
for (const token of forbid) {
  const hits = live.filter(rel => read(rel).includes(token))
  if (hits.length) fail(`残留 token「${token}」出现在: ${hits.join(', ')}`)
}
if (forbid.length) ok(`废弃 token 扫描完成（${forbid.length} 项）`)

console.log(oks.join('\n'))
if (warns.length) console.log(warns.join('\n'))
if (fails.length) console.error(fails.join('\n'))
console.log(`\n摘要: ok=${oks.length} warn=${warns.length} fail=${fails.length}`)
if (process.argv.includes('--strict') && warns.length) { console.error('✗ --strict：warn 也判红'); process.exitCode = 1 }
else process.exitCode = fails.length ? 1 : 0
