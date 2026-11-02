import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export function bindCwdModules () {
  const appModules = path.join(process.cwd(), 'node_modules')
  process.env.NODE_PATH = [appModules, process.env.NODE_PATH].filter(Boolean).join(path.delimiter)
  return import('node:module').then((Module) => {
    Module.Module._initPaths()
    return createRequire(path.join(process.cwd(), 'package.json'))
  })
}

export function sleep (ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function waitUntil (fn, ms, label) {
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
