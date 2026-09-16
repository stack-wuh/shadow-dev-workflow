import { api, pr } from '../core/github.mjs'
import { tasks, write } from '../core/brief.mjs'

export async function data({ r, n, b, q }) {
  let review = b.data.review
  if (review?.conclusion === 'passed' && review.verifiedCommit !== q.head) review = { conclusion: 'pending', verifiedCommit: null, verifiedAt: null }
  let gh = b.data.github || {}
  if (gh.repository && gh.pullRequest && !gh.pullRequestUrl) {
    const x = await pr(b, r)
    gh = { ...gh, pullRequestUrl: x.html_url || null }
  }
  if (gh.repository && gh.issue && !gh.issueUrl) {
    const x = await api(`/repos/${gh.repository}/issues/${gh.issue}`)
    gh = { ...gh, issueUrl: x.html_url || null }
  }
  const ts = tasks(b.body)
  return { name: n, nextStatus: ts.length && ts.every(x => x.done) ? 'implemented' : b.data.status, review, github: gh, brief: b.data, repo: q }
}

export function exec({ b, x }) {
  b.data.status = x.nextStatus
  b.data.review = x.review
  b.data.github = x.github
  write(b)
  return { status: x.nextStatus, review: x.review, github: x.github }
}
