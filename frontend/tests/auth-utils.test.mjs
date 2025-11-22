import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')

const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const { MIN_PASSWORD_LENGTH, canSendEmail, canSubmitPasswords, resolveTokenState, validatePasswords } = await loadModule(
  'auth.utils.js'
)

describe('auth.utils', () => {
  it('validates password length and mismatch', () => {
    const short = validatePasswords('123', '123')
    assert.equal(short.tooShort, true)
    assert.equal(short.mismatch, false)

    const mismatch = validatePasswords('123456', '123')
    assert.equal(mismatch.tooShort, false)
    assert.equal(mismatch.mismatch, true)

    const ok = validatePasswords('123456', '123456')
    assert.equal(ok.tooShort, false)
    assert.equal(ok.mismatch, false)
  })

  it('checks password submission availability', () => {
    const ready = validatePasswords('x'.repeat(MIN_PASSWORD_LENGTH), 'x'.repeat(MIN_PASSWORD_LENGTH))
    assert.equal(canSubmitPasswords(ready), true)
    assert.equal(canSubmitPasswords({ tooShort: true, mismatch: false }), false)
    assert.equal(canSubmitPasswords({ tooShort: false, mismatch: true }), false)
    assert.equal(canSubmitPasswords(ready, true), false)
  })

  it('maps token status to view state', () => {
    assert.equal(resolveTokenState(undefined), 'checking')
    assert.equal(resolveTokenState(200), 'ready')
    assert.equal(resolveTokenState(204), 'expired')
    assert.equal(resolveTokenState(400), 'invalid')
    assert.equal(resolveTokenState(404), 'invalid')
  })

  it('validates email sending preconditions', () => {
    assert.equal(canSendEmail(true, true), true)
    assert.equal(canSendEmail(false, true), false)
    assert.equal(canSendEmail(true, false), false)
    assert.equal(canSendEmail(true, true, true), false)
  })
})
