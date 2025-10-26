import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(commonDist, relativePath)))

const supplierModule = await loadModule('supplier.js')
const { getSupplierProfilePath, buildSupplierLinkMessage } = supplierModule

test('getSupplierProfilePath builds the agency search URL from the slug', () => {
  assert.equal(getSupplierProfilePath('plany-cars'), '/search/agence/plany-cars')
})

test('buildSupplierLinkMessage returns a base message when no price is provided', () => {
  const label = buildSupplierLinkMessage({
    supplierName: 'Plany Cars',
  })

  assert.equal(label, 'Louer une voiture chez Plany Cars')
})

test('buildSupplierLinkMessage includes the formatted daily price when available', () => {
  const label = buildSupplierLinkMessage({
    supplierName: 'Plany Cars',
    dailyPriceLabel: '99 DT',
    dailySuffix: '/jour',
  })

  assert.equal(label, 'Louer une voiture chez Plany Cars à partir de 99 DT/jour')
})
