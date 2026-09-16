import { git } from '../core/git.mjs'
import { write } from '../core/brief.mjs'
import { EXIT } from '../core/output.mjs'

export function data({ o, n, b, q }) {
  return { name: n, files: String(o.files || '').split(',').filter(Boolean).sort(), message: o.message || null, brief: b.data, repo: q }
}

export function exec({ r, x, b }) {
  if (!x.message || !x.files.length) throw Error('COMMIT_INPUT_REQUIRED')
  if (x.files.some(f => ['.', '-A', '--all'].includes(f) || f.startsWith('../') || f.startsWith('/'))) throw Object.assign(Error('UNSUPPORTED_OPERATION'), { status: EXIT.unsupported })
  git(r, ['add', '--', ...x.files])
  git(r, ['commit', '-m', x.message])
  b.data.status = 'committed'
  b.data.workflow.checkpoint = git(r, ['rev-parse', 'HEAD'])
  write(b)
  return { commit: b.data.workflow.checkpoint }
}
