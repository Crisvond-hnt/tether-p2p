#!/usr/bin/env node
import path from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import { bindCwdModules, skillRoot, waitUntil } from './lib-node.mjs'

const require = await bindCwdModules()
const Corestore = require('corestore')
const createTestnet = require('hyperdht/testnet')
const { createVault, pairVault } = require(path.join(skillRoot, 'assets', 'vault.cjs'))

const tmp = await mkdtemp(path.join(os.tmpdir(), 'tether-vault-'))
const testnet = await createTestnet(3)
const t0 = Date.now()
try {
  const a = await createVault(new Corestore(path.join(tmp, 'a')), { bootstrap: testnet.bootstrap })
  const inv = await a.createInvite()
  const pairer = pairVault(new Corestore(path.join(tmp, 'b')), inv, { bootstrap: testnet.bootstrap })
  const b = await Promise.race([
    pairer.finished(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('pair timeout 20s')), 20000))
  ])
  await b.ready()
  await a.add('a-note', 'hello this is a note')
  await waitUntil(async () => {
    const note = await b.get('a-note')
    const value = note && (note.value !== undefined ? note.value : note)
    return value === 'hello this is a note'
  }, 15000, 'paired vault missing note')
  console.log('OK prove-vault ' + (Date.now() - t0) + 'ms')
  try { await pairer.close() } catch {}
  await b.close()
  await a.close()
} finally {
  await testnet.destroy()
  await rm(tmp, { recursive: true, force: true })
}
