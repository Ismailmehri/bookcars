import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')
const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const {
  MIN_MESSAGE_LENGTH,
  MIN_SUBJECT_LENGTH,
  canSubmitContact,
  isMessageValid,
  isSubjectValid,
  sanitizeContactMessage,
} = await loadModule('contact.utils.js')

describe('contact utils', () => {
  it('validates subject and message length', () => {
    assert.equal(isSubjectValid('okay'), true)
    assert.equal(isSubjectValid('  '), false)
    assert.equal(isSubjectValid('aa'), false)
    assert.equal(isMessageValid('hello world'), true)
    assert.equal(isMessageValid('short'), false)
  })

  it('prevents submission when invalid', () => {
    const baseState = {
      emailValid: true,
      subject: 'Sujet',
      message: 'Un message complet',
      sending: false,
      recaptchaToken: 'token',
    }

    assert.equal(canSubmitContact(baseState), true)
    assert.equal(canSubmitContact({ ...baseState, sending: true }), false)
    assert.equal(canSubmitContact({ ...baseState, emailValid: false }), false)
    assert.equal(canSubmitContact({ ...baseState, subject: 'ab' }), false)
    assert.equal(canSubmitContact({ ...baseState, message: 'short' }), false)
    assert.equal(canSubmitContact({ ...baseState, recaptchaToken: '' }), false)
  })

  it('sanitizes message spacing', () => {
    assert.equal(sanitizeContactMessage(' Hello   world   '), 'Hello world')
  })

  it('exposes minimum lengths', () => {
    assert.ok(MIN_SUBJECT_LENGTH > 0)
    assert.ok(MIN_MESSAGE_LENGTH > MIN_SUBJECT_LENGTH)
  })
})
