import { memo } from 'react'
import type { ReactNode } from 'react'
import { CardListItem } from './CardListItem'
import type { ItemHandlers } from '@/hooks/useCardList'
import type { CardKey, CardListLayout } from '@/types'
import { cn } from '@/utils'

export interface RowSharedProps<TItem> {
  getItemKey: (item: TItem) => CardKey
  renderCard: (item: TItem, index: number) => ReactNode
  renderKey?: unknown
  setSize: number
  /** Key of the roving tab stop, or null when the container holds it. */
  tabStopKey: CardKey | null
  selectedKeys: ReadonlySet<CardKey>
  layout: CardListLayout
  handlers: ItemHandlers
  itemClassName?: string
}

interface CardListRowProps<TItem> {
  rowIndex: number
  /** translateY offset (px) relative to the container. */
  start: number
  columns: number
  items: ReadonlyArray<TItem>
  className?: string
  measureRow: (node: Element | null) => void
  shared: RowSharedProps<TItem>
}

/** One virtual row: a grid/flex line of `columns` items, positioned with transform. */
function CardListRowInner<TItem>({
  rowIndex,
  start,
  columns,
  items,
  className,
  measureRow,
  shared,
}: CardListRowProps<TItem>) {
  const first = rowIndex * columns
  const rowItems = items.slice(first, first + columns)

  return (
    <div
      ref={measureRow}
      data-index={rowIndex}
      role="presentation"
      className={cn(className)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${start}px)`,
      }}
    >
      {rowItems.map((item, i) => {
        const key = shared.getItemKey(item)
        return (
          <CardListItem
            key={key}
            item={item}
            index={first + i}
            itemKey={key}
            setSize={shared.setSize}
            isTabStop={key === shared.tabStopKey}
            isSelected={shared.selectedKeys.has(key)}
            layout={shared.layout}
            handlers={shared.handlers}
            renderCard={shared.renderCard}
            renderKey={shared.renderKey}
            className={shared.itemClassName}
          />
        )
      })}
    </div>
  )
}

export const CardListRow = memo(CardListRowInner) as typeof CardListRowInner
