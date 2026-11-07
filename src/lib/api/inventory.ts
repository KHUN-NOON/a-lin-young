import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import type { InventoryFilter } from '@/lib/schemas/inventoryFilter'
import type { InventoryItem } from '@/types'

export const QUERY_PAGE_SIZE = 60

export interface InventoryPage {
  items: Array<InventoryItem>
  nextOffset: number | null
}

/** Source of rows – swap for a real `fetch` wrapper when a server exists. */
export type InventorySource = () => ReadonlyArray<InventoryItem>

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filter: InventoryFilter) => ['inventory', 'list', filter] as const,
}

export async function fetchInventoryPage(
  source: InventorySource,
  filter: InventoryFilter,
  offset: number,
  pageSize = QUERY_PAGE_SIZE,
  latencyMs = 150,
): Promise<InventoryPage> {
  await new Promise((resolve) => setTimeout(resolve, latencyMs))
  const needle = filter.search.toLowerCase()
  const matches = source().filter(
    (item) =>
      (!needle || item.name.toLowerCase().includes(needle)) &&
      (!filter.lowStockOnly || item.quantity < 15),
  )
  const items = matches.slice(offset, offset + pageSize)
  const next = offset + pageSize
  return { items, nextOffset: next < matches.length ? next : null }
}

export const inventoryInfiniteOptions = (
  source: InventorySource,
  filter: InventoryFilter,
  latencyMs?: number,
) =>
  infiniteQueryOptions({
    queryKey: inventoryKeys.list(filter),
    queryFn: ({ pageParam }) =>
      fetchInventoryPage(source, filter, pageParam, QUERY_PAGE_SIZE, latencyMs),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
  })

export function useInventoryInfiniteQuery(
  source: InventorySource,
  filter: InventoryFilter,
  latencyMs?: number,
) {
  return useInfiniteQuery(inventoryInfiniteOptions(source, filter, latencyMs))
}
