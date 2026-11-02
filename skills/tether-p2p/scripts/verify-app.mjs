#!/usr/bin/env node
/**
 * Static checks the skill's verify list can actually fail.
 * Run: node scripts/verify-app.mjs /path/to/app
 * Does not prove two peers over the internet.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const appDir = path.resolve(process.argv[2] || process.cwd())
const errors = []
const notes = []

const pkgPath = path.join(appDir, 'package.json')
if (!existsSync(pkgPath)) {
  console.error('FAIL verify-app: no package.json in ' + appDir)
  process.exit(1)
}
const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
const upgrade = String(pkg.upgrade || '')
if (!upgrade.startsWith('pear://')) {
  errors.push('package.json upgrade missing pear:// (run scripts/set-upgrade.mjs .)')
} else if (/YOUR_KEY/i.test(upgrade)) {
  errors.push('package.json upgrade is still the template placeholder')
} else {
  notes.push('upgrade ' + upgrade)
}

const skipDir = new Set([
  'node_modules', '.git', 'dist', 'out', 'build', '.next', 'coverage', 'tmp'
])

const files = await walk(appDir, skipDir)
const textByFile = new Map()
for (const file of files) {
  if (!/\.(js|mjs|cjs|ts|tsx|jsx)$/.test(file)) continue
  textByFile.set(file, await readFile(file, 'utf8'))
}

const uiRoots = ['renderer', 'src', 'app', 'ui']
const workerRoots = ['workers', 'worker']
const forbiddenInUi = [
  'hypercore',
  'autobase',
  'hyperswarm',
  'hyperdht',
  'corestore',
  '@qvac/inference',
  '@qvac/sdk'
]

for (const [file, text] of textByFile) {
  const rel = path.relative(appDir, file)
  const inUi = uiRoots.some((r) => rel === r || rel.startsWith(r + path.sep))
  if (!inUi) continue
  for (const name of forbiddenInUi) {
    if (importOf(text, name)) {
      errors.push(`${rel} imports ${name} — P2P/QVAC belongs in workers/, not the UI`)
    }
  }
}

let sawReplicate = false
let sawDiscovery = false
let sawJoinFlushed = false
let sawAutobase = false
let sawAddWriter = false
let sawQvacNode = false

for (const [file, text] of textByFile) {
  const rel = path.relative(appDir, file)
  if (text.includes('store.replicate') || text.includes('.replicate(socket)') || text.includes('.replicate(s)')) {
    sawReplicate = true
  }
  if (text.includes('discoveryKey')) sawDiscovery = true
  if (text.includes('.flushed()')) sawJoinFlushed = true
  if (importOf(text, 'autobase')) sawAutobase = true
  if (text.includes('addWriter')) sawAddWriter = true
  const inWorker = workerRoots.some((r) => rel === r || rel.startsWith(r + path.sep))
  if (!inWorker && importOf(text, '@qvac/inference')) sawQvacNode = true
}

const allText = [...textByFile.values()].join('\n')
const appTopicJoin = /join\(\s*(?:base|core|drive)\.discoveryKey/.test(allText)

if (hasDep(pkg, 'hyperswarm') || sawReplicate) {
  if (!sawReplicate) errors.push('Hyperswarm present but no store.replicate on connection')
}
if (appTopicJoin && !sawDiscovery) {
  errors.push('app join without discoveryKey — do not join core.key')
}
if ((sawAutobase || appTopicJoin) && !sawJoinFlushed) {
  errors.push('room/data join missing .flushed() — use await swarm.join(discoveryKey, { server: true, client: true }).flushed()')
}

if (sawAutobase && !sawAddWriter) {
  errors.push('Autobase without addWriter — a second device cannot become a writer')
}

if (sawQvacNode) {
  errors.push('@qvac/inference imported outside workers/ — it is Bare-only')
}

if (errors.length === 0 && notes.length === 0) {
  notes.push('no P2P imports found yet — scaffold only? add the recipe before claiming done')
}

if (errors.length) {
  console.error('FAIL verify-app')
  for (const e of errors) console.error(' - ' + e)
  process.exit(1)
}

console.log('OK verify-app (static). Two-peer runtime still required for a P2P claim.')
for (const n of notes) console.log(' - ' + n)

function importOf (text, name) {
  const re = new RegExp(
    `(?:from\\s+['"]${escapeRe(name)}['"]|require\\(\\s*['"]${escapeRe(name)}['"]\\s*\\)|import\\(\\s*['"]${escapeRe(name)}['"]\\s*\\))`
  )
  return re.test(text)
}

function hasDep (pkg, name) {
  return !!(pkg.dependencies && pkg.dependencies[name]) ||
    !!(pkg.devDependencies && pkg.devDependencies[name])
}

function escapeRe (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function walk (dir, skip, acc = []) {
  let entries
  try {
    entries = await readdir(dir)
  } catch {
    return acc
  }
  for (const name of entries) {
    if (skip.has(name)) continue
    const full = path.join(dir, name)
    let st
    try {
      st = await stat(full)
    } catch {
      continue
    }
    if (st.isDirectory()) await walk(full, skip, acc)
    else acc.push(full)
  }
  return acc
}
