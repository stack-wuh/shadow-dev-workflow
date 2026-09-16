import { tasks, write } from '../core/brief.mjs'

export function data({ n, b, q }) {
  return { name: n, verifiedCommit: q.head, brief: b.data, repo: q }
}

export function exec({ o, b, x }) {
  const ts = tasks(b.body)
  if (ts.length && !ts.every(t => t.done)) throw Error('TASKS_NOT_COMPLETE')
  const c = o.conclusion || 'passed'
  if (!['passed', 'blocked'].includes(c)) throw Error('INVALID_CONCLUSION')
  if (o.knowledge && !['新增', '更新', '废弃', '无需变更'].includes(o.knowledge)) throw Error('INVALID_KNOWLEDGE')
  b.data.review = { conclusion: c, verifiedCommit: x.verifiedCommit, verifiedAt: c === 'passed' ? new Date().toISOString() : b.data.review?.verifiedAt || null }
  b.data.knowledge = o.knowledge ? { action: o.knowledge, target: o.target || null, reason: o.reason || null } : null
  if (c === 'passed') b.data.status = 'reviewed'
  write(b)
  return { conclusion: c, knowledge: b.data.knowledge }
}
