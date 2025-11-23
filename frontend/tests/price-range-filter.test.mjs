import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentDist = path.join(distRoot, 'frontend/src/components')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentDist, relativePath)))

const { default: PriceRangeFilter } = await loadModule('PriceRangeFilter.js')

test('PriceRangeFilter exposes current values', () => {
  const marks = [
    { value: 40, label: '40DT' },
    { value: 1000, label: '1000DT' },
  ]

  const html = renderToString(React.createElement(PriceRangeFilter, {
    value: [50, 200],
    min: 40,
    max: 1000,
    marks,
    onChange: () => null,
  }))

  assert.ok(html.includes('50DT'))
  assert.ok(html.includes('200DT'))
})
