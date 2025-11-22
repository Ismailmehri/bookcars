import React, { useCallback, useMemo } from 'react'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'

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

const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  overscan,
  className,
  role = 'list',
  ariaLabel,
  itemKey,
  renderItem,
  emptyPlaceholder,
}: VirtualizedListProps<T>) => {
  const itemData = useMemo(() => ({ items, itemKey, renderItem }), [items, itemKey, renderItem])

  const renderRow = useCallback(
    ({ index, style, data }: ListChildComponentProps<typeof itemData>) => {
      const { items: sourceItems, renderItem: render, itemKey: keyBuilder } = data
      const item = sourceItems[index]
      const key = keyBuilder ? keyBuilder(item, index) : index

      return (
        <div key={key} style={style} role="listitem">
          {render(item, index)}
        </div>
      )
    },
    [],
  )

  if (!items.length && emptyPlaceholder) {
    return <div className={className}>{emptyPlaceholder}</div>
  }

  return (
    <FixedSizeList
      className={className}
      height={containerHeight ?? DEFAULT_HEIGHT}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={overscan}
      itemData={itemData}
      role={role}
      aria-label={ariaLabel}
    >
      {renderRow}
    </FixedSizeList>
  )
}

export default React.memo(VirtualizedList)
