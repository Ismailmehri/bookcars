import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')

const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const { getSupplierFallbackCopy } = await loadModule('suppliers.utils.js')

const strings = {
  SUPPLIERS_TITLE: 'Titre',
  SUPPLIERS_LOADING: 'Chargement',
  SUPPLIERS_ERROR: 'Erreur',
  SUPPLIERS_RETRY: 'Réessayer',
}

test('getSupplierFallbackCopy returns loading copy without action', () => {
  const copy = getSupplierFallbackCopy('loading', strings)
  assert.equal(copy.title, 'Titre')
  assert.equal(copy.description, 'Chargement')
  assert.equal(copy.action, undefined)
})

test('getSupplierFallbackCopy returns error copy with action label', () => {
  const copy = getSupplierFallbackCopy('error', strings)
  assert.equal(copy.title, 'Titre')
  assert.equal(copy.description, 'Erreur')
  assert.equal(copy.action, 'Réessayer')
})
