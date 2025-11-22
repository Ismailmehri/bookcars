import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  overscan?: number
  className?: string
  role?: string
  ariaLabel?: string
  itemKey?: (item: T, index: number) => React.Key
  renderItem: (item: T, index: number) => React.ReactNode
  emptyPlaceholder?: React.ReactNode
}

const DEFAULT_HEIGHT = 840
const DEFAULT_OVERSCAN = 4

const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  overscan = DEFAULT_OVERSCAN,
  className,
  role = 'list',
  ariaLabel,
  itemKey,
  renderItem,
  emptyPlaceholder,
}: VirtualizedListProps<T>) => {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [viewportHeight, setViewportHeight] = useState(containerHeight ?? DEFAULT_HEIGHT)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (containerHeight) {
      return undefined
    }

    const updateHeight = () => {
      if (shellRef.current) {
        setViewportHeight(shellRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => window.removeEventListener('resize', updateHeight)
  }, [containerHeight])

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight])

  const { start, end } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan)

    return { start: startIndex, end: endIndex }
  }, [scrollTop, viewportHeight, itemHeight, overscan, items.length])

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  const children = useMemo(
    () =>
      items.slice(start, end).map((item, visibleIndex) => {
        const absoluteIndex = start + visibleIndex
        const key = itemKey ? itemKey(item, absoluteIndex) : absoluteIndex

        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: absoluteIndex * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, absoluteIndex)}
          </div>
        )
      }),
    [items, start, end, itemHeight, itemKey, renderItem],
  )

  if (!items.length && emptyPlaceholder) {
    return <div className={className}>{emptyPlaceholder}</div>
  }

  return (
    <div
      ref={shellRef}
      className={className}
      style={{ position: 'relative', overflowY: 'auto', height: containerHeight ?? DEFAULT_HEIGHT }}
      role={role}
      aria-label={ariaLabel}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>{children}</div>
    </div>
  )
}

export default React.memo(VirtualizedList)
