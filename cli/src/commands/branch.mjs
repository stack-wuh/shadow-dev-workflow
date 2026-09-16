import { git } from '../core/git.mjs'
import { write } from '../core/brief.mjs'

export function data({ n, b, q }) {
  return { name: n, branch: `${b.data.type}/${n}`, baseBranch: b.data.baseBranch || 'main', brief: b.data, repo: q }
}

export function exec({ r, x, b }) {
  if (x.repo.branch === x.baseBranch) git(r, ['switch', '-c', x.branch])
  b.data.branch = x.branch
  b.data.status = 'branched'
  write(b)
  return { branch: x.branch }
}
