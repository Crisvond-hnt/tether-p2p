#!/usr/bin/env node
/**
 * Capability eval for Recipe A: two writers, local testnet, gold room.cjs.
 * Run from tests/ (has the Hyper* deps):
 *   nvm use 22 && node ../skills/tether-p2p/scripts/prove-room.mjs
 * Or from an app after: npm i corestore hyperswarm autobase hyperbee hyperdht
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'

const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const appModules = path.join(process.cwd(), 'node_modules')
process.env.NODE_PATH = [appModules, process.env.NODE_PATH].filter(Boolean).join(path.delimiter)
const Module = await import('node:module')
Module.Module._initPaths()
const require = createRequire(path.join(process.cwd(), 'package.json'))

const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const createTestnet = require('hyperdht/testnet')
const { openRoom } = require(path.join(skillRoot, 'assets', 'room.cjs'))

function sleep (ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitUntil (fn, ms, label) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < ms) {
    try {
      const v = await fn()
      if (v) return v
    } catch (e) {
      last = e
    }
    await sleep(40)
  }
  throw new Error(label + (last ? ': ' + last.message : ''))
}

const tmp = await mkdtemp(path.join(os.tmpdir(), 'tether-room-'))
const testnet = await createTestnet(3)
const t0 = Date.now()
try {
  const storeA = new Corestore(path.join(tmp, 'a'))
  const storeB = new Corestore(path.join(tmp, 'b'))
  const swarmA = new Hyperswarm({ bootstrap: testnet.bootstrap })
  const swarmB = new Hyperswarm({ bootstrap: testnet.bootstrap })
  const a = await openRoom(storeA, swarmA)
  const b = await openRoom(storeB, swarmB, { bootstrapKey: a.keyHex() })
  await a.admit(b.writerHex())
  await waitUntil(async () => {
    await b.base.update()
    return b.base.writable
  }, 15000, 'B never became writable')
  const id = await b.send('hello from B')
  const got = await waitUntil(async () => a.get(id), 15000, 'A never saw B message')
  if (!got || got.text !== 'hello from B') throw new Error('bad view ' + JSON.stringify(got))
  console.log('OK prove-room ' + (Date.now() - t0) + 'ms id=' + id)
  await swarmA.destroy()
  await swarmB.destroy()
  await a.base.close()
  await b.base.close()
  await storeA.close()
  await storeB.close()
} finally {
  await testnet.destroy()
  await rm(tmp, { recursive: true, force: true })
}
