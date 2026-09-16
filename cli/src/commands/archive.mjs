import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pr } from '../core/github.mjs'
import { index, write, xp } from '../core/brief.mjs'

export async function data({ r, n, b, q }) {
  if (b.data.review?.conclusion !== 'passed' || b.data.review.verifiedCommit !== q.head) throw Error('REVIEW_NOT_PASSED')
  const x = await pr(b, r)
  if (!x.merged) throw Error('PR_NOT_MERGED')
  return { name: n, pullRequest: x.number, head: q.head }
}

export function exec({ r, n, b, x }) {
  b.data.status = 'archived'
  b.data.workflow.checkpoint = `merged-pr:${x.pullRequest}`
  write(b)
  const dest = dirname(xp(r, n))
  mkdirSync(dirname(dest), { recursive: true })
  renameSync(dirname(b.path), dest)
  writeFileSync(join(r, 'shadow-docs', 'INDEX.md'), index(r))
  return { path: xp(r, n) }
}
