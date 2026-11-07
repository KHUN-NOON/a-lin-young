import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/lib/db'
import type { AppDB } from '@/lib/db'
import type { InventoryFilter } from '@/lib/schemas/inventoryFilter'

export const DEXIE_PAGE_SIZE = 60
export const LOW_STOCK_LIMIT = 15

/**
 * Offline-first, live-updating paginated inventory read straight from IndexedDB.
 *
 * Pagination is a growing window (`limit(n + 1)`) over the `updatedAt` index rather than
 * accumulated cursor pages. Because the whole window is one live query, inserts, edits and
 * deletes anywhere inside it show up immediately with stable item keys – the virtualizer
 * keeps its measurement cache and scroll offset. The `+1` row tells us if another page exists.
 */
export function useDexieInventory(
  filter: InventoryFilter,
  database: AppDB = db,
  pageSize = DEXIE_PAGE_SIZE,
) {
  const [limit, setLimit] = useState(pageSize)

  // Reset the window when the filter changes (derived-state pattern, no effect).
  const filterKey = `${filter.search}|${filter.lowStockOnly}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setLimit(pageSize)
  }

  const result = useLiveQuery(async () => {
    const needle = filter.search.toLowerCase()
    const rows = await database.inventory
      .orderBy('updatedAt')
      .reverse()
      .filter(
        (item) =>
          (!needle || item.name.toLowerCase().includes(needle)) &&
          (!filter.lowStockOnly || item.quantity < LOW_STOCK_LIMIT),
      )
      .limit(limit + 1)
      .toArray()
    return { limit, rows }
  }, [limit, filter.search, filter.lowStockOnly, database])

  const items = result ? result.rows.slice(0, result.limit) : []
  return {
    items,
    isLoading: result === undefined,
    hasNextPage: result ? result.rows.length > result.limit : false,
    // The previous window stays visible until the larger one resolves.
    isFetchingNextPage: result ? result.limit !== limit : false,
    fetchNextPage: () => setLimit((l) => l + pageSize),
  }
}
