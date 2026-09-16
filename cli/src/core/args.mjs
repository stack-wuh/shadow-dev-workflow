import { existsSync, readFileSync } from 'node:fs'
import { EXIT } from './output.mjs'

export function args(a) {
  const p = []
  const o = {}
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) p.push(a[i])
    else {
      const k = a[i].slice(2)
      if (['confirm', 'json'].includes(k)) o[k] = true
      else o[k] = a[++i]
    }
  }
  return { p, o }
}

export function name(o) {
  if (!o.name) throw Error('NAME_REQUIRED')
  return o.name
}

export function confirm(o, ph = false) {
  if (!o.confirm) throw Object.assign(Error('CONFIRMATION_REQUIRED'), { status: EXIT.confirmation })
  if (ph && !o['plan-hash']) throw Object.assign(Error('PLAN_HASH_REQUIRED'), { status: EXIT.confirmation })
}

export function readBody(o, n) {
  if (!o['body-file']) return `\n# ${n}\n\n## 任务\n\n`
  const p = o['body-file']
  if (!existsSync(p)) throw Error('BODY_FILE_NOT_FOUND')
  const c = readFileSync(p, 'utf8').trim()
  if (!c) throw Error('BODY_FILE_EMPTY')
  return `\n${c}\n`
}
