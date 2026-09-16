import { git } from '../core/git.mjs'
import { ext } from '../core/output.mjs'
import { ensurePr, repository } from '../core/github.mjs'
import { write } from '../core/brief.mjs'

export function data({ r, o, n, b, q }) {
  return { name: n, repository: repository(b, r), branch: b.data.branch || q.branch, baseBranch: b.data.baseBranch || 'main', title: o.title || n, body: o.body || '', head: q.head, brief: b.data }
}

export async function exec({ r, x, b }) {
  try {
    git(r, ['push', '-u', 'origin', x.branch], { timeout: 120000 })
  } catch {
    ext('GIT_PUSH_FAILED')
  }
  const { pr: z, created } = await ensurePr(x)
  b.data.github.pullRequest = z.number
  b.data.github.pullRequestUrl = z.html_url
  b.data.status = 'published'
  b.data.workflow.checkpoint = `pr:${z.number}`
  write(b)
  return { number: z.number, url: z.html_url, created }
}
