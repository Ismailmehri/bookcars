import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentDist = path.join(distRoot, 'frontend/src/components')

globalThis.__TEST_IMPORT_META_ENV = {}
globalThis.window = { innerWidth: 1200 }
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentDist, relativePath)))

const { default: SupplierCarrousel } = await loadModule('SupplierCarrousel.js')

test('SupplierCarrousel shows loading state', () => {
  const html = renderToString(React.createElement(SupplierCarrousel, { suppliers: [], loading: true }))

  assert.match(html, /Chargement des partenaires/)
})

test('SupplierCarrousel renders filtered suppliers', () => {
  const suppliers = [
    { _id: '1', avatar: 'logo.png', fullName: 'Actif', carCount: 3, active: true, verified: true },
    { _id: '2', avatar: 'logo2.png', fullName: 'Inactif', carCount: 0, active: false, verified: false },
  ]

  const html = renderToString(React.createElement(SupplierCarrousel, { suppliers }))

  assert.ok(html.includes('Actif'))
  assert.ok(!html.includes('Inactif'))
})
