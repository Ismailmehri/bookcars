export const normalizeSeatsFilter = (value: number) => {
  const allowedValues = [2, 4, 5, 6, 9, -1]

  if (!Number.isFinite(value)) {
    return -1
  }

  if (value >= 9) {
    return 9
  }

  if (value >= 6) {
    return 6
  }

  if (allowedValues.includes(value)) {
    return value
  }

  return -1
}
