import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { brief } from '../core/brief.mjs'
import { name } from '../core/args.mjs'
import { pr } from '../core/github.mjs'

export async function prInspect(r, o) {
  return pr(brief(r, name(o)), r)
}

export function conflictInspect(r, o) {
  const n = name(o)
  const files = new Set(brief(r, n).data.files || [])
  const base = join(r, 'shadow-docs', 'changes')
  const overlaps = []
  for (const e of readdirSync(base, { withFileTypes: true }).filter(x => x.isDirectory() && x.name !== n && x.name !== 'archive')) try {
    const fs = (brief(r, e.name).data.files || []).filter(x => files.has(x)).sort()
    if (fs.length) overlaps.push({ change: e.name, files: fs })
  } catch {}
  return { overlaps }
}
