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
// 读不了 MSYS /tmp 路径（install-distribution 卡约束，安装器用例同款坑）
spawnSync('bash', ['-c', 'tar -xzf "$1" -C "$2"', 'pack-extract', artifact, extract], { encoding: 'utf8' })
const packedRoot = join(extract, 'shadow-dev-workflow')

test.after(() => {
  rmSync(join(PLUGIN_ROOT, 'dist'), { recursive: true, force: true })
  rmSync(extract, { recursive: true, force: true })
})

test('pack: 产物存在且与 package.json 版本一致', () => {
  assert.equal(existsSync(artifact), true, `missing artifact: ${artifact}`)
  const packed = JSON.parse(readFileSync(join(packedRoot, 'package.json'), 'utf8'))
  assert.equal(packed.version, version)
  assert.ok(Array.isArray(packed.requiresCommands) && packed.requiresCommands.length, 'requiresCommands 必须随产物声明')
  assert.equal('cliVersion' in packed, false, 'cliVersion 静态 pin 已作废')
})

test('pack: 运行必需文件齐全（分发权威在 CLI，产物不含 hooks/installer）', () => {
  for (const f of ['marketplace.json', 'package.json', 'README.md', 'menu.md']) {
    assert.equal(existsSync(join(packedRoot, f)), true, `missing file: ${f}`)
  }
  for (const d of ['skills', 'adapters', 'rules', 'knowledge', 'norms', 'docs', 'scripts']) {
    assert.equal(existsSync(join(packedRoot, d)), true, `missing dir: ${d}`)
  }
  assert.equal(existsSync(join(packedRoot, 'hooks')), false, 'hooks/ 必须已注销（SessionStart 自举轨作废）')
  assert.equal(existsSync(join(packedRoot, 'scripts', 'install-cli.sh')), false, 'vendored install-cli.sh 必须已注销（双份漂移源头）')
  assert.equal(existsSync(join(packedRoot, 'adapters', 'claude-code.json')), true, 'adapters/claude-code.json（bind 域消费）')
  assert.equal(existsSync(join(packedRoot, 'adapters', 'zcode.json')), true, 'adapters/zcode.json（bind 域消费）')
  for (const s of ['shadow-dev-apply', 'shadow-dev-archive', 'shadow-dev-design', 'shadow-dev-hotfix', 'shadow-dev-knowledge', 'shadow-dev-propose', 'shadow-dev-release', 'shadow-dev-review']) {
    assert.equal(existsSync(join(packedRoot, 'skills', s, 'SKILL.md')), true, `missing skill: ${s}`)
  }
})

test('pack: 开发产物被排除', () => {
  for (const f of ['test', 'shadow-docs', 'dist', '.github', 'CLAUDE.md', '.git']) {
    assert.equal(existsSync(join(packedRoot, f)), false, `unexpected: ${f}`)
  }
})
