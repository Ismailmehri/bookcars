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
const pagesDist = path.join(distRoot, 'frontend/src/pages')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(pagesDist, relativePath)))

const { default: About } = await loadModule('About.js')

test('About page renders streamlined sections', () => {
  const html = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(About))
  )

  assert.match(html, /about-page__hero/)
  assert.match(html, /about-page__card--intro/)
  assert.equal((html.match(/about-page__values-item/g) || []).length, 3)
  assert.equal((html.match(/about-page__coverage-item/g) || []).length, 5)
})
