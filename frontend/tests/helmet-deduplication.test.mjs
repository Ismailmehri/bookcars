import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/shims')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const createElement = (tagName, attributes = {}) => {
  const attributeMap = new Map(Object.entries(attributes))

  return {
    tagName: tagName.toLowerCase(),
    parentNode: null,
    attributes: attributeMap,
    textContent: '',
    setAttribute(key, value) {
      attributeMap.set(key, value)
    },
    getAttribute(key) {
      return attributeMap.get(key) ?? null
    },
  }
}

const createHead = (elements = []) => {
  const children = []
  const head = {
    appendChild(element) {
      element.parentNode = head
      children.push(element)
    },
    removeChild(element) {
      const index = children.indexOf(element)
      if (index >= 0) {
        children.splice(index, 1)
        element.parentNode = null
      }
    },
    getElementsByTagName(tagName) {
      return children.filter((child) => child.tagName === tagName.toLowerCase())
    },
    get children() {
      return children
    },
  }

  elements.forEach((element) => head.appendChild(element))

  return head
}

const { removeExistingHeadElements } = await loadModule('helmet.utils.js')

beforeEach(() => {
  const description = createElement('meta', { name: 'description', content: 'Default description' })
  const keywords = createElement('meta', { name: 'keywords', content: 'car,rental' })
  const canonical = createElement('link', { rel: 'canonical', href: 'https://plany.tn/' })
  globalThis.document = { head: createHead([description, keywords, canonical]) }
})

afterEach(() => {
  delete globalThis.document
})

test('removes existing meta description before injecting new one', () => {
  removeExistingHeadElements('meta', { name: 'description', content: 'Updated description' })

  const remainingDescriptions = document.head.getElementsByTagName('meta').filter(
    (element) => element.getAttribute('name') === 'description',
  )

  assert.equal(remainingDescriptions.length, 0)
  assert.equal(document.head.children.length, 2)
})

test('keeps unrelated meta tags and removes matching canonical link', () => {
  removeExistingHeadElements('link', { rel: 'canonical', href: 'https://plany.tn/custom' })

  const remainingCanonicals = document.head.getElementsByTagName('link').filter(
    (element) => element.getAttribute('rel') === 'canonical',
  )

  assert.equal(remainingCanonicals.length, 0)
  assert.equal(document.head.children.length, 2)
  assert.equal(document.head.children.filter((element) => element.getAttribute('name') === 'keywords').length, 1)
})
