import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const pageDist = path.join(distRoot, 'frontend/src/pages')

globalThis.__TEST_IMPORT_META_ENV = {}
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const loadPage = async (relativePath) => import(pathToFileURL(path.join(pageDist, relativePath)))

const { default: Info } = await loadPage('Info.js')

test('Info renders message and home link', () => {
  const html = renderToString(React.createElement(Info, { message: 'Saved', type: 'success' }))

  assert.ok(html.includes('Saved'))
  assert.ok(html.includes('info-panel--success'))
  assert.match(html, /info-panel__link/)
})
