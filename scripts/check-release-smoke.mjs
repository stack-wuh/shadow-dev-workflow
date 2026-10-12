// 发布冒烟契约门：把「只有真发版才执行的那段断言」变成提交前可跑的两条腿。
// ①静态对账 publish-release.yml 读取的 payload 字段与 ROOT 拼法（INV-1/2/3）
// ②离线物化复现冒烟（INV-4）：用本地 dist 资产走 --from，不依赖 GitHub Release 是否存在
// 成因：v7.0.0 的 publish-release run 判红——冒烟读了 workflow execute 根本不返回的 current 字段，
// 又把 ROOT 手拼成 prefix/$CUR/shadow-dev-workflow，而 CLI 布局是 prefix/shadow-dev-workflow-<ver>。
// 用法：node scripts/check-release-smoke.mjs [--root <dir>] [--workflow <path>] [--no-materialize] [--materialize-tmp <dir>]
import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { execFileSync, execSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const argv = process.argv.slice(2)
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const root = resolve(argOf('--root') || process.cwd())
const wfPath = resolve(argOf('--workflow') || join(root, '.github', 'workflows', 'publish-release.yml'))
const doMaterialize = !argv.includes('--no-materialize')
const matTmp = argOf('--materialize-tmp')
const asPosix = (x) => String(x).split('\\').join('/')

// 字段契约表：键取自 CLI 源码 lib/domains/workflow.mjs 与 bind.mjs 的实际 return，不是猜测。
// 消费侧新增字段时必须同步这张表——表与源码不一致正是本门要抓的东西。
const ALLOW = {
  'plan.json': ['action', 'prefix', 'current', 'previous', 'linked', 'missingCommands', 'version', 'source'],
  'exec.json': ['action', 'version', 'prefix', 'previous'],
  'status.json': ['prefix', 'current', 'previous', 'linked', 'resolved', 'artifactVersion', 'cliVersion', 'missingCommands'],
  'bind.json': ['action', 'artifactRoot', 'version', 'hosts', 'bound'],
}

const fails = [], oks = [], warns = []
const bad = (code, where, detail) => fails.push(code + ' ' + where + ': ' + detail)

function smokeBlock (lines) {
  const start = lines.findIndex((l) => /- name:.*发布冒烟/.test(l))
  if (start < 0) return { from: -1, to: -1, text: '' }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) if (/^\s*- name:/.test(lines[i])) { end = i; break }
  return { from: start, to: end, text: lines.slice(start, end).join('\n') }
}

function staticChecks () {
  const where = basename(wfPath)
  if (!existsSync(wfPath)) { bad('SMOKE_WORKFLOW_MISSING', where, '发布链工作流文件不存在，冒烟断言无从对账'); return }
  const lines = readFileSync(wfPath, 'utf8').split(/\r?\n/)
  const blk = smokeBlock(lines)
  if (blk.from < 0) { bad('SMOKE_STEP_MISSING', where, '找不到「发布冒烟」步骤——冒烟被删等于发布链没有交付证据'); return }

  // INV-1 字段契约：按所读 json 各自的白名单判定，越界即判红并给行号
  for (let i = blk.from; i < blk.to; i++) {
    const line = lines[i]
    for (const file of Object.keys(ALLOW)) {
      if (!line.includes(file)) continue
      for (const m of line.matchAll(/data\.([A-Za-z][\w]*)/g)) {
        if (!ALLOW[file].includes(m[1])) bad('SMOKE_UNKNOWN_FIELD', where + ':' + (i + 1), '从 ' + ` + file + ` + ' 读 ' + ` + 'data.' + m[1] + ` + '，该命令不返回此键（可用：' + ALLOW[file].join('|') + '）')
      }
    }
  }

  // INV-2 物化布局：ROOT 必须由 CLI 布局派生，禁止手拼嵌套目录
  if (/prefix\/\$\{?CUR\}?\/shadow-dev-workflow/.test(blk.text)) bad('SMOKE_BAD_LAYOUT', where, 'ROOT 手拼成 prefix/$CUR/shadow-dev-workflow；CLI 布局是 prefix/shadow-dev-workflow-<version>')
  const derived = /prefix\/shadow-dev-workflow-\$\{?VER\}?/.test(blk.text) || /\.data\.resolved/.test(blk.text)
  if (!derived) bad('SMOKE_BAD_LAYOUT', where, 'ROOT 未由 CLI 物化布局派生（需 prefix/shadow-dev-workflow-$VER 或取 workflow status 的 resolved）')
  if (!/data\.version/.test(blk.text) && !/\.data\.resolved/.test(blk.text)) bad('SMOKE_UNKNOWN_FIELD', where, '冒烟未从 execute 的 data.version 取版本号，无从拼出布局路径')

  // INV-3 skills 期望值必须实测，禁止写死数字
  if (/\[\s*"\$N"\s*=\s*"\d+"\s*\]/.test(blk.text)) bad('SMOKE_HARDCODED_SKILLS', where, 'skills 数与字面量比较——技能增删后要么假红要么假绿')
  if (!/EXPECTED=/.test(blk.text)) bad('SMOKE_HARDCODED_SKILLS', where, '缺 EXPECTED= 的实测期望值（应由 find skills -name SKILL.md | wc -l 派生）')

  if (!fails.length) oks.push('静态对账：字段契约、布局派生与动态 skills 期望值成立')
}

function repoSkillCount () {
  return readdirSync(join(root, 'skills')).filter((d) => { try { return statSync(join(root, 'skills', d)).isDirectory() && existsSync(join(root, 'skills', d, 'SKILL.md')) } catch { return false } }).length
}

// execution-layer 缺陷：CLI 把 --from 路径 resolve 回反斜杠后交给 bash -c tar，Git Bash 将 D:\... 读成
// 「远程主机:路径」→ Windows 本机物化必然失败，Linux/CI 不受影响。本机降级为显式 deferred（留痕可追），
// 其余环境仍判红——禁止把「跑不了」变成「静默通过」。
function classifyPlanFailure (msg) {
  // Windows 上离线物化腿跑不通有两种同因形态：CLI 把路径 resolve 回反斜杠交给 bash -c tar（Git Bash
  // 读成「远程主机:路径」），或子进程通道里 .cmd shim 根本不可解析。两者都不是产物缺陷，且 CLI 存在性
  // 由 check:requires:strict 独占执法——本门在此只降级物化腿并显式留痕，其余环境（含 CI/Linux）判红。
  const win32Blocked = process.platform === 'win32' && (/bash -c tar/.test(msg) || /ENOENT|not recognized|不是内部或外部|系统找不到指定的文件/.test(msg))
  if (win32Blocked) {
    const why = /bash -c tar/.test(msg) ? 'CLI 的 bash -c tar 收到反斜杠绝对路径（execution-layer 缺陷，已登记 shadow-dev-cli 后继 change）' : '子进程通道内 shadow-dev shim 不可解析（CLI 存在性由 check:requires:strict 独占执法）'
    warns.push('SMOKE_MATERIALIZE_DEFERRED offline-smoke: 本机不物化——' + why + '；CI（Linux）跑实断言')
    return 'deferred'
  }
  if (/ENOENT|not recognized|不是内部或外部/.test(msg)) { bad('SMOKE_CLI_MISSING', 'offline-smoke', 'shadow-dev 不可执行：' + msg.slice(0, 140)); return 'fail' }
  bad('SMOKE_PLAN_REJECTED', 'offline-smoke', msg.slice(0, 200)); return 'fail'
}

function cliJson (cmdline) {
  const out = execSync(cmdline, { cwd: root, encoding: 'utf8', maxBuffer: 6e6 })
  return JSON.parse(String(out).split(/\r?\n/).filter((l) => l.trim().startsWith('{')).pop())
}

function materialize () {
  const where = 'offline-smoke'
  const pkgv = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
  try { execFileSync(process.execPath, ['scripts/pack.mjs'], { cwd: root, stdio: 'ignore' }) }
  catch (e) { bad('SMOKE_PACK_FAILED', where, '本地打包失败（system tar 不在 PATH？）：' + String(e.message).slice(0, 120)); return }
  const asset = join(root, 'dist', 'shadow-dev-workflow-v' + pkgv + '.tar.gz')
  if (!existsSync(asset)) { bad('SMOKE_PACK_FAILED', where, '产物不存在：' + asset); return }
  const prefix = resolve(matTmp || mkdtempSync(join(tmpdir(), 'rel-smoke-prefix-')))
  let plan
  try { plan = cliJson('shadow-dev workflow plan --from "' + asPosix(asset) + '" --prefix "' + asPosix(prefix) + '" --json') }
  catch (e) { classifyPlanFailure(String(e.message) + ' ' + String(e.stdout || '')); return }
  if (!plan.ok) { bad('SMOKE_PLAN_REJECTED', where, JSON.stringify(plan.error)); return }
  if (plan.data && plan.data.missingCommands && plan.data.missingCommands.length) { bad('SMOKE_CAPABILITY_GAP', where, '产物缺命令键：' + plan.data.missingCommands.join(',')); return }
  let exec
  try { exec = cliJson('shadow-dev workflow execute --from "' + asPosix(asset) + '" --prefix "' + asPosix(prefix) + '" --plan-hash ' + plan.planHash + ' --confirm --json') }
  catch (e) { bad('SMOKE_EXECUTE_REJECTED', where, String(e.message).slice(0, 180)); return }
  if (!exec.ok) { bad('SMOKE_EXECUTE_REJECTED', where, JSON.stringify(exec.error)); return }
  if (!exec.data || exec.data.version !== pkgv) { bad('SMOKE_VERSION_DRIFT', where, '物化版本 ' + (exec.data && exec.data.version) + ' != manifest ' + pkgv); return }
  const rootDir = join(prefix, 'shadow-dev-workflow-' + pkgv)
  if (!existsSync(join(rootDir, 'norms', 'verification.md'))) { bad('SMOKE_BAD_LAYOUT', where, '物化目录缺 norms/verification.md：' + rootDir); return }
  const got = readdirSync(join(rootDir, 'skills')).filter((d) => existsSync(join(rootDir, 'skills', d, 'SKILL.md'))).length
  const want = repoSkillCount()
  if (got !== want) { bad('SMOKE_SKILLS_MISMATCH', where, '物化 skills=' + got + ' 仓库实测=' + want); return }
  oks.push('OK materialized root=' + rootDir + ' skills=' + got)
}

staticChecks()
if (doMaterialize) materialize()
const out = []
for (const o of oks) out.push('[.] ' + o)
for (const w of warns) out.push('[!] ' + w)
for (const x of fails) out.push('✗ ' + x)
if (!fails.length) out.push('✅ 发布冒烟契约门：静态字段/布局/skills 期望值成立' + (warns.length ? '（本机物化 deferred）' : '，离线物化一致'))
console.log(out.join('\n'))
console.log('摘要: smoke checks=' + (oks.length + fails.length + warns.length) + ' fail=' + fails.length + ' deferred=' + warns.length)
if (fails.length) { console.error('✗ 发布冒烟契约门判红 ' + fails.length + ' 项——release 阻塞，指针不动'); process.exit(1) }
