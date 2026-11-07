import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { InventoryItem } from '@/types'

/** Live view of the whole inventory table (used by the legacy `InventoryList`). */
export const useInventory = (): InventoryItem[] =>
  useLiveQuery(() => db.inventory.toArray(), []) ?? []
