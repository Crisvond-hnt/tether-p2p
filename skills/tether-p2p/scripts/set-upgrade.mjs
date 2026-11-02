#!/usr/bin/env node
/**
 * pear touch does NOT write package.json. Agents forget this and boot INVALID_URL.
 * Run from the app directory, or: node scripts/set-upgrade.mjs /path/to/app
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'

const appDir = path.resolve(process.argv[2] || process.cwd())
const pkgPath = path.join(appDir, 'package.json')
if (!existsSync(pkgPath)) {
  console.error('FAIL set-upgrade: no package.json in ' + appDir)
  process.exit(1)
}

const pear =
  process.env.PEAR_BIN ||
  (existsSync(path.join(os.homedir(), '.local', 'bin', 'pear'))
    ? path.join(os.homedir(), '.local', 'bin', 'pear')
    : 'pear')

const out = await run(pear, ['touch'], 30000)
const blob = `${out.stdout}\n${out.stderr}`
const m = blob.match(/pear:\/\/[a-z0-9]+/i)
if (!m) {
  console.error('FAIL set-upgrade: pear touch did not print pear://')
  console.error(blob.slice(0, 400))
  console.error('Install Pear, then: export PATH="$HOME/.local/bin:$PATH"')
  process.exit(1)
}
const link = m[0]
if (/YOUR_KEY/i.test(link)) {
  console.error('FAIL set-upgrade: still a placeholder: ' + link)
  process.exit(1)
}

const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
pkg.upgrade = link
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log('OK set-upgrade ' + link)
console.log('wrote ' + pkgPath)

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
