import { useRef } from 'react'
import { DomStats } from './DomStats'
import { InventoryCard, InventoryCardSkeleton } from './InventoryCard'
import { CardList } from '@/components/shared/card-list'
import { useLanguage } from '@/context/LanguageContext'
import type { InventoryItem } from '@/types'

const getInventoryKey = (item: InventoryItem) => item.id
const renderInventoryCard = (item: InventoryItem) => (
  <InventoryCard item={item} />
)
const renderSkeleton = () => <InventoryCardSkeleton />

export interface InventoryCardListProps {
  items: ReadonlyArray<InventoryItem>
  isLoading?: boolean
  error?: unknown
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => unknown
  onRetry?: () => void
}

/** Shared presentation for both data-source examples. */
export function InventoryCardList(props: InventoryCardListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { t } = useLanguage()

  return (
    <div className="space-y-2">
      <div
        ref={scrollRef}
        className="h-[60vh] overflow-auto rounded-md border p-2 sm:p-3"
      >
        <CardList
          {...props}
          getItemKey={getInventoryKey}
          renderCard={renderInventoryCard}
          scrollElementRef={scrollRef}
          virtualized
          estimateSize={88}
          layout={{ base: 'list', md: 'grid' }}
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        >
          <CardList.Loading renderSkeleton={renderSkeleton} />
          <CardList.Empty className="p-6 text-center text-sm text-muted-foreground">
            {t('inventory.noMatchingItems')}
          </CardList.Empty>
          <CardList.Error className="p-4 text-sm text-destructive" />
          <CardList.Container />
          <CardList.Sentinel />
          <CardList.Loading
            when="next"
            renderSkeleton={renderSkeleton}
            className="mt-4"
          />
          <CardList.End className="p-4 text-center text-xs text-muted-foreground">
            {t('inventory.endOfInventory')}
          </CardList.End>
        </CardList>
      </div>
      <DomStats rootRef={scrollRef} totalItems={props.items.length} />
    </div>
  )
}
