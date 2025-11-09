import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(commonDist, relativePath)))

const { locationPageConfigs } = await loadModule('locationPageRoutes.js')

const expectedPaths = [
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
  '/location-voiture-pas-cher-a-monastir',
  '/location-voiture-pas-cher-a-mahdia',
  '/location-voiture-pas-cher-a-kairouan',
  '/location-voiture-pas-cher-a-djerba',
  '/location-voiture-pas-cher-a-ariana',
  '/location-voiture-pas-cher-a-ben-arous',
  '/location-voiture-pas-cher-a-bizerte',
  '/location-voiture-pas-cher-a-gabes',
  '/location-voiture-pas-cher-a-gafsa',
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
]

test('locationPageConfigs expose every expected city path', () => {
  const paths = locationPageConfigs.map((config) => config.path).sort()
  assert.deepEqual(paths, [...expectedPaths].sort())
})

test('each locationPageConfig provides a callable importer', () => {
  for (const config of locationPageConfigs) {
    assert.equal(typeof config.importer, 'function', `importer missing for ${config.path}`)
  }
})
