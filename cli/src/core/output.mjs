import { createHash } from 'node:crypto'

export const EXIT = { input: 1, confirmation: 2, external: 3, unsupported: 4 }

export const HELP = [
  'version',
  'repo inspect',
  'change create|approve',
  'issue plan|execute',
  'branch plan|execute',
  'sync plan|execute',
  'conflict inspect',
  'task list|set',
  'review plan|execute',
  'commit plan|execute',
  'publish plan|execute',
  'release plan|execute',
  'pr inspect',
  'reconcile plan|execute',
  'archive plan|execute',
  'index rebuild plan|execute',
].join('\n')

export function out(v, s = 0) {
  console.log(JSON.stringify(v))
  process.exitCode = s
}

export function fail(c, m = c, s = 1) {
  out({ ok: false, error: { code: c, message: m } }, s)
}

export function ext(c, m = c) {
  throw Object.assign(Error(m), { code: c, status: EXIT.external })
}

export function canon(v) {
  if (Array.isArray(v)) return `[${v.map(canon)}]`
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canon(v[k])}`)}}`
  return JSON.stringify(v)
}

export function hash(v) {
  return createHash('sha256').update(canon(v)).digest('hex')
}

export function norm(d) {
  if (!d || typeof d !== 'object' || !d.brief || !d.brief.workflow) return d
  const v = { ...d, brief: { ...d.brief, workflow: { ...d.brief.workflow } } }
  delete v.brief.workflow.planHash
  delete v.brief.workflow.release
  delete v.brief.workflow.issuePlan
  return v
}

export function plan(c, d) {
  return { ok: true, command: `${c}.plan`, planHash: hash({ command: c, data: norm(d) }), data: d }
}
