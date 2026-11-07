// Dexie entity types. See PROJECT_SPEC.md §6. Money = integer minor units.

export type SyncStatus = 'synced' | 'pending' | 'conflict'
export type Role = 'admin' | 'sale_person'

/** Common fields on every synced entity table. */
export interface SyncedEntity {
  id: string // UUIDv7
  createdAt: number
  updatedAt: number
  deletedAt?: number
  /** Server-assigned revision. */
  version: number
  syncStatus: SyncStatus
}

export interface Category extends SyncedEntity {
  name: string
  parentId?: string
}

export interface Item extends SyncedEntity {
  sku: string
  name: string
  categoryId: string
  barcode?: string
  unit: string
  /** Derived cache; never pushed directly. */
  stockLevel: number
  currentBuyingPrice: number
  currentSellingPrice: number
}

export interface PriceHistory extends SyncedEntity {
  itemId: string
  priceType: 'buying' | 'selling'
  amount: number
  effectiveDate: number
  recordedBy: string
}

export interface StockMovement extends SyncedEntity {
  itemId: string
  delta: number
  reason: 'sale' | 'restock' | 'adjustment' | 'void'
  refId?: string
  recordedBy: string
}

export interface Invoice extends SyncedEntity {
  invoiceNumber: string
  serverInvoiceNumber?: string
  totalAmount: number
  date: number
  createdBy: string
  deviceId: string
  status: 'completed' | 'void'
}

export interface InvoiceItem extends SyncedEntity {
  invoiceId: string
  itemId: string
  quantity: number
  unitPrice: number
  subTotal: number
}

export type ActivityAction = 'create' | 'update' | 'delete' | 'restore' | 'void'

/** Append-only; no updatedAt/deletedAt/version. */
export interface ActivityLog {
  id: string
  userId: string
  userName: string
  deviceId: string
  action: ActivityAction
  entityType: string
  entityId: string
  entityLabel: string
  /** `{field: [old, new]}` */
  changes: Record<string, [unknown, unknown]>
  occurredAt: number
  serverReceivedAt?: number
  syncStatus: SyncStatus
}

export type SyncOperation =
  | 'CREATE_INVOICE'
  | 'UPDATE_ITEM'
  | 'UPDATE_PRICE'
  | 'DELETE_ITEM'
  | (string & {})

export type SyncQueueStatus = 'queued' | 'in_flight' | 'failed' | 'blocked'

export interface SyncQueueEntry {
  sequence?: number // auto-increment
  idempotencyKey: string
  operation: SyncOperation
  entityType: string
  entityId: string
  payload: unknown
  dependsOn?: number[]
  status: SyncQueueStatus
  retryCount: number
  nextRetryAt?: number
  lastError?: string
  createdAt: number
}

export interface ConflictRecord {
  id: string
  entityType: string
  entityId: string
  localVersion: unknown
  serverVersion: unknown
  detectedAt: number
  resolvedAt?: number
  resolution?: 'local' | 'server'
}

export interface Session {
  userId: string
  name: string
  role: Role
  /** Extra permissions granted by Admin, e.g. `activity_log.view`. */
  permissions: string[]
  accessToken: string
  refreshToken: string
  lastOnlineAt: number
  offlineValidUntil: number
}

export interface UserCache {
  id: string
  name: string
  role: Role
}

export interface MetaEntry {
  key: string
  value: unknown
}
