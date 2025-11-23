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

const { default: HowItWorks } = await loadModule('HowItWorks.js')

test('HowItWorks renders four streamlined steps', () => {
  const html = renderToString(React.createElement(HowItWorks))

  assert.match(html, /how-it-works__grid/)
  assert.equal((html.match(/how-it-works__card/g) || []).length, 4)
  assert.ok(html.includes('Comment ça fonctionne'))
  assert.ok(html.includes('Réserver en ligne'))
})
