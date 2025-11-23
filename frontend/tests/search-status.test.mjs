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

const { default: SearchStatus } = await loadModule('SearchStatus.js')

test('SearchStatus renders retry button on error', () => {
  const html = renderToString(React.createElement(SearchStatus, {
    status: 'error',
    message: 'Erreur de chargement',
    onRetry: () => null,
  }))

  assert.ok(html.includes('search-status--error'))
  assert.ok(html.includes('Réessayer'))
  assert.ok(html.includes('Erreur de chargement'))
})

test('SearchStatus shows loading copy', () => {
  const html = renderToString(React.createElement(SearchStatus, { status: 'loading', message: 'Patientez' }))

  assert.ok(html.includes('search-status--loading'))
  assert.ok(html.includes('Patientez'))
})
