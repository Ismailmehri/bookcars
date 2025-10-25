export const buildProjectionFromFields = (fields: string[]): Record<string, 0> => {
  if (fields.length === 0) {
    return {}
  }

  return fields.reduce<Record<string, 0>>((acc, field) => {
    if (typeof field === 'string' && field.trim().length > 0) {
      acc[field] = 0
    }
    return acc
  }, {})
}

export default buildProjectionFromFields
