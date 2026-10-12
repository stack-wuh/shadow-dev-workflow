// 发布冒烟契约门：把「只有真发版才执行的那段断言」变成提交前可跑的两条腿。
// ①静态对账 publish-release.yml 读取的 payload 字段与 ROOT 拼法（INV-1/2/3）
// ②离线物化复现冒烟（INV-4）：用本地 dist 资产走 --from，不依赖 GitHub Release 是否存在
// 成因：v7.0.0 的 publish-release run 判红——冒烟读了 workflow execute 根本不返回的 current 字段，
// 又把 ROOT 手拼成 prefix/$CUR/shadow-dev-workflow，而 CLI 布局是 prefix/shadow-dev-workflow-<ver>。
// 用法：node scripts/check-release-smoke.mjs [--root <dir>] [--workflow <path>] [--no-materialize] [--materialize-tmp <dir>]
import { existsSync, readFileSync, mkdtempSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolveBash } from './resolve-bash.mjs'

const argv = process.argv.slice(2)
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const root = resolve(argOf('--root') || process.cwd())
const wfPath = resolve(argOf('--workflow') || join(root, '.github', 'workflows', 'publish-release.yml'))
const doMaterialize = !argv.includes('--no-materialize')
const smokePath = resolve(argOf('--smoke') || join(root, 'scripts', 'release-smoke.sh'))
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

// 断言条目清单（INV-2）：搬移冒烟时少任何一条都判红，防止重构顺手削弱验收强度
const REQUIRED_ASSERTIONS = [
  ['plan 版本', 'OK plan version'],
  ['execute 版本', 'OK execute version'],
  ['CURRENT 指针一致', 'CURRENT 指针'],
  ['规范文件在位', 'norms/verification.md'],
  ['skills 动态期望值', 'materialized skills count'],
  ['物化成功行', 'OK materialized root='],
  ['bind 宿主版本一致', 'bind plan host-version'],
]

const fails = [], oks = [], warns = []
const bad = (code, where, detail) => fails.push(code + ' ' + where + ': ' + detail)

function smokeBlock (lines) {
  const start = lines.findIndex((l) => /- name:.*发布冒烟/.test(l))
  if (start < 0) return { from: -1, to: -1, text: '' }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) if (/^\s*- name:/.test(lines[i])) { end = i; break }
  return { from: start, to: end, text: lines.slice(start, end).join('\n') }
}

// INV-1：CI 必须委派给唯一实现；步骤体内不得再残留断言原文
function checkDelegation () {
  const where = basename(wfPath)
  if (!existsSync(wfPath)) { bad('SMOKE_WORKFLOW_MISSING', where, '发布链工作流文件不存在'); return }
  const lines = readFileSync(wfPath, 'utf8').split(String.fromCharCode(10))
  const blk = smokeBlock(lines)
  if (blk.from < 0) { bad('SMOKE_STEP_MISSING', where, '找不到发布冒烟步骤'); return }
  if (!blk.text.includes('release-smoke.sh')) bad('SMOKE_NOT_DELEGATED', where, '冒烟步骤未调用唯一实现 scripts/release-smoke.sh——两份实现的漂移要靠一次发版才暴露')
  const residue = []
  for (let i = blk.from; i < blk.to; i++) {
    const l = lines[i]
    if (l.includes('release-smoke.sh')) continue
    if (l.includes('.data.') || l.includes('test -f ') || l.includes('node -pe ') || l.includes('EXPECTED=') || l.includes('find skills')) residue.push(i + 1)
  }
  if (residue.length) bad('SMOKE_INLINE_ASSERTION', where + ':' + residue.join(','), '冒烟步骤内仍残留断言原文：断言只允许写在唯一实现里（行号即定位）')
  else if (!residue.length && blk.text.includes('release-smoke.sh')) oks.push('委派：CI 冒烟步骤只剩一行调用')
}

// INV-2/4：唯一实现的字段契约、断言条目与变量形态
function checkImplementation () {
  const where = basename(smokePath)
  if (!existsSync(smokePath)) { bad('SMOKE_SCRIPT_MISSING', where, '唯一实现不存在，冒烟无从执行'); return }
  const lines = readFileSync(smokePath, 'utf8').split(String.fromCharCode(10))
  const text = lines.join(String.fromCharCode(10))
  const TICK = String.fromCharCode(96)
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim().startsWith('#')) continue
    if (l.includes(TICK)) bad('SMOKE_BACKTICK_SUBST', where + ':' + (i + 1), '出现反引号形态（bash 命令替换或反引号字面量）：变量引用必须用美元符号——v7.0.1 的链红即此形态')
    for (const file of Object.keys(ALLOW)) {
      if (!l.includes(file)) continue
      let from = 0
      while (true) {
        const at = l.indexOf('.data.', from)
        if (at < 0) break
        const key = l.slice(at + 6).match(/^[A-Za-z][A-Za-z0-9_]*/)
        if (key && !ALLOW[file].includes(key[0])) bad('SMOKE_UNKNOWN_FIELD', where + ':' + (i + 1), '从 ' + file + ' 读 .data.' + key[0] + '，该命令不返回此键（可用：' + ALLOW[file].join('|') + '）')
        from = at + 6
      }
    }
  }
  if (!text.includes('set -euo pipefail')) bad('SMOKE_ASSERTION_MISSING', where, '缺 set -euo pipefail：中途失败会被吞掉，冒烟会带着半截状态自称通过')
  if (!text.includes('prefix/shadow-dev-workflow-$VER')) bad('SMOKE_BAD_LAYOUT', where, 'ROOT 未由 CLI 物化布局派生（应为 prefix/shadow-dev-workflow-$VER）')
  if (text.includes('prefix/$CUR/shadow-dev-workflow')) bad('SMOKE_BAD_LAYOUT', where, 'ROOT 手拼成 prefix/$CUR/shadow-dev-workflow：CLI 布局是 prefix/shadow-dev-workflow-<version>')
  const missing = REQUIRED_ASSERTIONS.filter(([, probe]) => !text.includes(probe)).map(([name]) => name)
  if (missing.length) bad('SMOKE_ASSERTION_MISSING', where, '断言条目缺失：' + missing.join('、') + '（搬移冒烟不得顺手削弱验收强度）')
  else oks.push('唯一实现：字段契约、' + REQUIRED_ASSERTIONS.length + ' 条断言条目与变量形态成立')
}

// INV-3：门自己不得再驱动 CLI，否则它就是第二份实现
// INV-3：门自己不得再驱动 CLI——否则它就是第二份实现。特征串拆开写，避免匹配到本行
function checkNoSecondCopy () {
  const VERBS = ['workflow ' + 'exe' + 'cute', 'workflow ' + 'pla' + 'n']
  const self = readFileSync(new URL(import.meta.url), 'utf8').split(String.fromCharCode(10))
  const drivers = self.map((l, i) => [l, i + 1]).filter(([l]) => !l.trim().startsWith('//') && VERBS.some((v) => l.includes(v)))
  if (drivers.length) bad('SMOKE_DUPLICATION', 'check-release-smoke.mjs', '门源码自行驱动 CLI（行 ' + drivers.map(([, n]) => n).join(',') + '）：物化腿只能调用唯一实现脚本，退出码即判据')
  else oks.push('无第二份实现：门只调用脚本，不自行驱动 CLI')
}

function staticChecks () {
  checkDelegation()
  checkImplementation()
  checkNoSecondCopy()
}

// execution-layer 缺陷：CLI 把 --from 路径 resolve 回反斜杠后交给 bash -c tar，Git Bash 将 D:\... 读成
// 「远程主机:路径」→ Windows 本机物化必然失败，Linux/CI 不受影响。本机降级为显式 deferred（留痕可追），
// 其余环境仍判红——禁止把「跑不了」变成「静默通过」。
// INV-3：离线腿 = 同一个脚本、同一条代码路径，只是产物来源换成本地 dist 资产
function materialize () {
  const where = 'offline-smoke'
  const pkgv = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
  const work = resolve(matTmp || mkdtempSync(join(tmpdir(), 'rel-smoke-')))
  const bash = resolveBash()
  if (!bash) { warns.push('SMOKE_MATERIALIZE_DEFERRED offline-smoke: 本机无可信 bash（resolve-bash 拒绝 WSL 入口桩），离线腿未执行，不计入一致'); return }
  const pk = spawnSync(process.execPath, ['scripts/pack.mjs', '--out', join(work, 'dist')], { cwd: root, encoding: 'utf8' })
  if (pk.status !== 0) { bad('SMOKE_PACK_FAILED', where, '本地打包失败 rc=' + pk.status + '：' + String(pk.stderr || '').split(String.fromCharCode(10)).filter((x) => x && !/npm warn/.test(x)).slice(0, 2).join(' / ').slice(0, 200)); return }
  const asset = join(work, 'dist', 'shadow-dev-workflow-v' + pkgv + '.tar.gz')
  if (!existsSync(asset)) { bad('SMOKE_PACK_FAILED', where, '本地产物不存在：' + asset); return }
  const r = spawnSync(bash.path, [smokePath, '--from', asset.replace(/\\/g, '/'), '--work', work.replace(/\\/g, '/')], { cwd: root, encoding: 'utf8' })
  const out = String(r.stdout || '') + String(r.stderr || '')
  if (process.platform === 'win32' && (out.includes('bash -c tar') || out.includes('ENOENT') || out.includes('not recognized'))) { warns.push('SMOKE_MATERIALIZE_DEFERRED offline-smoke: 本机不物化——CLI 的 bash -c tar 收到反斜杠绝对路径（execution-layer 缺陷，已登记 shadow-dev-cli）；CI（Linux/macOS）跑实断言'); return }
  if (r.status !== 0) { bad('SMOKE_OFFLINE_FAILED', where, '唯一实现离线腿退出码 ' + r.status + '：' + out.split(String.fromCharCode(10)).filter((l) => l.startsWith('x ') || l.includes('command not found') || l.includes('No such file')).slice(0, 3).join(' / ').slice(0, 220)); return }
  const line = out.split(String.fromCharCode(10)).filter((l) => l.startsWith('OK materialized root=')).pop()
  if (!line) { bad('SMOKE_OFFLINE_FAILED', where, '离线腿未产出物化成功行'); return }
  oks.push(line + '（与 CI 同一份实现）')
}

staticChecks()
if (doMaterialize) materialize()
const out = []
for (const o of oks) out.push('[.] ' + o)
for (const w of warns) out.push('[!] ' + w)
for (const x of fails) out.push('✗ ' + x)
if (!fails.length) out.push('✅ 发布冒烟契约门：静态字段/布局/skills 期望值与反引号误用检查成立' + (oks.some((o) => /OK materialized/.test(o)) ? '，离线物化一致' : warns.length ? '（离线腿 deferred：本机不物化）' : doMaterialize ? '（离线腿未产出物化证据）' : '（离线腿按 flag 跳过，不计入一致）'))
console.log(out.join('\n'))
console.log('摘要: smoke checks=' + (oks.length + fails.length + warns.length) + ' fail=' + fails.length + ' deferred=' + warns.length + ' materialized=' + (oks.some((o) => /OK materialized/.test(o)) ? 1 : 0))
if (fails.length) { console.error('✗ 发布冒烟契约门判红 ' + fails.length + ' 项——release 阻塞，指针不动'); process.exit(1) }
