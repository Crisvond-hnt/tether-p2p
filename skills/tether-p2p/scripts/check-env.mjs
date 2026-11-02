#!/usr/bin/env node
/**
 * Fail fast before an agent wastes an hour on Node 20 or a missing pear binary.
 * Run: node scripts/check-env.mjs
 */
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'

const errors = []
const notes = []

const parts = process.versions.node.split('.').map(Number)
const nodeOk = parts[0] > 22 || (parts[0] === 22 && parts[1] >= 17)
if (!nodeOk) {
  errors.push(`Node ${process.version} is too old. Pear and this stack need 22.17+ (nvm use 22).`)
} else {
  notes.push(`node ${process.version}`)
}

const home = os.homedir()
const candidates = [
  process.env.PEAR_BIN,
  'pear',
  home && path.join(home, '.local', 'bin', 'pear')
].filter(Boolean)

let pear = null
for (const c of candidates) {
  if (c === 'pear') {
    const which = await run('which', ['pear'], 4000)
    if (which.status === 0 && which.stdout.trim()) {
      pear = which.stdout.trim()
      break
    }
  } else if (existsSync(c)) {
    pear = c
    break
  }
}

if (!pear) {
  errors.push(
    'pear CLI not found. Install: curl https://install.pears.com/pear.sh | sh — then export PATH="$HOME/.local/bin:$PATH"'
  )
} else {
  const ver = await run(pear, ['-v'], 20000)
  if (ver.status !== 0) {
    errors.push(`pear -v failed (${pear}): ${(ver.stderr || ver.stdout).slice(0, 180)}`)
  } else {
    const line = (ver.stdout || ver.stderr).split(/\r?\n/).find((l) => l.trim()) || ''
    notes.push(`pear ${line.trim()} (${pear})`)
  }
}

if (errors.length) {
  console.error('FAIL check-env')
  for (const e of errors) console.error(' - ' + e)
  process.exit(1)
}

console.log('OK check-env')
for (const n of notes) console.log(' - ' + n)

function run (cmd, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    const t = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({ status: 1, stdout, stderr: stderr + '\ntimeout' })
    }, timeoutMs)
    child.stdout.on('data', (d) => { stdout += d })
    child.stderr.on('data', (d) => { stderr += d })
    child.on('error', (e) => {
      clearTimeout(t)
      resolve({ status: 1, stdout, stderr: e.message })
    })
    child.on('close', (status) => {
      clearTimeout(t)
      resolve({ status, stdout, stderr })
    })
  })
}
