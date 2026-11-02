#!/usr/bin/env node
/** Static: gold QVAC file is Bare-shaped. Does not load a model. */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { skillRoot } from './lib-node.mjs'

const src = await readFile(path.join(skillRoot, 'assets', 'qvac-worker.js'), 'utf8')
const need = [
  "@qvac/inference",
  'registerPlugin',
  'loadModel',
  'unloadModel',
  'captureThinking',
  'SECOND Bare worker'
]
for (const n of need) {
  if (!src.includes(n)) throw new Error('qvac-worker.js missing ' + n)
}
if (/from\s+['"]@qvac\/sdk['"]|import\(\s*['"]@qvac\/sdk['"]/.test(src)) {
  throw new Error('qvac-worker.js must not import @qvac/sdk')
}
console.log('OK prove-qvac (static Bare worker asset)')
