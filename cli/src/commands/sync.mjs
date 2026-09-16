import { git } from '../core/git.mjs'
import { ext } from '../core/output.mjs'

export function data({ r, n, b, q }) {
  const dirty = q.changedFiles.filter(x => !x.startsWith('shadow-docs/'))
  if (dirty.length) throw Error('DIRTY_WORKTREE')
  try {
    git(r, ['fetch', 'origin', '--prune'])
  } catch {
    ext('GIT_FETCH_FAILED')
  }
  const up = `origin/${b.data.baseBranch || q.branch}`
  const to = git(r, ['rev-parse', up])
  try {
    git(r, ['merge-base', '--is-ancestor', q.head, to])
  } catch {
    throw Error('SYNC_NOT_FAST_FORWARD')
  }
  return { name: n, from: q.head, to, upstream: up }
}

export function exec({ r, x }) {
  try {
    git(r, ['merge', '--ff-only', x.to])
  } catch {
    ext('GIT_FAST_FORWARD_FAILED')
  }
  return { head: git(r, ['rev-parse', 'HEAD']) }
}
