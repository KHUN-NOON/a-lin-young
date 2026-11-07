import Dexie, { type Table, type Transaction } from 'dexie'
import type { InventoryItem } from '@/types'
import type {
  ActivityLog,
  Category,
  ConflictRecord,
  Invoice,
  InvoiceItem,
  Item,
  MetaEntry,
  PriceHistory,
  Session,
  StockMovement,
  SyncQueueEntry,
  UserCache,
} from '@/types/db'
import { uuidv7 } from '@/utils/uuid'

export const SCHEMA_VERSION = 3

/** Ensures `deviceId` and `schemaVersion` exist in `meta` (PROJECT_SPEC §5.1). */
async function ensureMeta(tx: Transaction) {
  const meta = tx.table<MetaEntry, string>('meta')
  if (!(await meta.get('deviceId'))) {
    await meta.put({ key: 'deviceId', value: uuidv7() })
  }
  await meta.put({ key: 'schemaVersion', value: SCHEMA_VERSION })
}

export class AppDB extends Dexie {
  /** Legacy stub table (v1/v2). Kept so existing rows are never lost; to be migrated into `items`. */
  inventory!: Table<InventoryItem, string>

  categories!: Table<Category, string>
  items!: Table<Item, string>
  price_history!: Table<PriceHistory, string>
  stock_movements!: Table<StockMovement, string>
  invoices!: Table<Invoice, string>
  invoice_items!: Table<InvoiceItem, string>
  activity_logs!: Table<ActivityLog, string>
  sync_queue!: Table<SyncQueueEntry, number>
  conflicts!: Table<ConflictRecord, string>
  session!: Table<Session, string>
  users_cache!: Table<UserCache, string>
  meta!: Table<MetaEntry, string>

  constructor(name = 'aLinYoungDB') {
    super(name)
    // Version 1 schema.
    this.version(1).stores({
      inventory: 'id, name, quantity, unit, updatedAt',
    })
    // Version 2: `updatedAt` becomes a required field on every row. The index
    // set is unchanged; the upgrade backfills rows written by v1 so no local
    // data is lost or left un-sortable.
    this.version(2)
      .stores({
        inventory: 'id, name, quantity, unit, updatedAt',
      })
      .upgrade((tx) =>
        tx
          .table('inventory')
          .toCollection()
          .modify((item: Partial<InventoryItem>) => {
            if (typeof item.updatedAt !== 'number') item.updatedAt = Date.now()
          }),
      )
    // Version 3: full offline-sync schema (PROJECT_SPEC §6). Purely additive:
    // `inventory` is untouched, so no local data can be lost. No existing
    // sync_queue/session rows can exist before this version.
    this.version(3)
      .stores({
        inventory: 'id, name, quantity, unit, updatedAt',
        categories: 'id, name, syncStatus',
        items: 'id, sku, name, categoryId, updatedAt, syncStatus',
        price_history: 'id, itemId, [itemId+priceType], syncStatus',
        stock_movements: 'id, itemId, refId, syncStatus',
        invoices: 'id, &invoiceNumber, date, createdBy, syncStatus',
        invoice_items: 'id, invoiceId, itemId',
        activity_logs: 'id, entityId, userId, occurredAt, syncStatus',
        sync_queue: '++sequence, &idempotencyKey, status, entityId',
        conflicts: 'id, entityId, resolvedAt',
        session: 'userId',
        users_cache: 'id',
        meta: 'key',
      })
      .upgrade((tx) => ensureMeta(tx))

    // Fresh installs skip upgrade(), so seed meta here.
    this.on('populate', (tx) => ensureMeta(tx))
  }
}

// Export a singleton instance used throughout the app.
export const db = new AppDB()

// Helper to add/replace an inventory item – useful for tests or future UI.
export const upsertItem = async (item: InventoryItem) => {
  await db.inventory.put(item)
}
