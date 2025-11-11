import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(commonDist, relativePath)))

const { formatCityFromSlug, createInternalLinks } = await loadModule('locationLinks.js')

test('formatCityFromSlug extracts readable city names from slugs', () => {
  assert.equal(formatCityFromSlug('/location-voiture-pas-cher-a-sousse'), 'Sousse')
  assert.equal(formatCityFromSlug('/location-voiture-pas-cher-a-jerba-midoun'), 'Jerba Midoun')
  assert.equal(formatCityFromSlug('/autre-slug-personnalise'), 'Autre Slug Personnalise')
})

test('formatCityFromSlug gracefully handles unexpected values', () => {
  assert.equal(formatCityFromSlug(''), '')
  assert.equal(formatCityFromSlug('/'), '')
})

test('createInternalLinks builds links with consistent anchors', () => {
  const links = createInternalLinks([
    '/location-voiture-pas-cher-a-sfax',
    '/location-voiture-pas-cher-a-nabeul',
  ])

  assert.equal(links.length, 2)
  assert.deepEqual(links[0], {
    href: '/location-voiture-pas-cher-a-sfax',
    label: 'Location voiture pas cher à Sfax',
  })
  assert.deepEqual(links[1], {
    href: '/location-voiture-pas-cher-a-nabeul',
    label: 'Location voiture pas cher à Nabeul',
  })
})
