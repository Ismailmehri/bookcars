import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const { transformScore, getAvailabilityDisplay } = await loadModule('frontend/src/components/car-card.utils.js')

test('transformScore clamps invalid scores to zero', () => {
  assert.equal(transformScore(-10), 0)
  assert.equal(transformScore(0), 0)
  assert.equal(transformScore(120), 0)
})

test('transformScore converts percentage into five-star scale with rounding', () => {
  assert.equal(transformScore(50), 2.5)
  assert.equal(transformScore(95), 4.8)
})

test('getAvailabilityDisplay returns matching labels for each state', () => {
  const labels = {
    available: 'Disponible à la location',
    availableTooltip: 'La voiture peut être réservée',
    unavailable: 'Indisponible',
    unavailableTooltip: 'La voiture n\'est pas disponible',
  }

  const available = getAvailabilityDisplay(true, labels)
  assert.equal(available.label, labels.available)
  assert.equal(available.tooltip, labels.availableTooltip)
  assert.equal(available.color, 'success')

  const unavailable = getAvailabilityDisplay(false, labels)
  assert.equal(unavailable.label, labels.unavailable)
  assert.equal(unavailable.tooltip, labels.unavailableTooltip)
  assert.equal(unavailable.color, 'default')
})
