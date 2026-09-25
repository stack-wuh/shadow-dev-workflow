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
  for (const s of ['shadow-dev-apply', 'shadow-dev-archive', 'shadow-dev-knowledge', 'shadow-dev-propose', 'shadow-dev-release', 'shadow-dev-review']) {
    assert.equal(existsSync(join(packedRoot, 'skills', s, 'SKILL.md')), true, `missing skill: ${s}`)
  }
})

test('pack: 开发产物被排除', () => {
  for (const f of ['test', 'shadow-docs', 'dist', '.github', 'CLAUDE.md', '.git']) {
    assert.equal(existsSync(join(packedRoot, f)), false, `unexpected: ${f}`)
  }
})
