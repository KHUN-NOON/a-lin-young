import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { generateInventory } from './generateInventory'
import { InventoryCardList } from './InventoryCardList'
import { InventoryFilterForm } from './InventoryFilterForm'
import { defaultInventoryFilter } from '@/lib/schemas/inventoryFilter'
import type { InventoryFilter } from '@/lib/schemas/inventoryFilter'
import { useInventoryInfiniteQuery } from '@/lib/api/inventory'

function QueryInventoryInner({
  count,
  latencyMs,
}: {
  count: number
  latencyMs?: number
}) {
  const [filter, setFilter] = useState<InventoryFilter>(defaultInventoryFilter)
  const dataset = useMemo(() => generateInventory(count), [count])
  const query = useInventoryInfiniteQuery(() => dataset, filter, latencyMs)
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )

  return (
    <div className="space-y-3">
      <InventoryFilterForm onChange={setFilter} />
      <InventoryCardList
        items={items}
        isLoading={query.isPending}
        error={query.error}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        onRetry={() => void query.refetch()}
      />
    </div>
  )
}

/**
 * TanStack Query example (`useInfiniteQuery`). Reads an in-memory dataset with simulated
 * latency; replace the source with a `fetch` wrapper for a real API. Creates its own
 * QueryClient unless one is supplied.
 */
export function QueryInventoryExample({
  count = 10_000,
  latencyMs,
  client,
}: {
  count?: number
  latencyMs?: number
  client?: QueryClient
}) {
  const [ownClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  )
  return (
    <QueryClientProvider client={client ?? ownClient}>
      <QueryInventoryInner count={count} latencyMs={latencyMs} />
    </QueryClientProvider>
  )
}
