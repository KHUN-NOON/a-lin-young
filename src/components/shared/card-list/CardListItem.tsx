import { memo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { buildItemAttrs } from '@/hooks/useCardList'
import type { ItemHandlers } from '@/hooks/useCardList'
import type { CardKey, CardListLayout } from '@/types'
import { cn } from '@/utils'

export interface CardListItemProps<TItem> {
  item: TItem
  index: number
  itemKey: CardKey
  setSize: number
  isTabStop: boolean
  isSelected: boolean
  layout: CardListLayout
  handlers: ItemHandlers
  /** Must be referentially stable; reads the latest `renderCard` internally. */
  renderCard: (item: TItem, index: number) => ReactNode
  /** Change this to force memoized items to re-render (e.g. renderCard closes over state). */
  renderKey?: unknown
  className?: string
}

/**
 * Wrapper around a single card. Memoized: it only re-renders when its own item,
 * position or selection/focus state changes – not when `renderCard` changes identity.
 */
function CardListItemInner<TItem>({
  item,
  index,
  itemKey,
  setSize,
  isTabStop,
  isSelected,
  layout,
  handlers,
  renderCard,
  className,
}: CardListItemProps<TItem>) {
  const ref = useCallback(
    (el: HTMLDivElement | null) => handlers.claimPendingFocus(itemKey, el),
    [handlers, itemKey],
  )

  return (
    <div
      {...buildItemAttrs({ index, setSize, isTabStop, isSelected, layout })}
      ref={ref}
      className={cn(className)}
      onFocus={() => handlers.onItemFocus(itemKey)}
      onClick={() => handlers.onItemClick(itemKey)}
    >
      {renderCard(item, index)}
    </div>
  )
}

export const CardListItem = memo(CardListItemInner) as typeof CardListItemInner
