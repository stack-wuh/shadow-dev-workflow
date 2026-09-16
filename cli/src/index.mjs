#!/usr/bin/env node
import { args, confirm, name } from './core/args.mjs'
import { HELP, out, fail } from './core/output.mjs'
import { repo, root } from './core/git.mjs'
import { brief, write } from './core/brief.mjs'
import { VERSION } from './version.mjs'
import { DOMAINS, execute, planned } from './commands/domain.mjs'
import { conflictInspect, prInspect } from './commands/inspect.mjs'
import * as change from './commands/change.mjs'
import * as task from './commands/task.mjs'
import { rebuildExecute, rebuildPlan } from './commands/rebuild.mjs'

export async function handle(r, p, o) {
  const [d, a, s] = p
  if (!d || d === 'help') return out({ ok: true, command: 'help', data: HELP })
  if (d === 'repo' && a === 'inspect') return out({ ok: true, command: 'repo.inspect', data: repo(r) })
  if (d === 'pr' && a === 'inspect') return out({ ok: true, command: 'pr.inspect', data: await prInspect(r, o) })
  if (d === 'conflict' && a === 'inspect') return out({ ok: true, command: 'conflict.inspect', data: conflictInspect(r, o) })
  if (d === 'task' && a === 'list') return out({ ok: true, command: 'task.list', data: task.list(r, o) })
  if (d === 'task' && a === 'set') return out({ ok: true, command: 'task.set', data: task.set(r, o) })
  if (d === 'change' && a === 'create') return out({ ok: true, command: 'change.create', data: change.create(r, o) })
  if (d === 'change' && a === 'approve') return out({ ok: true, command: 'change.approve', data: change.approve(r, o) })
  if (d === 'index' && a === 'rebuild' && s === 'plan') return out(rebuildPlan(r))
  if (d === 'index' && a === 'rebuild' && s === 'execute') return out({ ok: true, command: 'index.rebuild.execute', data: rebuildExecute(r, o) })
  if (DOMAINS.has(d) && a === 'plan') {
    const e = await planned(r, d, o)
    const b = brief(r, name(o))
    b.data.workflow.planHash = e.planHash
    if (d === 'release') b.data.workflow.release = { files: e.data.files, message: e.data.message, title: e.data.title, body: e.data.body }
    if (d === 'issue') b.data.workflow.issuePlan = { title: e.data.title, body: e.data.body, labels: e.data.labels }
    write(b)
    return out(e)
  }
  if (DOMAINS.has(d) && a === 'execute') {
    confirm(o)
    return out({ ok: true, command: `${d}.execute`, data: await execute(r, d, o) })
  }
  return fail('UNKNOWN_COMMAND', `unsupported command: ${p.join(' ')}`)
}

try {
  const { p, o } = args(process.argv.slice(2))
  if ('version' in o) out({ ok: true, command: 'version', data: { version: VERSION } })
  else if (p[0] === 'version' && p.length === 1) out({ ok: true, command: 'version', data: { version: VERSION } })
  else if (p.includes('--help') || !p.length) out({ ok: true, command: 'help', data: HELP })
  else await handle(root(), p, o)
} catch (e) {
  fail(e.code || e.message, e.message, e.status || 1)
}
