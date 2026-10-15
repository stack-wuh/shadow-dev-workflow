// bootstrap.mjs 契约测试：插件自同步的触发/非触发边界 + CLI 自举的失败语义。
// CLI 自举本体（bootstrap-cli.sh）与安装器的用例在 install-cli.test.mjs，本文件只钉 bootstrap.mjs
// 的编排行为：成功静默（stdout 恒空）、失败仅 stderr、恒 exit 0，以及「只在 ZCode 插件形态 + 版本
// 不一致 + 源仓在 main」三条同时成立时才动宿主安装。
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const PLUGIN_ROOT = fileURLToPath(new URL('..', import.meta.url))
const BOOTSTRAP = join(PLUGIN_ROOT, 'hooks', 'bootstrap.mjs')

function makeFixture ({ installedVersion = '1.0.0', repoVersion = '9.9.9', branch = 'main' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'sd-bootstrap-'))
  const cliHome = join(root, 'cli')
  const repo = join(root, 'repo')
  mkdirSync(join(cliHome, 'plugins'), { recursive: true })
  mkdirSync(join(repo, '.claude-plugin'), { recursive: true })
  writeFileSync(join(repo, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'shadow-dev-workflow', version: repoVersion }))
  writeFileSync(join(cliHome, 'plugins', 'installed_plugins.json'), JSON.stringify({
    version: 1,
    plugins: [{ id: 'shadow-dev-workflow@mkt', name: 'shadow-dev-workflow', marketplace: 'mkt', version: installedVersion, installPath: join(root, 'cache') }],
  }))
  writeFileSync(join(cliHome, 'plugins', 'known_marketplaces.json'), JSON.stringify({
    version: 1,
    marketplaces: [{ id: 'mkt', source: { source: 'directory', path: repo } }],
  }))
  const git = (args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
  git(['init', '-b', 'main'])
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--allow-empty', '-m', 'init'])
  if (branch !== 'main') git(['switch', '-c', branch])
  const cliLog = join(root, 'zcode-cli.log')
  const stubCli = join(root, 'stub-zcode.mjs')
  writeFileSync(stubCli, 'import { appendFileSync } from "node:fs"\nappendFileSync(process.env.STUB_LOG, process.argv.slice(2).join(" ") + "\\n")\n')
  return { root, cliHome, repo, cliLog, stubCli }
}

function runBootstrap (f, env = {}) {
  return spawnSync(process.execPath, [BOOTSTRAP], {
    encoding: 'utf8',
    env: {
      ...process.env,
      SHADOW_CLI_HOOK_DISABLE: '1', // 隔离：CLI 自举不在本文件断言面（install-cli.test.mjs 覆盖）
      SHADOW_ZCODE_CLI_HOME: f.cliHome,
      SHADOW_ZCODE_CLI: f.stubCli,
      STUB_LOG: f.cliLog,
      ZCODE_PLUGIN_ID: 'shadow-dev-workflow@mkt',
      ZCODE_PLUGIN_NAME: 'shadow-dev-workflow',
      ...env,
    },
  })
}

const stubCalls = (f) => existsSync(f.cliLog) ? readFileSync(f.cliLog, 'utf8').trim().split('\n').filter(Boolean) : []

test('版本不一致且源仓在 main：自动 marketplace 刷新 + 插件更新，stderr 报同步行', () => {
  const f = makeFixture()
  const r = runBootstrap(f)
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '', 'hook stdout 必须保持为空（宿主严格校验）')
  assert.match(r.stderr, /已同步：1\.0\.0 → 9\.9\.9/)
  assert.deepEqual(stubCalls(f), ['plugins marketplace update mkt', 'plugins update shadow-dev-workflow'])
})

test('版本一致：静默不动，不触 zcode CLI', () => {
  const f = makeFixture({ installedVersion: '9.9.9', repoVersion: '9.9.9' })
  const r = runBootstrap(f)
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '')
  assert.equal(r.stderr, '')
  assert.deepEqual(stubCalls(f), [])
})

test('源仓不在 main（开发分支）：静默跳过，不把开发态版本同步进本机', () => {
  const f = makeFixture({ branch: 'feature/dev' })
  const r = runBootstrap(f)
  assert.equal(r.status, 0)
  assert.equal(r.stderr, '')
  assert.deepEqual(stubCalls(f), [])
})

test('非 ZCode 插件形态（无 ZCODE_PLUGIN_*）：不介入宿主更新', () => {
  const f = makeFixture()
  const r = runBootstrap(f, { ZCODE_PLUGIN_ID: '', ZCODE_PLUGIN_NAME: '' })
  assert.equal(r.status, 0)
  assert.equal(r.stderr, '')
  assert.deepEqual(stubCalls(f), [])
})

test('CLI 自举遇 WSL 入口桩：仅 stderr 指名告警，恒 exit 0 不阻塞会话', () => {
  const f = makeFixture({ installedVersion: '9.9.9', repoVersion: '9.9.9' })
  const r = runBootstrap(f, {
    SHADOW_CLI_HOOK_DISABLE: '0',
    SHADOW_PLUGIN_SYNC_DISABLE: '1',
    SHADOW_DEV_BASH: 'C:\\Users\\x\\AppData\\Local\\Microsoft\\WindowsApps\\bash.exe',
  })
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '')
  assert.match(r.stderr, /已被判定无效/)
})
