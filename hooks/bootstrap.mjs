#!/usr/bin/env node
// bootstrap.mjs — SessionStart 环境自举（node 形态，三宿主统一：Claude Code / Codex / ZCode）。
//
// 为什么不是 bash：部分宿主（实测 ZCode 3.15 / CLI 0.16.9）的 process hook 直接 spawn `command`，
// Windows 上 `bash` 先命中 WindowsApps\bash.exe —— WSL 入口桩，未启用子系统时只打印安装提示、
// 不执行任何脚本，hook 恒失败且宿主日志里只留 hook.run.failed 无原因（2026-10-15 实证：失败 ×11，
// CLI pin v1.7.0 数日未自举到本机）。node 是宿主 PATH 上的稳定可达项（本仓硬前提 node>=20），
// 由它解析可信 bash（scripts/resolve-bash.mjs，本仓唯一口径）再调用既有自举脚本。
//
// 职责（全部成功静默、失败仅 stderr 警告、恒 exit 0，绝不阻塞会话）：
//   1) CLI 自举：确保 package.json 锁定的 shadow-dev-cli 版本就位（逻辑仍在 hooks/bootstrap-cli.sh）
//   2) 插件自同步（仅 ZCode 插件形态）：本机安装版本与目录型 marketplace 源仓版本不一致且源仓在
//      main 时，自动 `plugins marketplace update` + `plugins update`——本仓发版后的本机安装不再
//      依赖手工命令，重启宿主后生效。
// 开关：SHADOW_CLI_HOOK_DISABLE=1 跳过 CLI 自举（双仓开发保护，既有语义）；
//       SHADOW_PLUGIN_SYNC_DISABLE=1 跳过插件自同步。
// 测试注入点：SHADOW_ZCODE_CLI_HOME（默认 ~/.zcode/cli）、SHADOW_ZCODE_CLI（zcode.cjs 绝对路径）。
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveBash, bashUnavailableMessage } from '../scripts/resolve-bash.mjs'

const HOOK_DIR = dirname(fileURLToPath(import.meta.url))

const warn = (m) => { try { process.stderr.write(`shadow-dev bootstrap: ${m}\n`) } catch { /* stderr 不可写时静默 */ } }
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

// —— 1) CLI 自举：解析可信 bash（去 WSL 桩）后调用既有脚本；该脚本自身恒 exit 0、失败仅 stderr ——
function ensureCli () {
  if (process.env.SHADOW_CLI_HOOK_DISABLE === '1') return
  const bash = resolveBash()
  if (!bash) { warn(`CLI 自举跳过——${bashUnavailableMessage()}`); return }
  const r = spawnSync(bash.path, [join(HOOK_DIR, 'bootstrap-cli.sh')], { encoding: 'utf8', timeout: 55000 })
  if (r.stderr) { try { process.stderr.write(r.stderr.endsWith('\n') ? r.stderr : r.stderr + '\n') } catch {} }
  if (r.error) warn(`CLI 自举未能执行（${r.error.message}）`)
}

// —— 2) 插件自同步：仅 ZCode 插件形态（宿主注入 ZCODE_PLUGIN_*）；仅目录型 marketplace 可比对源仓 ——
function syncPlugin () {
  if (process.env.SHADOW_PLUGIN_SYNC_DISABLE === '1') return
  const pluginId = process.env.ZCODE_PLUGIN_ID
  const pluginName = process.env.ZCODE_PLUGIN_NAME
  if (!pluginId || !pluginName) return // 非 ZCode 插件形态（Claude Code / Codex / 手工运行）→ 不介入宿主更新
  const cliHome = process.env.SHADOW_ZCODE_CLI_HOME || join(homedir(), '.zcode', 'cli')
  const installed = readJson(join(cliHome, 'plugins', 'installed_plugins.json'))?.plugins?.find(p => p.id === pluginId)
  if (!installed) return // bind 形态或非当前 marketplace 安装 → 无可同步
  const known = readJson(join(cliHome, 'plugins', 'known_marketplaces.json'))?.marketplaces?.find(m => m.id === installed.marketplace)
  const src = known?.source
  if (src?.source !== 'directory' || !src.path) return // 非目录型源（GitHub marketplace 等）走宿主自身更新路径
  const srcVersion = readJson(join(src.path, '.claude-plugin', 'plugin.json'))?.version
  if (!srcVersion || srcVersion === installed.version) return
  // 源仓必须停在 main：分支上的版本是开发态，不往本机安装里同步（静默跳过，不打扰开发会话）
  const branch = spawnSync('git', ['-C', src.path, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).stdout?.trim()
  if (branch !== 'main') return
  const zcode = findZcodeCli()
  if (!zcode) { warn('插件自同步跳过——未找到 zcode CLI（可用 SHADOW_ZCODE_CLI 显式指定 zcode.cjs）'); return }
  const run = (args) => spawnSync(process.execPath, [zcode, ...args], { encoding: 'utf8', timeout: 120000 })
  const step = (label, args) => {
    const r = run(args)
    if (r.error) { warn(`${label} 未能执行（${r.error.message}）`); return false }
    if (r.status !== 0) { warn(`${label} 失败（rc=${r.status}）：${((r.stderr || r.stdout || '').trim().split('\n')[0] || '无输出')}`); return false }
    return true
  }
  if (!step('marketplace 刷新', ['plugins', 'marketplace', 'update', installed.marketplace])) return
  if (!step('插件更新', ['plugins', 'update', pluginName])) return
  warn(`本机插件 ${pluginName} 已同步：${installed.version} → ${srcVersion}（重启宿主后生效）`)
}

function findZcodeCli () {
  const envCli = process.env.SHADOW_ZCODE_CLI
  if (envCli) return existsSync(envCli) ? envCli : null
  if (process.platform === 'win32') {
    const dir = process.env.ZCODE_WINDOWS_APP_INSTALL_DIR || 'C:\\Program Files\\ZCode'
    const cand = join(dir, 'resources', 'glm', 'zcode.cjs')
    return existsSync(cand) ? cand : null
  }
  const which = spawnSync('sh', ['-c', 'command -v zcode'], { encoding: 'utf8' })
  return which.status === 0 && which.stdout.trim() ? which.stdout.trim() : null
}

try { ensureCli() } catch (e) { warn(`CLI 自举异常（已忽略）：${e.message}`) }
try { syncPlugin() } catch (e) { warn(`插件自同步异常（已忽略）：${e.message}`) }
