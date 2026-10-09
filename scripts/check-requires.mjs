#!/usr/bin/env node
// 分发一致性门：skills 引用的命令 ⊆ 产物 requiresCommands ⊆ 已安装 CLI 的命令目录。
// 动机（20261009 复盘 P0-A）：静态 cliVersion pin 被实证同步失败（README v1.1.0 / pin v1.4.0 / skills 要 v1.5.0），
// 改由能力名做判定——命令键是唯一会随两侧自然同步的货币。CI 之外的本机门：`npm run check:requires`。
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const declared = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).requiresCommands || []
const set = new Set(declared)

// 扫 skills/ 里的 `shadow-dev <域> <动作…>` 引用（三词优先，逐段回退）
const refs = new Map()
for (const d of readdirSync(join(root, 'skills'))) {
  const f = join(root, 'skills', d, 'SKILL.md')
  if (!existsSync(f)) continue
  for (const m of readFileSync(f, 'utf8').matchAll(/shadow-dev\s+([a-z][\w-]*(?:\s+[a-z][\w-]*){0,2})/g)) {
    const words = m[1].replace(/\//g, ' ').split(/\s+/).filter(Boolean)
    const candidates = [words.slice(0, 3).join('.'), words.slice(0, 2).join('.'), words[0]]
    const hit = candidates.find(k => set.has(k))
    refs.set(hit || candidates[candidates.length - 1] + ' (未声明)', (refs.get(hit || candidates[candidates.length - 1] + ' (未声明)') || 0) + 1)
  }
}
const undeclared = [...refs.keys()].filter(k => k.endsWith('(未声明)'))
let catalog = null, missingInCli = []
const cli = process.env.SHADOW_DEV_CLI
try {
  const out = cli
    ? execFileSync(process.execPath, [cli, 'help', '--full', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    : execFileSync('shadow-dev', ['help', '--full', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  catalog = Object.keys(JSON.parse(out).data.commands || {})
} catch { /* 无 CLI 时只做 skills↔声明一层断言，并在结论里写明 */ }
if (catalog) missingInCli = declared.filter(k => !catalog.includes(k))

console.log(`declared=${declared.length} skills-referenced=${refs.size} undeclared=[${undeclared.join(', ')}] cli-catalog=${catalog ? catalog.length : 'unresolved'} missing-in-cli=[${missingInCli.join(', ')}]`)
for (const [k, n] of [...refs].sort()) console.log(`  ${String(n).padStart(2)}x ${k}`)
if (undeclared.length || missingInCli.length) { console.error('✗ 分发一致性不成立'); process.exitCode = 1 }
else console.log('✓ skills ⊆ requiresCommands' + (catalog ? ' ⊆ CLI 命令目录' : '（CLI 目录未参与断言）'))
