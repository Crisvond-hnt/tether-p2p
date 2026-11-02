#!/usr/bin/env node
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { bindCwdModules, skillRoot } from './lib-node.mjs'

await bindCwdModules()
const { createWallet, ethereumAddress } = await import(
  pathToFileURL(path.join(skillRoot, 'assets', 'wallet.mjs')).href
)
const require = createRequire(path.join(process.cwd(), 'package.json'))
const Identity = require('keet-identity-key')
const Ctor = Identity.generateMnemonic ? Identity : (Identity.default || Identity)
const identity = Ctor.generateMnemonic()
const { wdk, seed, WDK } = await createWallet()
if (seed === identity) throw new Error('identity and WDK seeds collided')
if (!WDK.isValidSeed(seed)) throw new Error('invalid seed')
const address = await ethereumAddress(wdk)
if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error('bad address ' + address)
console.log('OK prove-wallet ' + address.slice(0, 10) + ' words=' + seed.trim().split(/\s+/).length)
