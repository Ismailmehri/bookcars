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

test('MapPlaceholder renders CTA with provided label', () => {
  const html = renderToString(React.createElement(MapPlaceholder, { onShowMap: () => null, label: 'Afficher la carte' }))

  assert.ok(html.includes('map-placeholder'))
  assert.ok(html.includes('Afficher la carte'))
})
