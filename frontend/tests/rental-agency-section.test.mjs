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

const { default: RentalAgencySection } = await loadModule('RentalAgencySection.js')

test('RentalAgencySection keeps compact grid', () => {
  const html = renderToString(React.createElement(RentalAgencySection))

  assert.match(html, /rental-agency__grid/)
  assert.equal((html.match(/rental-agency__card/g) || []).length, 4)
  assert.ok(html.includes('Rejoignez Plany'))
  assert.ok(html.includes('Inscrivez votre agence maintenant'))
})
