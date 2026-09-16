import { EXIT, plan } from '../core/output.mjs'
import { confirm, name } from '../core/args.mjs'
import { brief } from '../core/brief.mjs'
import { repo } from '../core/git.mjs'
import * as branch from './branch.mjs'
import * as sync from './sync.mjs'
import * as review from './review.mjs'
import * as commit from './commit.mjs'
import * as publish from './publish.mjs'
import * as release from './release.mjs'
import * as reconcile from './reconcile.mjs'
import * as archive from './archive.mjs'
import * as issue from './issue.mjs'

export const DOMAINS = new Set(['branch', 'sync', 'review', 'commit', 'publish', 'release', 'reconcile', 'archive', 'issue'])

const registry = { branch, sync, review, commit, publish, release, reconcile, archive, issue }

async function data(r, d, o) {
  const n = name(o)
  const b = brief(r, n)
  const q = repo(r)
  const domain = registry[d]
  return domain ? domain.data({ r, o, n, b, q }) : { name: n, brief: b.data, repo: q }
}

export async function planned(r, d, o) {
  return plan(d, await data(r, d, o))
}

export async function execute(r, d, o) {
  confirm(o)
  const e = await planned(r, d, o)
  if (o['plan-hash'] && o['plan-hash'] !== e.planHash) throw Error('PLAN_HASH_INVALID')
  const n = name(o)
  const b = brief(r, n)
  const x = e.data
  if (b.data.workflow.planHash !== e.planHash) throw Object.assign(Error(b.data.workflow.planHash ? 'PLAN_HASH_INVALID' : 'PLAN_HASH_REQUIRED'), { status: b.data.workflow.planHash ? EXIT.input : EXIT.confirmation })
  const domain = registry[d]
  if (!domain) throw Object.assign(Error('UNSUPPORTED_OPERATION'), { status: EXIT.unsupported })
  return domain.exec({ r, o, n, b, x })
}
