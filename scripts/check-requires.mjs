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
// 严格模式：命令目录解析不到就判红。非严格模式保留旧行为（本机开发不被迫装 CLI），
// 但把降级态打进输出——CI 必须用严格模式，否则三级包含断言会退化成两级还判绿（假绿）。
const strict = process.argv.includes('--strict') || process.env.SHADOW_REQUIRE_CLI_CATALOG === '1'
let catalog = null, missingInCli = []
const cli = process.env.SHADOW_DEV_CLI
const argv = cli ? [process.execPath, [cli, 'help', '--full', '--json']] : ['shadow-dev', ['help', '--full', '--json']]
// 命令目录必须从「最后一个 {"ok" 行」取：CLI 的 human 帮助层在非 TTY 下会与 JSON 同流写 stdout，
// 整段 JSON.parse 必然抛错——本门曾在 CI 型环境下恒判 unresolved（假红），本机偶然纯 JSON 时才假绿。
// 同时加超时：无界的 execFileSync 会让整道门挂死（实测挂 3 分钟以上）。
const timeout = Number(process.env.SHADOW_CLI_TIMEOUT_MS || 20000)
// win32 上 PATH 里的托管 shim 是 shadow-dev.cmd，而 Node ≥18.20.3/20.12.2 起拒绝在无 shell 下启动 .bat/.cmd（EINVAL）。
// 不显式给 SHADOW_DEV_CLI 时，Windows 必须经 shell 解析命令目录——否则本门在 windows runner 恒 unresolved，
// strict 按设计判红而 ubuntu/macos 全绿（实证：PR #44/#45 的 gate 第 6 步）。降级态依旧自曝，不半绿。
const viaShell = process.platform === 'win32' && !cli
// shell 模式下把命令与参数合成单串、args 留空：既避开 DEP0190（args 与 shell:true 同用只拼接不转义），
// 也保证本门的命令行永远是静态字面量，没有任何外部输入进入 shell。
const bin = viaShell ? `${argv[0]} ${argv[1].join(' ')}` : argv[0]
const binArgs = viaShell ? [] : argv[1]
try {
  const out = execFileSync(bin, binArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout, shell: viaShell })
  const jsonLine = out.split(/\r?\n/).filter(l => l.startsWith('{')).pop()
  if (!jsonLine) throw new Error('命令目录无 JSON 契约行')
  catalog = Object.keys(JSON.parse(jsonLine).data.commands || {})
} catch (e) {
  catalog = null
  if (strict) console.error(`✗ 命令目录解析失败：${e.message?.slice(0, 120) || e}`)
}
if (catalog) missingInCli = declared.filter(k => !catalog.includes(k))
console.log(`declared=${declared.length} skills-referenced=${refs.size} undeclared=[${undeclared.join(', ')}] cli-catalog=${catalog ? catalog.length : 'unresolved'} catalog=${catalog ? 'resolved' : 'unresolved'} strict=${strict ? 'on' : 'off'} missing-in-cli=[${missingInCli.join(', ')}]`)
if (undeclared.length) console.error('✗ skills 有命令未进 requiresCommands 声明:', undeclared.join(', '))
if (missingInCli.length) console.error('✗ requiresCommands 声明的命令在已装 CLI 里不存在（pin 或 CLI 版本过旧）:', missingInCli.join(', '))
const degraded = !catalog
const pass = !undeclared.length && !missingInCli.length && !(strict && degraded)
if (strict && degraded) console.error('✗ --strict：解析不到 CLI 命令目录（PATH 无 shadow-dev 且 SHADOW_DEV_CLI 未指向可用 cli.mjs）——降级断言不可接受')
// 判红的轮子不许同时打 ✓：半绿消息本身就是假绿的形态
if (pass) console.log(catalog ? '✓ skills ⊆ requiresCommands ⊆ CLI 命令目录' : '✓ skills ⊆ requiresCommands（CLI 目录未参与断言）')
else if (!undeclared.length && !missingInCli.length) console.log('✗ 断言不完整，strict 判红（见上一行）')
else console.log('✗ 一致性门未通过')
process.exitCode = pass ? 0 : 1
