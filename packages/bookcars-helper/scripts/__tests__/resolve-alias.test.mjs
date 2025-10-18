import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  applySpecifierReplacement,
  resolveAliases,
} from '../resolve-alias.mjs'

test('applySpecifierReplacement replaces single and double quoted aliases', () => {
  const content = [
    "import helper from ':bookcars-types'",
    'const other = ":bookcars-types"',
  ].join('\n')

  const result = applySpecifierReplacement(content, (quote) => `${quote}resolved${quote}`)

  assert.equal(
    result,
    [
      "import helper from 'resolved'",
      'const other = "resolved"',
    ].join('\n'),
  )
})

test('resolveAliases updates generated helper artifacts when present', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'resolve-alias-'))

  try {
    const jsPath = path.join(tmpDir, 'index.js')
    const dtsPath = path.join(tmpDir, 'index.d.ts')

    await writeFile(jsPath, "import types from ':bookcars-types'\n", 'utf8')
    await writeFile(dtsPath, 'export * from ":bookcars-types"\n', 'utf8')

    await resolveAliases(tmpDir)

    const jsContent = await readFile(jsPath, 'utf8')
    const dtsContent = await readFile(dtsPath, 'utf8')

    assert.equal(jsContent, "import types from '../bookcars-types/index.js'\n")
    assert.equal(dtsContent, 'export * from "../bookcars-types"\n')
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
})
