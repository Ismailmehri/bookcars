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

const { default: LocationHeader } = await loadModule('LocationHeader.js')

test('LocationHeader highlights the selected city', () => {
  const location = { name: 'Tunis' }
  const html = renderToString(React.createElement(LocationHeader, { location }))

  assert.ok(html.includes('location-header__title'))
  assert.ok(html.includes('Tunis'))
})
