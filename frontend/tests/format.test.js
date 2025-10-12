import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const sourcePath = new URL('../src/common/format.ts', import.meta.url)
const source = readFileSync(sourcePath, 'utf8')
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
})

const tempFile = path.join(tmpdir(), `format-${Date.now()}.mjs`)
writeFileSync(tempFile, transpiled.outputText, 'utf8')

const formatModule = await import(pathToFileURL(tempFile).href)

const {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatHours,
  computePercentageDelta,
  computeTrendDirection,
} = formatModule

const normalizeSpaces = (value) => value.replace(/[\u00A0\u202F]/g, ' ')

test('format helpers format values using french locale', () => {
  const currency = formatCurrency(12500)
  assert.ok(currency.includes('DT'))
  assert.ok(currency.includes('12'))

  const percentage = formatPercentage(0.873, 1)
  assert.ok(percentage.includes('87,3'))

  const hours = formatHours(2.5)
  assert.equal(hours, '2,5 h')

  const number = formatNumber(1542.23, 1)
  assert.equal(normalizeSpaces(number), '1 542,2')
})

test('trend helpers compute deltas and direction', () => {
  assert.equal(computeTrendDirection(10, 5), 'up')
  assert.equal(computeTrendDirection(5, 10), 'down')
  assert.equal(computeTrendDirection(4, 4), 'flat')

  assert.equal(computePercentageDelta(120, 100), 20)
  assert.equal(computePercentageDelta(0, 0), 0)
  assert.equal(computePercentageDelta(50, 0), 100)
})
