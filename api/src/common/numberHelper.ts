export const parsePositiveInt = (value: unknown, defaultValue: number): number => {
  if (typeof defaultValue !== 'number' || Number.isNaN(defaultValue) || defaultValue < 1) {
    throw new Error('defaultValue must be a positive integer')
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value) || value < 1) {
      return defaultValue
    }
    return Math.floor(value)
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed < 1) {
      return defaultValue
    }
    return parsed
  }

  return defaultValue
}

export default {
  parsePositiveInt,
}
