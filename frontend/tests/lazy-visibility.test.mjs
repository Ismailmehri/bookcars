import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src')

const loadVisibilityModule = async () => import(pathToFileURL(path.join(distRoot, 'common/visibility.js')))

const { shouldRenderLazyContent } = await loadVisibilityModule()

test('should render immediately when already intersecting', () => {
  assert.equal(shouldRenderLazyContent({
    hasIntersected: false,
    idleMs: 1200,
    startedAt: Date.now(),
    isIntersecting: true,
  }), true)
})

test('should render when previously intersected even if not currently in view', () => {
  const startedAt = Date.now()
  assert.equal(shouldRenderLazyContent({
    hasIntersected: true,
    idleMs: 1200,
    startedAt,
    isIntersecting: false,
  }), true)
})

test('should render after idle timeout elapses', () => {
  const startedAt = 1_000
  assert.equal(shouldRenderLazyContent({
    hasIntersected: false,
    idleMs: 500,
    startedAt,
    isIntersecting: false,
    now: 1_600,
  }), true)
})

test('should stay idle before intersection or timeout', () => {
  const startedAt = 1_000
  assert.equal(shouldRenderLazyContent({
    hasIntersected: false,
    idleMs: 2000,
    startedAt,
    isIntersecting: false,
    now: 1_500,
  }), false)
})
