const removeExistingHeadElements = (type: string, props: Record<string, unknown>) => {
  const { head } = document
  const attributeKeys = ['name', 'property', 'rel'] as const
  const matchableAttributes = attributeKeys
    .map((key) => ({ key, value: props[key] }))
    .filter((entry): entry is { key: (typeof attributeKeys)[number]; value: string } => typeof entry.value === 'string')

  if (!head || matchableAttributes.length === 0) {
    return
  }

  const candidates = Array.from(head.getElementsByTagName(type))

  candidates.forEach((element) => {
    const matches = matchableAttributes.every(({ key, value }) => element.getAttribute(key) === value)
    if (matches && element.parentNode === head) {
      head.removeChild(element)
    }
  })
}

export { removeExistingHeadElements }
