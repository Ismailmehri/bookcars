import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const utilsDist = path.join(distRoot, 'frontend/src/components/location')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(utilsDist, relativePath)))

const { pickCrosslinks, labelFromSlug } = await loadModule('utils.js')

test('pickCrosslinks limits the number of links returned', () => {
  const links = ['/a', '/b', '/c', '/d']
  assert.deepEqual(pickCrosslinks(links, 2), ['/a', '/b'])
  assert.deepEqual(pickCrosslinks(links, 10), links)
  assert.deepEqual(pickCrosslinks([], 3), [])
})

test('labelFromSlug formats slugs into readable city names', () => {
  assert.equal(labelFromSlug('/location-voiture-pas-cher-a-sousse'), 'Sousse')
  assert.equal(labelFromSlug('/location-voiture-pas-cher-a-jerba-midoun'), 'Jerba Midoun')
  assert.equal(labelFromSlug('/autre-exemple-de-ville'), 'Autre Exemple De Ville')
})
