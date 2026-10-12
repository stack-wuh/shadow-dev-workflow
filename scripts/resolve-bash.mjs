#!/usr/bin/env node
// resolve-bash.mjs — 「可信 bash」解析器（本仓唯一口径，见 shadow-docs/INDEX.md 台账所属 change）。
// 动机：Windows 上 PATH 的 `bash` 常先命中 System32\bash.exe 或 WindowsApps\bash.exe —— 两者都是 WSL
// 入口桩：子系统未启用时执行任何脚本都返回 rc=1 并打印「安装 WSL」提示。测试若照单全收，失败会漂到
// 「pack 解包失败 / 安装器 rc=1」这类内容断言上，把环境问题伪装成代码回归（2026-10-12 复盘实证：
// npm test 在本机两挂，同一 commit 的 CI windows job 全绿，差异只在 runner 镜像里 Git Bash 在 PATH 上）。
// 与 hooks/hooks.codex.json 的 commandWindows 同一取向：先认 Git 的安装位置，再认 PATH，且明确去桩。
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const STUBS = [/\\system32\\bash\.exe$/i, /\\windowsapps\\bash\.exe$/i]
// 分隔符归一再判：SHADOW_DEV_BASH 常被写成正斜杠形态，正则里的 \\ 会漏判成「可信」
const isStub = p => STUBS.some(re => re.test(p.replace(/[\\/]/g, '\\')))

function winCandidates(env) {
  const out = []
  const pf = [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env['ProgramFiles(x86)'], env.LOCALAPPDATA]
    .filter(Boolean)
  for (const base of pf) {
    out.push([`${base}\\Git\\bin\\bash.exe`, 'git-bin'])
    out.push([`${base}\\Git\\usr\\bin\\bash.exe`, 'git-usr-bin'])
  }
  try {
    const found = execFileSync('where', ['bash'], { encoding: 'utf8' })
      .split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    for (const p of found) out.push([p, 'path:where'])
  } catch { /* where 不可用就不加候选 */ }
  return out
}

// 显式 SHADOW_DEV_BASH 是权威而非偏好：指向桩或不存在时一律判「不可用」并给出指名原因，
// 绝不悄悄换成别的 bash —— 静默降级是本仓所有门与装配逻辑的共同禁项。
function envOverride(env) {
  const p = env.SHADOW_DEV_BASH
  if (!p) return undefined
  if (isStub(p)) return { bad: p + '（WSL 入口桩，不能执行本仓脚本）' }
  if (!existsSync(p)) return { bad: p + '（SHADOW_DEV_BASH 指向的文件不存在）' }
  return { path: p, source: 'env:SHADOW_DEV_BASH' }
}

// 返回 { path, source } 或 null；null 时调用方必须抛指名原因的错，禁止静默改用别的解释器。
export function resolveBash(env = process.env, platform = process.platform) {
  const over = envOverride(env)
  if (over) return over.bad ? null : over
  if (platform !== 'win32') {
    const b = env.SHADOW_DEV_BASH || 'bash'
    return { path: b, source: env.SHADOW_DEV_BASH ? 'env:SHADOW_DEV_BASH' : 'posix-default' }
  }
  const tried = []
  for (const [p, source] of winCandidates(env)) {
    if (isStub(p)) { tried.push(`${p} [WSL 入口桩，拒绝]`); continue }
    if (!existsSync(p)) { tried.push(`${p} [不存在]`); continue }
    return { path: p, source }
  }
  return null
}

export function bashUnavailableMessage(env = process.env) {
  const tried = winCandidates(env).map(([p]) => p).join('\n    - ')
  return [
    '可信 bash 未找到：本仓测试需要能真实执行 tar/脚本的 bash（Windows 需 Git Bash）。',
    '  这不是代码回归——System32\\bash.exe 与 WindowsApps\\bash.exe 是 WSL 入口桩，未装子系统时恒 rc=1。',
    '  处置：装 Git for Windows，或用 SHADOW_DEV_BASH=<真实 bash.exe 绝对路径> 显式指定（该变量是权威，指向无效路径即判不可用，不改用别的解释器）。',
    env.SHADOW_DEV_BASH ? `  其中 SHADOW_DEV_BASH=${env.SHADOW_DEV_BASH} 已被判定无效。` : '',
    '  尝试过：',
    tried || '    （无候选路径）',
  ].join('\n')
}