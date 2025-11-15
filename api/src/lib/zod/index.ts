/* eslint-disable max-classes-per-file, lines-between-class-members, class-methods-use-this, no-use-before-define */

export type ZodPath = Array<string | number>

export type ZodIssue = {
  path: ZodPath
  message: string
}

export class ZodError extends Error {
  issues: ZodIssue[]

  constructor(issues: ZodIssue[]) {
    super(issues[0]?.message || 'Invalid input')
    this.issues = issues
  }
}

export interface Schema<T> {
  parse: (input: unknown, path?: ZodPath) => T
  optional: () => Schema<T | undefined>
}

abstract class BaseSchema<T> implements Schema<T> {
  optional(): Schema<T | undefined> {
    return new OptionalSchema(this)
  }

  abstract parse(input: unknown, path?: ZodPath): T
}

class OptionalSchema<T> extends BaseSchema<T | undefined> {
  private readonly inner: Schema<T>

  constructor(inner: Schema<T>) {
    super()
    this.inner = inner
  }

  parse(input: unknown, path: ZodPath = []): T | undefined {
    if (typeof input === 'undefined') {
      return undefined
    }
    return this.inner.parse(input, path)
  }
}

class StringSchema extends BaseSchema<string> {
  private shouldTrim = false
  private minLength?: number
  private minMessage?: string
  private maxLength?: number
  private maxMessage?: string
  private emailCheck = false
  private emailMessage?: string
  private urlCheck = false
  private urlMessage?: string
  private regexChecks: Array<{ pattern: RegExp; message?: string }> = []

  trim(): this {
    this.shouldTrim = true
    return this
  }

  min(length: number, message?: string): this {
    this.minLength = length
    this.minMessage = message
    return this
  }

  max(length: number, message?: string): this {
    this.maxLength = length
    this.maxMessage = message
    return this
  }

  nonempty(message?: string): this {
    return this.min(1, message)
  }

  email(message?: string): this {
    this.emailCheck = true
    this.emailMessage = message
    return this
  }

  url(message?: string): this {
    this.urlCheck = true
    this.urlMessage = message
    return this
  }

  regex(pattern: RegExp, message?: string): this {
    this.regexChecks.push({ pattern, message })
    return this
  }

  parse(input: unknown, path: ZodPath = []): string {
    if (typeof input !== 'string') {
      throw new ZodError([{ path, message: 'Expected string' }])
    }
    let value = input
    if (this.shouldTrim) {
      value = value.trim()
    }
    if (typeof this.minLength === 'number' && value.length < this.minLength) {
      throw new ZodError([{ path, message: this.minMessage || `Expected minimum length ${this.minLength}` }])
    }
    if (typeof this.maxLength === 'number' && value.length > this.maxLength) {
      throw new ZodError([{ path, message: this.maxMessage || `Expected maximum length ${this.maxLength}` }])
    }
    if (this.emailCheck) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        throw new ZodError([{ path, message: this.emailMessage || 'Invalid email address' }])
      }
    }
    if (this.urlCheck) {
      try {
        // eslint-disable-next-line no-new
        new URL(value)
      } catch {
        throw new ZodError([{ path, message: this.urlMessage || 'Invalid url' }])
      }
    }
    for (const check of this.regexChecks) {
      if (!check.pattern.test(value)) {
        throw new ZodError([{ path, message: check.message || 'Invalid format' }])
      }
    }
    return value
  }
}

class NumberSchema extends BaseSchema<number> {
  private mustBeInt = false
  private intMessage?: string
  private minValue?: number
  private minMessage?: string
  private maxValue?: number
  private maxMessage?: string
  private strictPositive = false
  private positiveMessage?: string

  int(message?: string): this {
    this.mustBeInt = true
    this.intMessage = message
    return this
  }

  min(value: number, message?: string): this {
    this.minValue = value
    this.minMessage = message
    return this
  }

  max(value: number, message?: string): this {
    this.maxValue = value
    this.maxMessage = message
    return this
  }

  positive(message?: string): this {
    this.strictPositive = true
    this.positiveMessage = message || 'Expected positive number'
    return this
  }

  parse(input: unknown, path: ZodPath = []): number {
    if (typeof input !== 'number' || Number.isNaN(input)) {
      throw new ZodError([{ path, message: 'Expected number' }])
    }
    if (this.mustBeInt && !Number.isInteger(input)) {
      throw new ZodError([{ path, message: this.intMessage || 'Expected integer' }])
    }
    if (typeof this.minValue === 'number' && input < this.minValue) {
      throw new ZodError([{ path, message: this.minMessage || `Expected number >= ${this.minValue}` }])
    }
    if (typeof this.maxValue === 'number' && input > this.maxValue) {
      throw new ZodError([{ path, message: this.maxMessage || `Expected number <= ${this.maxValue}` }])
    }
    if (this.strictPositive && input <= 0) {
      throw new ZodError([{ path, message: this.positiveMessage || 'Expected positive number' }])
    }
    return input
  }
}

class ArraySchema<T> extends BaseSchema<T[]> {
  private readonly element: Schema<T>
  private minLength?: number
  private minMessage?: string

  constructor(element: Schema<T>) {
    super()
    this.element = element
  }

  min(length: number, message?: string): this {
    this.minLength = length
    this.minMessage = message
    return this
  }

  parse(input: unknown, path: ZodPath = []): T[] {
    if (!Array.isArray(input)) {
      throw new ZodError([{ path, message: 'Expected array' }])
    }
    if (typeof this.minLength === 'number' && input.length < this.minLength) {
      throw new ZodError([{ path, message: this.minMessage || `Expected at least ${this.minLength} items` }])
    }
    return input.map((item, index) => this.element.parse(item, [...path, index]))
  }
}

class EnumSchema<Values extends readonly [string, ...string[]]> extends BaseSchema<Values[number]> {
  private readonly values: Values

  constructor(values: Values) {
    super()
    this.values = values
  }

  parse(input: unknown, path: ZodPath = []): Values[number] {
    if (typeof input !== 'string') {
      throw new ZodError([{ path, message: 'Expected string' }])
    }
    if (!this.values.includes(input as Values[number])) {
      throw new ZodError([{ path, message: `Expected one of: ${this.values.join(', ')}` }])
    }
    return input as Values[number]
  }
}

type InferField<TSchema extends Schema<any>> = TSchema extends Schema<infer Output> ? Output : never

type OptionalKeys<Shape extends Record<string, Schema<any>>> = {
  [Key in keyof Shape]-?: undefined extends InferField<Shape[Key]> ? Key : never
}[keyof Shape]

type RequiredKeys<Shape extends Record<string, Schema<any>>> = Exclude<keyof Shape, OptionalKeys<Shape>>

type InferShape<Shape extends Record<string, Schema<any>>> = {
  [Key in RequiredKeys<Shape>]: InferField<Shape[Key]>
} & {
  [Key in OptionalKeys<Shape>]?: InferField<Shape[Key]>
}

class ObjectSchema<Shape extends Record<string, Schema<any>>> extends BaseSchema<InferShape<Shape>> {
  private readonly shape: Shape

  constructor(shape: Shape) {
    super()
    this.shape = shape
  }

  parse(input: unknown, path: ZodPath = []): InferShape<Shape> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new ZodError([{ path, message: 'Expected object' }])
    }
    const result: Partial<InferShape<Shape>> = {}
    const typedResult = result as { [Key in keyof Shape]?: InferField<Shape[Key]> }
    for (const key of Object.keys(this.shape) as Array<keyof Shape>) {
      const schema = this.shape[key]
      const value = (input as Record<string, unknown>)[String(key)]
      typedResult[key] = schema.parse(value, [...path, String(key)]) as InferField<Shape[typeof key]>
    }
    return result as InferShape<Shape>
  }
}

class UnknownSchema extends BaseSchema<unknown> {
  parse(input: unknown): unknown {
    return input
  }
}

export type Infer<TSchema extends Schema<unknown>> = TSchema extends Schema<infer Output> ? Output : never

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  array: <T>(schema: Schema<T>) => new ArraySchema(schema),
  enum: <Values extends readonly [string, ...string[]]>(values: Values) => new EnumSchema(values),
  object: <Shape extends Record<string, Schema<any>>>(shape: Shape) => new ObjectSchema(shape),
  unknown: () => new UnknownSchema(),
}

export type { Schema as ZodSchema }
