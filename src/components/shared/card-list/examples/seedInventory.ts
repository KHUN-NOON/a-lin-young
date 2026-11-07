import { generateInventory } from './generateInventory'
import type { AppDB } from '@/lib/db'

/** Fill IndexedDB with `count` generated rows if it holds fewer. Idempotent. */
export async function seedInventory(
  database: AppDB,
  count: number,
): Promise<void> {
  if ((await database.inventory.count()) >= count) return
  await database.inventory.bulkPut(generateInventory(count))
}
