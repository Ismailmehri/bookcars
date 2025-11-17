export interface VirtualizationConfig {
  threshold?: number
  isMobile?: boolean
  maxDomNodes?: number
}

const DEFAULT_THRESHOLD = 10
const DEFAULT_MAX_DOM_NODES = 24

export const shouldVirtualizeList = (
  length: number,
  { threshold = DEFAULT_THRESHOLD, isMobile = false, maxDomNodes = DEFAULT_MAX_DOM_NODES }: VirtualizationConfig = {},
) => {
  if (length <= 0) {
    return false
  }

  const normalizedThreshold = Math.max(1, threshold)
  const normalizedMaxNodes = Math.max(normalizedThreshold, maxDomNodes)

  if (isMobile) {
    const mobileThreshold = Math.max(1, Math.ceil(normalizedThreshold / 2))
    return length >= mobileThreshold
  }

  if (length < normalizedThreshold) {
    return false
  }

  return length >= normalizedThreshold || length > normalizedMaxNodes
}

export const getVirtualizedItemSize = (isMobile?: boolean) => (isMobile ? 380 : 460)
