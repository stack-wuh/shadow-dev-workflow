import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const PLUGIN_ROOT = fileURLToPath(new URL('..', import.meta.url))
const { version } = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8'))

// 打包一次，全部用例共享产物；结束后清理 dist/，不给仓库留未跟踪文件
const artifact = join(PLUGIN_ROOT, 'dist', `shadow-dev-workflow-v${version}.tar.gz`)
const extract = mkdtempSync(join(tmpdir(), 'pack-'))
execFileSync('node', [join(PLUGIN_ROOT, 'scripts', 'pack.mjs')], { cwd: PLUGIN_ROOT })
// tar 必须经 bash -c 执行：Windows runner 上 node 直 spawn 绑到 System32 bsdtar，
// 读不了 MSYS /tmp 路径（install-distribution 卡约束，安装器用例同款坑）。
// 但 Git Bash 的 tar 会把「D:\…」这类形态当成 host:path（SGN-010：Cannot connect to D: resolve failed），
// 所以传给 bash 的路径必须先归一为 posix 形态——与 shadow-dev-cli 的 test 同款 toUnix 手法，即 SGN-010 的退役条件。
const toUnix = process.platform === 'win32' ? (p) => {
  const r = spawnSync('cygpath', ['-u', p], { encoding: 'utf8' })
  // cygpath 可能不在 PATH（Git Bash 未加入 PATH 的机器与 runner 都会这样），退回纯字符串 MSYS 形态：
  // `C:\a\b` → `/c/a/b`。两条路都不依赖具体 bash 实现（Git Bash 用 /c/…，WSL 挂载点不同、本就跑不了本用例）。
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim()
  return p.replace(/^([A-Za-z]):[\\/]/, (_, d) => `/${d.toLowerCase()}/`).replace(/[\\/]+/g, '/')
} : (p) => p
const unpack = spawnSync('bash', ['-c', 'tar -xzf "$1" -C "$2"', 'pack-extract', toUnix(artifact), toUnix(extract)], { encoding: 'utf8' })
// 解包失败必须当场响亮：旧写法忽略 rc，症状漂到下游用例变成「package.json ENOENT」，排查方向全错。
if (unpack.status !== 0) throw new Error(`pack 解包失败 rc=${unpack.status}: ${(unpack.stderr || unpack.stdout || '').trim() || unpack.error?.message || 'unknown'}`)
const packedRoot = join(extract, 'shadow-dev-workflow')

test.after(() => {
  rmSync(join(PLUGIN_ROOT, 'dist'), { recursive: true, force: true })
  rmSync(extract, { recursive: true, force: true })
})

test('pack: 产物存在且与 package.json 版本一致', () => {
  assert.equal(existsSync(artifact), true, `missing artifact: ${artifact}`)
  const packed = JSON.parse(readFileSync(join(packedRoot, 'package.json'), 'utf8'))
  assert.equal(packed.version, version)
})

test('pack: 三处 manifest 版本与 package.json 对齐（发版漏同步的机检）', () => {
  for (const rel of [['.claude-plugin', 'plugin.json'], ['.codex-plugin', 'plugin.json']]) {
    const p = join(PLUGIN_ROOT, ...rel)
    assert.equal(existsSync(p), true, `missing manifest: ${rel.join('/')}`)
    assert.equal(JSON.parse(readFileSync(p, 'utf8')).version, version, `${rel.join('/')} 的 version 未与 package.json 同步`)
  }
})

test('pack: 运行必需文件齐全（hook fallback 依赖 scripts/install-cli.sh）', () => {
  for (const f of ['marketplace.json', 'package.json', 'README.md', 'menu.md']) {
    assert.equal(existsSync(join(packedRoot, f)), true, `missing file: ${f}`)
  }
  for (const d of ['skills', 'hooks', 'rules', 'knowledge', 'norms', 'docs', 'scripts']) {
    assert.equal(existsSync(join(packedRoot, d)), true, `missing dir: ${d}`)
  }
  assert.equal(existsSync(join(packedRoot, 'hooks', 'hooks.json')), true, 'hooks.json')
  assert.equal(existsSync(join(packedRoot, 'scripts', 'install-cli.sh')), true, 'install-cli.sh')
  assert.equal(existsSync(join(packedRoot, 'hooks', 'hooks.codex.json')), true, 'hooks/hooks.codex.json（Codex 宿主 hook 清单）')
  assert.equal(existsSync(join(packedRoot, 'adapters', 'claude-code.json')), true, 'adapters/claude-code.json（bind 域消费）')
  assert.equal(existsSync(join(packedRoot, 'adapters', 'codex.json')), true, 'adapters/codex.json（bind 域消费）')
  assert.equal(existsSync(join(packedRoot, '.codex-plugin', 'plugin.json')), true, '.codex-plugin/plugin.json（Codex 插件清单）')
  assert.equal(existsSync(join(packedRoot, '.agents', 'plugins', 'marketplace.json')), true, '.agents/plugins/marketplace.json（Codex marketplace）')
  assert.equal(existsSync(join(packedRoot, 'adapters', 'zcode.json')), true, 'adapters/zcode.json（bind 域消费）')
  for (const s of ['shadow-dev-apply', 'shadow-dev-archive', 'shadow-dev-knowledge', 'shadow-dev-propose', 'shadow-dev-release', 'shadow-dev-review']) {
    assert.equal(existsSync(join(packedRoot, 'skills', s, 'SKILL.md')), true, `missing skill: ${s}`)
  }
})

test('pack: 开发产物被排除', () => {
  for (const f of ['test', 'shadow-docs', 'dist', '.github', 'CLAUDE.md', '.git']) {
    assert.equal(existsSync(join(packedRoot, f)), false, `unexpected: ${f}`)
  }
})
