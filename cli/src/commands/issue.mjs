import { api, repository } from '../core/github.mjs'
import { write } from '../core/brief.mjs'

export function data({ r, o, n, b, q }) {
  const w = b.data.workflow.issuePlan || {}
  return { name: n, title: o.title ?? w.title ?? null, body: o.body ?? w.body ?? '', labels: String(o.labels ?? w.labels ?? '').split(',').filter(Boolean).sort(), repository: repository(b, r), brief: b.data, repo: q }
}

export async function exec({ x, b }) {
  if (!x.title) throw Error('ISSUE_TITLE_REQUIRED')
  const z = await api(`/repos/${x.repository}/issues`, { method: 'POST', body: JSON.stringify({ title: x.title, body: x.body, labels: x.labels }) })
  b.data.github.repository = x.repository
  b.data.github.issue = z.number
  b.data.github.issueUrl = z.html_url
  b.data.workflow.checkpoint = `issue:${z.number}`
  write(b)
  return { number: z.number, url: z.html_url }
}
