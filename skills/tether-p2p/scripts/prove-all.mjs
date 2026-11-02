#!/usr/bin/env node
/** Skill capability score. Run from a dir that has Hyper* deps (this repo: tests/). */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const cases = [
  'prove-room.mjs',
  'prove-vault.mjs',
  'prove-wallet.mjs',
  'prove-qvac.mjs',
  'prove-holesail.mjs'
]

let passed = 0
const rows = []
for (const file of cases) {
  const t0 = Date.now()
  const r = await run(process.execPath, [path.join(dir, file)])
  const ms = Date.now() - t0
  const ok = r.status === 0
  if (ok) passed++
  const line = (ok ? 'PASS' : 'FAIL') + ' ' + String(ms).padStart(5) + 'ms  ' + file.replace('.mjs', '')
  const errLine = (r.stderr || r.stdout).trim().split('\n').filter((l) => !/^Node\.js /.test(l)).pop()
  console.log(line + (ok ? '' : ' — ' + errLine))
  rows.push({ file, ok, ms })
}

console.log('\n' + passed + '/' + cases.length + ' skill proves')
process.exit(passed === cases.length ? 0 : 1)

function run (cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += d })
    child.stderr.on('data', (d) => { stderr += d })
    child.on('close', (status) => resolve({ status, stdout, stderr }))
    child.on('error', (e) => resolve({ status: 1, stdout: '', stderr: e.message }))
  })
}
