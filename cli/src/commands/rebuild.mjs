import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { index } from '../core/brief.mjs'
import { plan } from '../core/output.mjs'
import { confirm } from '../core/args.mjs'

export function rebuildPlan(r) {
  return plan('index.rebuild', { content: index(r), current: existsSync(join(r, 'shadow-docs', 'INDEX.md')) ? readFileSync(join(r, 'shadow-docs', 'INDEX.md'), 'utf8') : '' })
}

export function rebuildExecute(r, o) {
  confirm(o, true)
  const e = rebuildPlan(r)
  if (e.planHash !== o['plan-hash']) throw Error('PLAN_HASH_INVALID')
  writeFileSync(join(r, 'shadow-docs', 'INDEX.md'), e.data.content)
  return { path: 'shadow-docs/INDEX.md' }
}
