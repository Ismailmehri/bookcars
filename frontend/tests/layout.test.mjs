import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const constantsDist = path.join(distRoot, 'frontend/src/constants')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(constantsDist, relativePath)))

const layoutModule = await loadModule('layout.js')

test('getSearchContentMaxWidth returns full width on mobile', () => {
  assert.equal(layoutModule.getSearchContentMaxWidth(true), '100%')
})

test('getSearchContentMaxWidth returns the desktop max width', () => {
  assert.equal(layoutModule.getSearchContentMaxWidth(false), `${layoutModule.SEARCH_CONTENT_MAX_WIDTH}px`)
})

test('SEARCH_CONTENT_MAX_WIDTH matches the car list layout', () => {
  assert.equal(layoutModule.SEARCH_CONTENT_MAX_WIDTH, 980)
})
