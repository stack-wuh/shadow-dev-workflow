import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const PLUGIN_ROOT = fileURLToPath(new URL('..', import.meta.url))
const WRAPPER = join(PLUGIN_ROOT, 'hooks', 'bootstrap-cli.sh')
const INSTALLER = join(PLUGIN_ROOT, 'scripts', 'install-cli.sh')
const PIN = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8')).cliVersion

// 就位形态：CURRENT 指针 + 版本化目录，与安装器布局一致（CURRENT 不含 v 前缀）
function seedPrefix(root) {
  const prefix = join(root, 'prefix')
  const ver = PIN.replace(/^v/, '')
  mkdirSync(join(prefix, `shadow-dev-cli-${ver}`), { recursive: true })
  writeFileSync(join(prefix, 'CURRENT'), `${ver}\n`)
  writeFileSync(join(prefix, `shadow-dev-cli-${ver}`, 'package.json'), '{}')
  return prefix
}

// 记录自身参数并按脚本内容行事的安装器替身
function stubInstaller(root, body) {
  const p = join(root, 'stub-install-cli.sh')
  writeFileSync(p, `#!/bin/sh\necho "$@" >> "$STUB_ARGS"\n${body}`)
  chmodSync(p, 0o755)
  return p
}

function runWrapper(env, wrapper = WRAPPER) {
  return spawnSync('bash', [wrapper], { encoding: 'utf8', env: { ...process.env, ...env } })
}

function testCase(root, seed = true) {
  const prefix = join(root, 'prefix')
  if (seed) seedPrefix(root)
  else mkdirSync(prefix, { recursive: true })
  return {
    prefix,
    bin: join(root, 'bin'),
    stub: '',
    stubArgs: join(root, 'stub-args.log'),
  }
}

test('wrapper: pin 已就位时零输出秒退且不触安装器', () => {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-'))
  const c = testCase(root)
  // 就位前提下安装器若被调用即失败并留痕，用于证明 fast-path 生效
  c.stub = stubInstaller(root, 'echo "must not run" >&2\nexit 9\n')
  const r = runWrapper({ SD_PREFIX: c.prefix, SHADOW_CLI_INSTALLER: c.stub, STUB_ARGS: c.stubArgs })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout, '', 'hook stdout 必须为空（严格 JSON 校验）')
  assert.equal(r.stderr, '', '就位时不应有任何警告')
  assert.equal(existsSync(c.stubArgs), false, '安装器不应被调用')
})

test('wrapper: 未就位时以锁版本参数调用安装器且保持静默', () => {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-'))
  const c = testCase(root, false) // 空前缀：CURRENT 与目录都不存在
  c.stub = stubInstaller(root, 'printf \'{"ok":true,"action":"install","version":"1.1.0"}\\n\'\n')
  const r = runWrapper({ SD_PREFIX: c.prefix, SHADOW_CLI_INSTALLER: c.stub, STUB_ARGS: c.stubArgs })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout, '')
  assert.equal(existsSync(c.stubArgs), true)
  assert.equal(readFileSync(c.stubArgs, 'utf8').trim(), `install --version ${PIN} --json`)
})

test('wrapper: 安装器失败仅 stderr 警告且恒不阻塞会话', () => {
  for (const body of [
    'printf \'{"ok":false,"error":"network","message":"api down"}\\n\'\nexit 2\n',
    'echo "curl: (7) connection refused" >&2\nexit 2\n',
  ]) {
    const root = mkdtempSync(join(tmpdir(), 'bootstrap-'))
    const c = testCase(root, false)
    c.stub = stubInstaller(root, body)
    const r = runWrapper({ SD_PREFIX: c.prefix, SHADOW_CLI_INSTALLER: c.stub, STUB_ARGS: c.stubArgs })
    assert.equal(r.status, 0, '失败也必须 exit 0，不阻塞会话')
    assert.equal(r.stdout, '')
    assert.match(r.stderr, /shadow-dev/, '应有可读警告')
  }
})

test('wrapper: SHADOW_CLI_HOOK_DISABLE=1 时完全跳过', () => {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-'))
  const c = testCase(root)
  mkdirSync(c.prefix, { recursive: true })
  c.stub = stubInstaller(root, 'exit 9\n')
  const r = runWrapper({
    SD_PREFIX: c.prefix,
    SHADOW_CLI_INSTALLER: c.stub,
    STUB_ARGS: c.stubArgs,
    SHADOW_CLI_HOOK_DISABLE: '1',
  })
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '')
  assert.equal(r.stderr, '')
  assert.equal(existsSync(c.stubArgs), false, '安装器不应被调用')
})

test('wrapper: package.json 缺 pin 时警告并跳过', () => {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-'))
  mkdirSync(join(root, 'hooks'), { recursive: true })
  copyFileSync(WRAPPER, join(root, 'hooks', 'bootstrap-cli.sh'))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture' }))
  const stub = stubInstaller(root, 'exit 9\n')
  const wrapperCopy = join(root, 'hooks', 'bootstrap-cli.sh')
  const r = runWrapper(
    { SD_PREFIX: join(root, 'prefix'), SHADOW_CLI_INSTALLER: stub, STUB_ARGS: join(root, 'stub-args.log') },
    wrapperCopy,
  )
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '')
  assert.match(r.stderr, /cliVersion/)
})

test('installer: --from 离线安装到版本化布局并生成托管 shim', () => {
  const root = mkdtempSync(join(tmpdir(), 'install-cli-'))
  const staging = join(root, 'staging')
  mkdirSync(join(staging, 'shadow-dev-cli'), { recursive: true })
  writeFileSync(join(staging, 'shadow-dev-cli', 'cli.mjs'), '#!/usr/bin/env node\nconsole.log(JSON.stringify({ ok: true, command: "help", data: "fixture" }))\n')
  writeFileSync(join(staging, 'shadow-dev-cli', 'package.json'), JSON.stringify({ name: 'shadow-dev-cli', version: '9.9.9' }))
  const tarball = join(root, 'fixture.tar.gz')
  // 相对路径 + cwd：Git Bash 的 GNU tar 会把 `C:\...` 绝对路径误解析为 host:path
  execFileSync('tar', ['-czf', 'fixture.tar.gz', '-C', 'staging', 'shadow-dev-cli'], { cwd: root })

  const prefix = join(root, 'prefix')
  const bin = join(root, 'bin')
  // --from 传相对名并设 cwd：Git Bash 的 tar 对 `C:\...` 形态会按 host:path 解析
  const run = (...extra) =>
    spawnSync('bash', [INSTALLER, 'install', '--from', 'fixture.tar.gz', '--prefix', prefix, '--bin', bin, ...extra], { cwd: root, encoding: 'utf8' })

  const first = run('--json')
  assert.equal(first.status, 0, first.stderr)
  const ver = join(prefix, 'shadow-dev-cli-9.9.9')
  assert.equal(existsSync(join(ver, 'cli.mjs')), true)
  assert.equal(readFileSync(join(prefix, 'CURRENT'), 'utf8').trim(), '9.9.9')
  const shim = join(bin, 'shadow-dev')
  assert.equal(existsSync(shim), true)
  // 经 bash 显式执行：Windows 无法直接 spawn 无扩展名 shebang 脚本（与安装器写 .cmd shim 同一约束）
  const smoke = spawnSync('bash', [shim, '--help'], { encoding: 'utf8' })
  assert.equal(smoke.status, 0, smoke.stderr)
  assert.match(smoke.stdout, /"ok":true/)

  // 幂等：已装同版本秒退 action:none
  const second = run('--json')
  assert.equal(second.status, 0, second.stderr)
  assert.match(second.stdout, /"action":"none"/)

  // --force 重装清理陈旧文件并保留指针
  writeFileSync(join(ver, 'stale.txt'), 'stale\n')
  const third = run('--force', '--json')
  assert.equal(third.status, 0, third.stderr)
  assert.equal(existsSync(join(ver, 'stale.txt')), false)
  assert.equal(readFileSync(join(prefix, 'CURRENT'), 'utf8').trim(), '9.9.9')
})

test('hook 装配静态契约：plugin.json 声明 hooks、hooks.json 注册 SessionStart、wrapper 可执行', () => {
  const pkg = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8'))
  assert.match(pkg.cliVersion, /^v\d+\.\d+\.\d+$/, 'cliVersion 必须是 vA.B.C 形态的精确 pin')

  const manifest = JSON.parse(readFileSync(join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'))
  assert.equal(manifest.hooks, 'hooks', 'plugin.json 必须声明 hooks 目录')

  const hooks = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'hooks', 'hooks.json'), 'utf8'))
  const entries = hooks.hooks.SessionStart
  assert.ok(Array.isArray(entries) && entries.length >= 1, '必须注册 SessionStart')
  const hook = entries[0].hooks[0]
  assert.equal(hook.type, 'process', '用 process 类型免 shell，跨平台最稳')
  assert.equal(hook.command, 'bash')
  assert.ok(
    hook.args.some((a) => a.includes('bootstrap-cli.sh')),
    'args 必须指向 bootstrap-cli.sh',
  )
  assert.equal(typeof hook.timeoutMs, 'number')
  assert.equal(existsSync(WRAPPER), true, 'wrapper 脚本必须存在（经 bash 显式调用，不依赖可执行位）')
})
