#!/usr/bin/env node
// electron-walkthrough.mjs — Electron 实机走查的 CDP 标准工具（沉淀自 20260924-feature-git-history-capsule 走查）。
//
// 标准启动姿势（另一个终端 / 后台任务）：
//   NEXT_DEV_URL=http://localhost:3101 node node_modules/next/dist/bin/next dev -p 3101 &
//   NEXT_DEV_URL=http://localhost:3101 node node_modules/electron-vite/bin/electron-vite.js dev -- \
//     --remote-debugging-port=9222 --no-proxy-server
//   · --no-proxy-server 必带：系统代理会劫持 electron 主进程 net.fetch 对 localhost 自定义端口的探测
//   · --remote-debugging-port=9222 即本工具默认连接端口
//
// 用法:
//   node electron-walkthrough.mjs wait <url 前缀>            # 等主窗 target 出现
//   node electron-walkthrough.mjs eval '<js>'                 # 主窗求值（awaitPromise）
//   node electron-walkthrough.mjs nav <url>                   # 导航（等待 2.5s）
//   node electron-walkthrough.mjs shot <out.png>              # 截图（含 OOPIF 插件帧）
//   node electron-walkthrough.mjs iframe                      # 列出全部 target
//   node electron-walkthrough.mjs frame <url 子串> '<js>'     # 对 url 匹配的插件帧 target 求值
//
// 经验约定：插件帧可能是 OOPIF（独立 target，可直连求值）也可能是同进程子帧（只出现在
// executionContext / frameTree）——一种通道读不到就换另一种；帧有宿主侧 5s 超时销毁，抓帧动作要快。

const CDP = process.env.SHADOW_CDP_URL ?? 'http://localhost:9222'
const [, , cmd, a, b] = process.argv

async function mainTarget(prefix = 'http://localhost') {
  const list = await (await fetch(`${CDP}/json/list`)).json()
  return list.find((x) => x.type === 'page' && x.url.startsWith(prefix))
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', reject)
  })
}

function call(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + Math.floor(Math.random() * 1e6)
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id === id) {
        ws.removeEventListener('message', onMsg)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      }
    }
    ws.addEventListener('message', onMsg)
    ws.send(JSON.stringify({ id, method, params }))
    setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 20000)
  })
}

const actions = {
  async wait(prefix) {
    for (let i = 0; i < 60; i++) {
      const t = await mainTarget(prefix).catch(() => null)
      if (t) { console.log('READY', t.url); return }
      await new Promise((r) => setTimeout(r, 1000))
    }
    throw new Error(`main target ${prefix} not ready in 60s`)
  },
  async eval(expr) {
    const ws = await connect((await mainTarget()).webSocketDebuggerUrl)
    const r = await call(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) console.log('EXCEPTION:', (r.exceptionDetails.exception?.description ?? '').slice(0, 800))
    else console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1))
  },
  async nav(url) {
    const ws = await connect((await mainTarget()).webSocketDebuggerUrl)
    await call(ws, 'Page.navigate', { url }).catch(() => {})
    await new Promise((r) => setTimeout(r, 2500))
    console.log('navigated to', url)
  },
  async shot(file) {
    const ws = await connect((await mainTarget()).webSocketDebuggerUrl)
    const r = await call(ws, 'Page.captureScreenshot', { format: 'png' })
    const { writeFileSync } = await import('node:fs')
    writeFileSync(file, Buffer.from(r.data, 'base64'))
    console.log('saved', file)
  },
  async iframe() {
    const list = await (await fetch(`${CDP}/json/list`)).json()
    for (const t of list) console.log(t.type, '|', t.title.slice(0, 40), '|', t.url.slice(0, 80))
  },
  async frame(substr, expr) {
    const list = await (await fetch(`${CDP}/json/list`)).json()
    const t = list.find((x) => x.url.includes(substr) && x.type !== 'page')
    if (!t) throw new Error(`frame target not found for ${substr}`)
    const ws = await connect(t.webSocketDebuggerUrl)
    const r = await call(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) console.log('EXCEPTION:', (r.exceptionDetails.exception?.description ?? '').slice(0, 800))
    else console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1))
  },
}

const handler = actions[cmd]
if (!handler) {
  console.error('usage: electron-walkthrough.mjs wait|eval|nav|shot|iframe|frame ...')
  process.exit(1)
}
handler(a, b).then(() => process.exit(0), (e) => { console.error(e.message); process.exit(1) })
