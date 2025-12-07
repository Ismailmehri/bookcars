export interface DeferredLoaderConfig {
  target: Element | null
  onIntersect: () => void
  onTimeout: () => void
  rootMargin?: string
  timeoutMs?: number
}

export interface DeferredLoaderResult {
  observer: IntersectionObserver | null
  fallbackTimer: number | undefined
}

export const isIntersectionObserverAvailable = () =>
  typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'undefined'

export const shouldLoadMapImmediately = () => true

export const createDeferredLoader = ({
  target,
  onIntersect,
  onTimeout,
  rootMargin = '240px',
  timeoutMs = 1400,
}: DeferredLoaderConfig): DeferredLoaderResult => {
  const fallbackTimer = window.setTimeout(() => {
    onTimeout()
  }, timeoutMs)

  if (!isIntersectionObserverAvailable() || !target) {
    return { observer: null, fallbackTimer }
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)

      if (isVisible) {
        window.clearTimeout(fallbackTimer)
        onIntersect()
        observer.disconnect()
      }
    },
    { root: null, rootMargin, threshold: 0.05 }
  )

  observer.observe(target)

  return { observer, fallbackTimer }
}
