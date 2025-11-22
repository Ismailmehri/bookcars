import React, { UIEvent, forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'

export interface ListChildComponentProps<T> {
  index: number
  style: React.CSSProperties
  data: T
  isScrolling?: boolean
}

interface FixedSizeListProps<T> {
  height: number
  itemCount: number
  itemSize: number
  width: number | string
  className?: string
  itemData: T
  overscanCount?: number
  role?: string
  'aria-label'?: string
  onScroll?: (payload: { scrollOffset: number }) => void
  children: (props: ListChildComponentProps<T>) => React.ReactNode
}

const DEFAULT_OVERSCAN = 4

const mergeRefs = <T,>(...refs: (React.Ref<T> | undefined)[]) => (value: T) => {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(value)
    } else if (ref && typeof ref === 'object') {
      // eslint-disable-next-line no-param-reassign
      (ref as React.MutableRefObject<T>).current = value
    }
  })
}

const FixedSizeList = forwardRef<HTMLDivElement, FixedSizeListProps<unknown>>(({
  height,
  itemCount,
  itemSize,
  width,
  className,
  itemData,
  overscanCount = DEFAULT_OVERSCAN,
  role,
  'aria-label': ariaLabel,
  onScroll,
  children,
}, forwardedRef) => {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  useImperativeHandle(forwardedRef, () => outerRef.current as HTMLDivElement, [])

  const totalHeight = useMemo(() => itemCount * itemSize, [itemCount, itemSize])

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollOffset / itemSize) - overscanCount)
    const endIndex = Math.min(itemCount, Math.ceil((scrollOffset + height) / itemSize) + overscanCount)

    return { startIndex, endIndex }
  }, [scrollOffset, itemSize, height, overscanCount, itemCount])

  const renderedItems = useMemo(() => {
    const items: React.ReactNode[] = []
    const { startIndex, endIndex } = visibleRange

    for (let index = startIndex; index < endIndex; index += 1) {
      const style: React.CSSProperties = {
        position: 'absolute',
        top: index * itemSize,
        left: 0,
        right: 0,
        height: itemSize,
      }

      items.push(children({ index, style, data: itemData }))
    }

    return items
  }, [visibleRange, itemSize, children, itemData])

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const offset = event.currentTarget.scrollTop
      setScrollOffset(offset)
      onScroll?.({ scrollOffset: offset })
    },
    [onScroll],
  )

  return (
    <div
      ref={mergeRefs(forwardedRef, outerRef)}
      className={className}
      onScroll={handleScroll}
      role={role}
      aria-label={ariaLabel}
      style={{ height, width, overflowY: 'auto', position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>{renderedItems}</div>
    </div>
  )
})

export { FixedSizeList }
export type { FixedSizeListProps }
