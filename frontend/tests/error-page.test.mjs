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

const { default: ErrorPage } = await loadPage('Error.js')

test('Error page renders alert content', () => {
  const html = renderToString(React.createElement(ErrorPage))

  assert.match(html, /error-page/)
  assert.ok(html.includes('role="alert"') || html.includes('alert'))
  assert.match(html, /error-page__cta/)
})
