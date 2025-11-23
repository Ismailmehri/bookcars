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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentsDist = path.join(distRoot, 'frontend/src/components')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentsDist, relativePath)))

const { default: ContactForm } = await loadModule('ContactForm.js')

test('ContactForm shows disabled state when recaptcha is disabled', () => {
  const html = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(ContactForm))
  )

  assert.match(html, /contact-form__recaptcha-placeholder/)
  assert.match(html, /contact-form__title/)
})
