#!/usr/bin/env node
/** Pack integrity: every eval case has its gold file. */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { skillRoot } from './lib-node.mjs'

const cases = JSON.parse(await readFile(path.join(skillRoot, 'evals', 'cases.json'), 'utf8'))
const errors = []
for (const c of cases) {
  for (const rel of c.copy || []) {
    if (!existsSync(path.join(skillRoot, rel))) errors.push(c.id + ' missing ' + rel)
  }
  if (c.prove && !existsSync(path.join(skillRoot, c.prove))) {
    errors.push(c.id + ' missing ' + c.prove)
  }
}
if (errors.length) {
  console.error('FAIL grade-skill')
  for (const e of errors) console.error(' - ' + e)
  process.exit(1)
}
console.log('OK grade-skill ' + cases.length + ' cases')
