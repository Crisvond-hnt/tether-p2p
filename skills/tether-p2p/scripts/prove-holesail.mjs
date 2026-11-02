#!/usr/bin/env node
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import { waitUntil, sleep } from './lib-node.mjs'

const payload = 'holesail-ok-' + crypto.randomBytes(4).toString('hex')
const local = await listenHttp(payload)
const live = spawn('npx', ['--yes', 'holesail', '--live', String(local.port), '--host', '127.0.0.1'], {
  cwd: '/tmp',
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
})
let out = ''
live.stdout.on('data', (d) => { out += d })
live.stderr.on('data', (d) => { out += d })
let conn = null
const t0 = Date.now()
try {
  const key = await waitUntil(() => {
    const m = out.match(/hs:\/\/[a-z0-9]+/i)
    return m ? m[0] : false
  }, 20000, 'no hs:// key')
  const clientPort = await freePort()
  conn = spawn('npx', ['--yes', 'holesail', '--connect', key, '--port', String(clientPort), '--host', '127.0.0.1'], {
    cwd: '/tmp',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  })
  await waitUntil(async () => {
    try {
      const res = await fetch('http://127.0.0.1:' + clientPort)
      const text = await res.text()
      return text === payload ? text : false
    } catch {
      return false
    }
  }, 20000, 'tunnel HTTP failed')
  console.log('OK prove-holesail ' + (Date.now() - t0) + 'ms ' + key.slice(0, 12))
} finally {
  for (const child of [conn, live]) {
    if (!child || !child.pid) continue
    try { process.kill(-child.pid, 'SIGTERM') } catch {}
  }
  await sleep(200)
  for (const child of [conn, live]) {
    if (!child || !child.pid) continue
    try { process.kill(-child.pid, 'SIGKILL') } catch {}
  }
  await closeServer(local.server)
}

function listenHttp (body) {
  return new Promise((resolve, reject) => {
    const server = createServer((_req, res) => res.end(body))
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
    server.on('error', reject)
  })
}

function freePort () {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}

function closeServer (server) {
  return new Promise((resolve) => server.close(() => resolve()))
}
