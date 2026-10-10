#!/usr/bin/env node
// 版本一致性：三处 manifest（package.json + .claude-plugin + .codex-plugin）必须同源。
// 历史上「发版漏同步」出血两次（35bd029、51a8eef/a06849f），本脚本把它变成机器判定。
// 用法：node scripts/bump-version.mjs 6.7.0     # 写入三处
//       node scripts/bump-version.mjs --check    # 只判定（CI / 发布前 / release tag 校验复用）
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const TARGETS = ['package.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json']
const readAll = () => TARGETS.map(p => ({ p, json: JSON.parse(readFileSync(join(root, p), 'utf8')) }))
const check = () => {
  const all = readAll(), versions = [...new Set(all.map(x => x.json.version))]
  if (versions.length !== 1) {
    console.error(`✗ 版本不同源: ${all.map(x => `${x.p}=${x.json.version}`).join(' | ')}`)
    console.error('  修正: node scripts/bump-version.mjs <version>')
    process.exitCode = 1
    return all
  }
  console.log(`✓ 三处 manifest 版本同源: ${versions[0]}（${all.length} 个文件）`)
  return all
}
const arg = process.argv[2]
if (arg === '--check' || arg === undefined) { process.exitCode ||= 0; check(); if (!arg) console.log('（未给版本号，仅判定；写入请用 bump-version.mjs <version>）') }
else {
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(arg)) { console.error(`✗ 非法版本号「${arg}」，需形如 6.7.0`); process.exit(1) }
  const before = check()
  for (const { p } of before) {
    const raw = readFileSync(join(root, p), 'utf8')
    const next = raw.replace(/("version"\s*:\s*")[^"]+(")/, `$1${arg}$2`)
    if (next === raw) { console.error(`✗ ${p}: 未找到 version 字段`); process.exit(1) }
    JSON.parse(next) // 先验可解析再落盘
    writeFileSync(join(root, p), next)
    console.log(`  · ${p} → ${arg}`)
  }
  const after = check()
  console.log(`✓ 版本 bump 完成: ${after[0].json.version}`)
}
