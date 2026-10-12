#!/usr/bin/env node
// 打包发布产物：dist/shadow-dev-workflow-v<version>.tar.gz，解包得到 shadow-dev-workflow/ 目录
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const argOut = (() => { const i = process.argv.indexOf('--out'); return i >= 0 ? process.argv[i + 1] : null })()
// 并发安全（INV-6）：离线冒烟门与 pack 测试同时跑时不得争用同一个 dist——并行 runner 上会 EBUSY: resource busy or locked
const dist = argOut ? resolve(argOut) : join(root, 'dist')
// tar 必须用相对路径（Git Bash 会把 D:\... 读成远程主机:路径），所以 --out 时把 tar 的 cwd 换到 out 的父目录，让 dist/... 仍是相对路径
const tarCwd = argOut ? dirname(dist) : root
const staging = join(dist, 'staging')

// 运行必需集：hook fallback 依赖 scripts/install-cli.sh；.codex-plugin/ 与 .agents/ 随产物分发供 Codex 宿主消费；排除 test/shadow-docs/changes 等开发产物
const FILES = ['marketplace.json', 'package.json', 'README.md', 'menu.md']
const DIRS = ['.agents', '.codex-plugin', 'skills', 'adapters', 'hooks', 'rules', 'knowledge', 'norms', 'docs', 'scripts']

rmSync(dist, { recursive: true, force: true })
mkdirSync(staging, { recursive: true })
for (const f of [...FILES, ...DIRS]) {
  cpSync(join(root, f), join(staging, 'shadow-dev-workflow', f), { recursive: true })
}
const artifact = join(dist, `shadow-dev-workflow-v${version}.tar.gz`)
try {
  // tar 必须用相对路径：Git Bash 的 tar 会把 "D:\..." 解析成"远程主机:路径"
  execFileSync('tar', ['-czf', `dist/shadow-dev-workflow-v${version}.tar.gz`, '-C', 'dist/staging', 'shadow-dev-workflow'], { cwd: tarCwd })
  rmSync(staging, { recursive: true, force: true })
  console.log(artifact)
} catch {
  rmSync(dist, { recursive: true, force: true })
  console.error('pack failed: system `tar` is required on PATH (Windows 10+ ships tar.exe natively; otherwise run from Git Bash)')
  process.exitCode = 1
}
