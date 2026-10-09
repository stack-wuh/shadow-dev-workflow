#!/usr/bin/env node
// 分发一致性门：skills 引用的命令 ⊆ 产物 requiresCommands ⊆ 已安装 CLI 的命令目录。
// 引用扫描严禁跨行：早先用裸 \s+ 会把下一条 `shadow-dev` 的前缀吃进来（实测 `repo inspect\nshadow-dev`），
// 导致部分命令根本没被统计——门会假绿，而假绿的门比没有门更危险。
// 分工：cliVersion pin 只决定「装哪个 CLI」，requiresCommands 决定「这份内容能不能装进这个 CLI」，
// 本门负责让两者不互相冒充。用法：npm run check:requires（CI 或本机皆可，SHADOW_DEV_CLI 可指定 cli.mjs）。
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const declared = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).requiresCommands || []
const set = new Set(declared)
const refs = new Map()
for (const d of readdirSync(join(root, 'skills'))) {
  const f = join(root, 'skills', d, 'SKILL.md')
  if (!existsSync(f)) continue
  for (const m of readFileSync(f, 'utf8').matchAll(/shadow-dev[^\S\n]+([a-z][\w-]*(?:[^\S\n]+[a-z][\w-]*){0,2})/g)) {
    const words = m[1].replace(/\//g, ' ').split(/\s+/).filter(Boolean)
    const cand = [words.slice(0, 3).join('.'), words.slice(0, 2).join('.'), words[0]]
    const key = cand.find(k => set.has(k)) || words.slice(0, 2).join('.') + ' (未声明)'
    refs.set(key, (refs.get(key) || 0) + 1)
  }
}
const undeclared = [...refs.keys()].filter(k => k.endsWith('(未声明)'))
let catalog = null, missingInCli = []
const cli = process.env.SHADOW_DEV_CLI
const argv = cli ? [process.execPath, [cli, 'help', '--full', '--json']] : ['shadow-dev', ['help', '--full', '--json']]
try { catalog = Object.keys(JSON.parse(execFileSync(argv[0], argv[1], { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] })).data.commands || {}) } catch { catalog = null }
if (catalog) missingInCli = declared.filter(k => !catalog.includes(k))
console.log(`declared=${declared.length} skills-referenced=${refs.size} undeclared=[${undeclared.join(', ')}] cli-catalog=${catalog ? catalog.length : 'unresolved'} missing-in-cli=[${missingInCli.join(', ')}]`)
if (undeclared.length) console.error('✗ skills 有命令未进 requiresCommands 声明:', undeclared.join(', '))
if (missingInCli.length) console.error('✗ requiresCommands 声明的命令在已装 CLI 里不存在（pin 或 CLI 版本过旧）:', missingInCli.join(', '))
if (!undeclared.length && !missingInCli.length) console.log('✓ skills ⊆ requiresCommands' + (catalog ? ' ⊆ CLI 命令目录' : '（CLI 目录未参与断言）'))
process.exitCode = (undeclared.length || missingInCli.length) ? 1 : 0
