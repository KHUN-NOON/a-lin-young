import { useCallback, useEffect, useState } from 'react'
import { InventoryCardList } from './InventoryCardList'
import { InventoryFilterForm } from './InventoryFilterForm'
import { seedInventory } from './seedInventory'
import { db } from '@/lib/db'
import type { AppDB } from '@/lib/db'
import { defaultInventoryFilter } from '@/lib/schemas/inventoryFilter'
import type { InventoryFilter } from '@/lib/schemas/inventoryFilter'
import { useDexieInventory } from '@/hooks/useDexieInventory'
import { useLanguage } from '@/context/LanguageContext'

/** Offline-first example: live, paginated reads from IndexedDB (no network involved). */
export function DexieInventoryExample({
  count = 10_000,
  database = db,
}: {
  count?: number
  database?: AppDB
}) {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<InventoryFilter>(defaultInventoryFilter)
  const [seeding, setSeeding] = useState(true)
  const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useDexieInventory(filter, database)

  useEffect(() => {
    let cancelled = false
    void seedInventory(database, count).then(() => {
      if (!cancelled) setSeeding(false)
    })
    return () => {
      cancelled = true
    }
  }, [database, count])

  const editFirst = useCallback(async () => {
    const first = await database.inventory.orderBy('updatedAt').reverse().first()
    // Edit without touching `updatedAt`: the row keeps its position and scroll is untouched.
    if (first) await database.inventory.update(first.id, { quantity: first.quantity + 1 })
  }, [database])

  const addItem = useCallback(async () => {
    const now = Date.now()
    await database.inventory.put({
      id: `new-${now}`,
      name: `New item ${new Date(now).toLocaleTimeString()}`,
      quantity: 5,
      unit: 'pcs',
      category: 'Wiring',
      updatedAt: now,
    })
  }, [database])

  const deleteFirst = useCallback(async () => {
    const first = await database.inventory.orderBy('updatedAt').reverse().first()
    if (first) await database.inventory.delete(first.id)
  }, [database])

  return (
    <div className="space-y-3">
      <InventoryFilterForm onChange={setFilter} />
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" className="rounded-md border px-3 py-1" onClick={addItem}>
          {t('demo.addItem')}
        </button>
        <button type="button" className="rounded-md border px-3 py-1" onClick={editFirst}>
          {t('demo.editFirst')}
        </button>
        <button type="button" className="rounded-md border px-3 py-1" onClick={deleteFirst}>
          {t('demo.deleteFirst')}
        </button>
      </div>
      <InventoryCardList
        items={items}
        isLoading={seeding || isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
