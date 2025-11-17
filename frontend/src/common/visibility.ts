export interface LazyRenderDecision {
  hasIntersected: boolean
  idleMs: number
  startedAt: number
  isIntersecting: boolean
  now?: number
}

export const shouldRenderLazyContent = ({
  hasIntersected,
  idleMs,
  startedAt,
  isIntersecting,
  now,
}: LazyRenderDecision): boolean => {
  if (isIntersecting || hasIntersected) {
    return true
  }

  const currentTime = now ?? Date.now()
  return currentTime - startedAt >= idleMs
}
