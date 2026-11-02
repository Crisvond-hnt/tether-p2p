#!/usr/bin/env node
/**
 * Clone an official Pear host, set upgrade, install Recipe A deps, copy gold room.
 * Usage: node scripts/scaffold.mjs electron ./my-app
 */
import { spawn } from 'node:child_process'
import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const hosts = {
  electron: 'https://github.com/holepunchto/hello-pear-electron',
  bare: 'https://github.com/holepunchto/hello-pear-bare',
  daemon: 'https://github.com/holepunchto/hello-pear-daemon',
  'qvac-tui': 'https://github.com/holepunchto/hello-pear-qvac-tui',
  rn: 'https://github.com/holepunchto/hello-pear-react-native'
}

const kind = process.argv[2]
const dest = path.resolve(process.argv[3] || `./hello-pear-${kind || 'electron'}`)
const url = hosts[kind]
if (!url) {
  console.error('Usage: node scripts/scaffold.mjs <electron|bare|daemon|qvac-tui|rn> [dest]')
  process.exit(1)
}

const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

if (existsSync(dest)) {
  console.error('FAIL scaffold: dest exists ' + dest)
  process.exit(1)
}

console.log('clone', url)
await run('git', ['clone', '--depth', '1', url, dest], 120000)
console.log('npm install')
await run('npm', ['install'], 180000, dest)
if (kind === 'electron' || kind === 'bare' || kind === 'rn') {
  console.log('npm install recipe A deps')
  await run('npm', ['install', 'autobase', 'hyperbee', 'hyperblobs'], 120000, dest)
}

const setUpgrade = path.join(skillRoot, 'scripts', 'set-upgrade.mjs')
console.log('set-upgrade')
await run(process.execPath, [setUpgrade, dest], 30000)

const roomSrc = path.join(skillRoot, 'assets', 'room.cjs')
const roomDest = path.join(dest, 'workers', 'room.cjs')
await mkdir(path.dirname(roomDest), { recursive: true })
await cp(roomSrc, roomDest)
console.log('copied workers/room.cjs')

console.log('OK scaffold ' + dest)
console.log('Next: wire workers/room.cjs from the existing Bare worker (same Corestore + Hyperswarm).')
console.log('Do not replace the updater worker. Then: node ' + path.join(skillRoot, 'scripts', 'verify-app.mjs') + ' ' + dest)

function run (cmd, args, timeoutMs, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' })
    const t = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error('timeout ' + cmd + ' ' + args.join(' ')))
    }, timeoutMs)
    child.on('error', (e) => {
      clearTimeout(t)
      reject(e)
    })
    child.on('close', (status) => {
      clearTimeout(t)
      if (status !== 0) reject(new Error(cmd + ' exited ' + status))
      else resolve()
    })
  })
}
