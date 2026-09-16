import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const ap = (r, n) => join(r, 'shadow-docs', 'changes', n, 'brief.md')
export const xp = (r, n) => join(r, 'shadow-docs', 'changes', 'archive', n, 'brief.md')

export function brief(r, n, arch = false) {
  const path = arch ? xp(r, n) : ap(r, n)
  if (!existsSync(path)) throw Error('BRIEF_NOT_FOUND')
  const t = readFileSync(path, 'utf8')
  const e = t.indexOf('\n---\n', 4)
  if (e < 0) throw Error('BRIEF_FRONTMATTER_REQUIRED')
  return { path, data: JSON.parse(t.slice(4, e)), body: t.slice(e + 5) }
}

export function write(b) {
  mkdirSync(dirname(b.path), { recursive: true })
  const t = b.path + `.tmp-${process.pid}`
  writeFileSync(t, `---\n${JSON.stringify(b.data, null, 2)}\n---\n${b.body}`)
  renameSync(t, b.path)
}

export function tasks(s) {
  return [...s.matchAll(/^\s*- \[([ xX])\]\s+(.+)$/gm)].map((m, i) => ({ id: `task-${i + 1}`, done: m[1].toLowerCase() === 'x', text: m[2] }))
}

export function index(r) {
  const rows = []
  const base = join(r, 'shadow-docs', 'changes')
  for (const a of [false, true]) {
    const d = a ? join(base, 'archive') : base
    if (!existsSync(d)) continue
    for (const e of readdirSync(d, { withFileTypes: true }).filter(x => x.isDirectory() && (a || x.name !== 'archive'))) {
      try {
        const b = brief(r, e.name, a)
        rows.push({ n: e.name, s: a ? '✅ 完成' : b.data.status, p: `shadow-docs/changes/${a ? 'archive/' : ''}${e.name}/brief.md` })
      } catch {}
    }
  }
  rows.sort((a, b) => a.n.localeCompare(b.n))
  return `# 变更索引\n\n| 变更 | 状态 | 路径 |\n|------|------|------|\n${rows.map(x => `| ${x.n} | ${x.s} | ${x.p} |`).join('\n')}\n`
}
