export const transformScore = (score?: number): number => {
  if (!score || score < 0 || score > 100) {
    return 0
  }

  const transformedScore = (score / 100) * 5
  return Math.round(transformedScore * 10) / 10
}

export const getSupplierInitials = (name?: string): string => {
  if (!name) {
    return ''
  }

  const cleanName = name.trim()
  if (!cleanName) {
    return ''
  }

  const parts = cleanName.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1].charAt(0)
  return `${first}${last}`.toUpperCase()
}
