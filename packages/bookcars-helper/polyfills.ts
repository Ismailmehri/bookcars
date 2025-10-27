/* eslint-disable no-extend-native */
const resolveGlobalScope = (): Record<string, unknown> => {
  if (typeof globalThis !== 'undefined') {
    return globalThis as unknown as Record<string, unknown>
  }

  if (typeof self !== 'undefined') {
    return self as unknown as Record<string, unknown>
  }

  if (typeof window !== 'undefined') {
    return window as unknown as Record<string, unknown>
  }

  return {}
}

const ensureGlobalThis = (scope: Record<string, unknown>) => {
  if (typeof scope.globalThis === 'undefined') {
    scope.globalThis = scope
  }
}

const applyArrayIncludesPolyfill = () => {
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value<T>(this: Array<T>, searchElement: T, fromIndex?: number): boolean {
        if (this == null) {
          throw new TypeError('Array.prototype.includes called on null or undefined')
        }

        const o = Object(this) as Record<number, T>
        const len = Number(o.length) || 0

        if (len === 0) {
          return false
        }

        const n = Number(fromIndex) || 0
        let k = n >= 0 ? n : len + n

        while (k < len) {
          const currentElement = o[k]

          if (currentElement === searchElement) {
            return true
          }

          k += 1
        }

        return false
      },
    })
  }
}

const applyStringIncludesPolyfill = () => {
  if (!String.prototype.includes) {
    Object.defineProperty(String.prototype, 'includes', {
      value(this: string, searchString: string, position?: number): boolean {
        return this.indexOf(searchString, position) !== -1
      },
    })
  }
}

const applyObjectAssignPolyfill = () => {
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      value<T extends object, U extends object[]>(target: T, ...sources: U): T & U[number] {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }

        const to = Object(target) as Record<string, unknown>

        sources.forEach((source) => {
          if (source != null) {
            const keys = Object.keys(source) as Array<keyof typeof source>
            keys.forEach((key) => {
              to[key as string] = source[key]
            })
          }
        })

        return to as T & U[number]
      },
    })
  }
}

const applyArrayFromPolyfill = () => {
  if (!Array.from) {
    Object.defineProperty(Array, 'from', {
      value<T, U>(arrayLike: ArrayLike<T> | Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: unknown) {
        const items = arrayLike
        const mapping = typeof mapFn === 'function' ? mapFn : undefined
        const result: Array<T | U> = []

        if (items == null) {
          throw new TypeError('Array.from requires an array-like or iterable object')
        }

        let index = 0

        if (typeof (items as Iterable<T>)[Symbol.iterator] === 'function') {
          for (const value of items as Iterable<T>) {
            result.push(mapping ? mapping.call(thisArg, value, index) : value)
            index += 1
          }
        } else {
          const length = Number((items as ArrayLike<T>).length) || 0
          while (index < length) {
            const value = (items as ArrayLike<T>)[index]
            result.push(mapping ? mapping.call(thisArg, value, index) : value)
            index += 1
          }
        }

        return result
      },
    })
  }
}

const applyPromiseFinallyPolyfill = () => {
  if (!Promise.prototype.finally) {
    Object.defineProperty(Promise.prototype, 'finally', {
      value<T>(this: Promise<T>, onFinally?: () => void | Promise<unknown>): Promise<T> {
        const handler = typeof onFinally === 'function' ? onFinally : () => undefined
        const constructor = (this.constructor as PromiseConstructor) || Promise

        return this.then(
          (value) => constructor.resolve(handler()).then(() => value),
          (reason) => constructor.resolve(handler()).then(() => {
            throw reason
          })
        )
      },
    })
  }
}

const applyPromiseAllSettledPolyfill = () => {
  if (!Promise.allSettled) {
    Object.defineProperty(Promise, 'allSettled', {
      value<T>(promises: Iterable<T | Promise<T>>) {
        const wrappedPromises = Array.from(promises, (promise) =>
          Promise.resolve(promise).then(
            (value) => ({ status: 'fulfilled', value }) as PromiseFulfilledResult<T>,
            (reason) => ({ status: 'rejected', reason }) as PromiseRejectedResult
          )
        )

        return Promise.all(wrappedPromises)
      },
    })
  }
}

export const initializeLegacyPolyfills = () => {
  const scope = resolveGlobalScope()
  ensureGlobalThis(scope)
  applyArrayIncludesPolyfill()
  applyStringIncludesPolyfill()
  applyObjectAssignPolyfill()
  applyArrayFromPolyfill()
  applyPromiseFinallyPolyfill()
  applyPromiseAllSettledPolyfill()
}

export default initializeLegacyPolyfills
