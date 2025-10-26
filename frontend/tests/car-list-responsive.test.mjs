import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentsDist = path.join(distRoot, 'frontend/src/components')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentsDist, relativePath)))

const carListModule = await loadModule('car-list.utils.js')
const { buildCarListSectionClassName } = carListModule

test('buildCarListSectionClassName keeps custom classes intact', () => {
  const className = buildCarListSectionClassName({ className: 'search-results', isMobile: false })
  assert.equal(className, 'search-results car-list')
})

test('buildCarListSectionClassName appends the mobile modifier', () => {
  const className = buildCarListSectionClassName({ className: undefined, isMobile: true })
  assert.equal(className, 'car-list car-list-mobile')
})

test('buildCarListSectionClassName trims extra whitespace from custom classes', () => {
  const className = buildCarListSectionClassName({ className: '  extra  ', isMobile: true })
  assert.equal(className, 'extra car-list car-list-mobile')
})

