import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { CardListContext } from './CardListContext'
import type { CardListContextValue } from './CardListContext'
import { CardListContainer } from './CardListContainer'
import { CardListItem } from './CardListItem'
import {
  CardListEmpty,
  CardListEnd,
  CardListError,
  CardListLoadMore,
  CardListLoading,
  CardListSentinel,
} from './CardListStates'
import { useCardList } from '@/hooks/useCardList'
import type { CardKey, UseCardListOptions } from '@/types'

export interface CardListProps<TItem> extends UseCardListOptions<TItem> {
  /** The only place card UI is created. Identity changes do not re-render unchanged items. */
  renderCard: (item: TItem, index: number) => ReactNode
  /** Bust the item memo when `renderCard` closes over state that is not part of `items`. */
  renderKey?: unknown
  children?: ReactNode
}

/** Root: owns state through `useCardList` and shares it via context. No card UI. */
function CardListRoot<TItem>({
  renderCard,
  renderKey,
  children,
  ...options
}: CardListProps<TItem>) {
  const list = useCardList(options)

  // Stable wrappers read the latest props, so memoized items survive identity changes.
  const renderCardRef = useRef(renderCard)
  const getItemKeyRef = useRef(options.getItemKey)
  useEffect(() => {
    renderCardRef.current = renderCard
    getItemKeyRef.current = options.getItemKey
  })
  const stableRenderCard = useCallback(
    (item: unknown, index: number) => renderCardRef.current(item as TItem, index),
    [],
  )
  const stableGetItemKey = useCallback(
    (item: unknown): CardKey => getItemKeyRef.current(item as TItem),
    [],
  )

  const value: CardListContextValue = {
    list: list as unknown as CardListContextValue['list'],
    renderCard: stableRenderCard,
    getItemKey: stableGetItemKey,
    renderKey,
  }

  return (
    <CardListContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {list.liveMessage}
      </div>
    </CardListContext.Provider>
  )
}

export const CardList = Object.assign(CardListRoot, {
  Container: CardListContainer,
  Item: CardListItem,
  Empty: CardListEmpty,
  Loading: CardListLoading,
  Error: CardListError,
  Sentinel: CardListSentinel,
  LoadMore: CardListLoadMore,
  End: CardListEnd,
})
