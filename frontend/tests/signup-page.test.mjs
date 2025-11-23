import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

globalThis.__TEST_IMPORT_META_ENV = globalThis.__TEST_IMPORT_META_ENV || {}
globalThis.localStorage = globalThis.localStorage || {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}
globalThis.window = globalThis.window || { location: { search: '' } }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const pagesDist = path.join(distRoot, 'frontend/src/pages')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(pagesDist, relativePath)))

const { default: SignUp } = await loadModule('SignUp.js')

test('SignUp renders compact auth card with portal CTA', () => {
  const html = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(SignUp))
  )

  assert.match(html, /signup-card/)
  assert.match(html, /signup-portal-alert/)
  assert.match(html, /signup-tos/)
  assert.match(html, /auth-messages/)
})
