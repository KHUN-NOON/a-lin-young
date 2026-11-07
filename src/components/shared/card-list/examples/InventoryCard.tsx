import { LOW_STOCK_THRESHOLD } from './generateInventory'
import { useLanguage } from '@/context/LanguageContext'
import type { InventoryItem } from '@/types'
import { cn } from '@/utils'

/** Sample card. Adapts to `data-layout` on an ancestor (list = horizontal, grid = stacked). */
export function InventoryCard({ item }: { item: InventoryItem }) {
  const { t } = useLanguage()
  const low = item.quantity < LOW_STOCK_THRESHOLD
  return (
    <article
      className={cn(
        'flex h-full flex-col gap-1 rounded-lg border bg-card p-3 text-card-foreground shadow-sm',
        'in-data-[layout=list]:flex-row in-data-[layout=list]:items-center in-data-[layout=list]:justify-between in-data-[layout=list]:gap-4',
      )}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium">{item.name}</h3>
        <p className="text-xs text-muted-foreground">{item.category}</p>
        {item.note && (
          <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
        )}
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          low && 'text-destructive',
        )}
      >
        {item.quantity} {item.unit}
        {low && (
          <span className="ml-1 text-xs font-normal">
            {t('inventory.lowStock')}
          </span>
        )}
      </p>
    </article>
  )
}

export function InventoryCardSkeleton() {
  return <div className="h-20 animate-pulse rounded-lg border bg-muted" />
}
