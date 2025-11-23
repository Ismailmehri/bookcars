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

const { default: MapPlaceholder } = await loadModule('MapPlaceholder.js')

test('MapPlaceholder renders actionable placeholder', () => {
  const html = renderToString(
    React.createElement(MapPlaceholder, { onShowMap: () => {}, label: 'Charger' })
  )

  assert.ok(html.includes('Carte interactive disponible sur demande.'))
  assert.ok(html.includes('Charger'))
  assert.ok(html.includes('background:#eaeaea'))
})
