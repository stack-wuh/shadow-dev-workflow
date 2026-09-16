import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const SCRIPT = fileURLToPath(new URL('../scripts/install-cli.sh', import.meta.url))

function fixtureTarball(root) {
  const staging = join(root, 'staging')
  mkdirSync(join(staging, 'shadow-dev-cli'), { recursive: true })
  writeFileSync(join(staging, 'shadow-dev-cli', 'cli.mjs'), '#!/usr/bin/env node\nconsole.log(JSON.stringify({ ok: true, command: "help", data: "fixture" }))\n')
  writeFileSync(join(staging, 'shadow-dev-cli', 'package.json'), JSON.stringify({ name: 'shadow-dev-cli', version: '9.9.9' }))
  execFileSync('tar', ['-czf', join(root, 'fixture.tar.gz'), '-C', staging, 'shadow-dev-cli'])
  return join(root, 'fixture.tar.gz')
}

function runInstall(env) {
  return spawnSync('sh', [SCRIPT], { encoding: 'utf8', env: { ...process.env, ...env } })
}

test('install script extracts a local tarball to the destination and smoke tests the cli', () => {
  const root = mkdtempSync(join(tmpdir(), 'install-cli-'))
  const tarball = fixtureTarball(root)
  const dest = join(root, 'dest')
  const result = runInstall({ SHADOW_CLI_TARBALL: tarball, SHADOW_CLI_DEST: dest })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(join(dest, 'cli.mjs')), true)
  assert.match(readFileSync(join(dest, 'package.json'), 'utf8'), /9\.9\.9/)
  const smoke = spawnSync(process.execPath, [join(dest, 'cli.mjs'), '--help'], { encoding: 'utf8' })
  assert.equal(smoke.status, 0, smoke.stderr)
  assert.match(smoke.stdout, /"command":\s*"help"/)
})

test('install script is idempotent and replaces a previous installation', () => {
  const root = mkdtempSync(join(tmpdir(), 'install-cli-'))
  const tarball = fixtureTarball(root)
  const dest = join(root, 'dest')
  const first = runInstall({ SHADOW_CLI_TARBALL: tarball, SHADOW_CLI_DEST: dest })
  assert.equal(first.status, 0, first.stderr)
  writeFileSync(join(dest, 'stale-file.txt'), 'stale\n')
  const second = runInstall({ SHADOW_CLI_TARBALL: tarball, SHADOW_CLI_DEST: dest })
  assert.equal(second.status, 0, second.stderr)
  assert.equal(existsSync(join(dest, 'stale-file.txt')), false)
  assert.equal(existsSync(join(dest, 'cli.mjs')), true)
})
