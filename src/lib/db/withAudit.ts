import type { Table } from 'dexie'
import type { AppDB } from './index'
import type {
  ActivityAction,
  ActivityLog,
  SyncOperation,
  SyncQueueEntry,
  SyncedEntity,
} from '@/types/db'
import { uuidv7 } from '@/utils/uuid'

/** Bookkeeping fields excluded from activity-log diffs. */
const IGNORED_FIELDS = new Set(['updatedAt', 'syncStatus', 'version', 'createdAt'])

/** Never written to the log (PROJECT_SPEC §5.10). */
const SECRET_FIELDS = new Set(['accessToken', 'refreshToken', 'password', 'token'])

export function diffEntities(
  before: object | undefined,
  after: object | undefined,
): ActivityLog['changes'] {
  const b = (before ?? {}) as Record<string, unknown>
  const a = (after ?? {}) as Record<string, unknown>
  const changes: ActivityLog['changes'] = {}
  for (const key of new Set([...Object.keys(b), ...Object.keys(a)])) {
    if (IGNORED_FIELDS.has(key) || SECRET_FIELDS.has(key)) continue
    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) changes[key] = [b[key], a[key]]
  }
  return changes
}

export interface AuditActor {
  userId: string
  userName: string
}

export interface AuditParams<T extends SyncedEntity> {
  actor: AuditActor
  action: ActivityAction
  operation: SyncOperation
  entityType: string
  entityId: string
  /** Human-readable snapshot (e.g. item name); never a translated UI string. */
  entityLabel: string
  before?: object
  after?: object
  /** Default writer target: `after` is stamped `pending` and put here. */
  table?: Table<T, string>
  /** Custom writer for multi-entity atomic mutations (e.g. CREATE_INVOICE). Runs inside the transaction. */
  write?: () => Promise<void>
  /** Data sent to the server for this operation. Defaults to `after`. */
  payload?: unknown
  dependsOn?: number[]
}

/**
 * The only sanctioned way to write entities (PROJECT_SPEC §5.10). In ONE Dexie
 * transaction it writes the entity, the `activity_logs` row and the
 * `sync_queue` entry (which carries the log). Never touches the network.
 */
export async function withAudit<T extends SyncedEntity>(
  db: AppDB,
  params: AuditParams<T>,
): Promise<ActivityLog> {
  return db.transaction('rw', db.tables, async () => {
    const now = Date.now()

    if (params.write) {
      await params.write()
    } else if (params.table && params.after) {
      await params.table.put({
        ...(params.after as T),
        updatedAt: now,
        syncStatus: 'pending',
      })
    }

    const deviceId = String((await db.meta.get('deviceId'))?.value ?? '')
    const log: ActivityLog = {
      id: uuidv7(now),
      userId: params.actor.userId,
      userName: params.actor.userName,
      deviceId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityLabel: params.entityLabel,
      changes: diffEntities(params.before, params.after),
      occurredAt: now,
      syncStatus: 'pending',
    }
    await db.activity_logs.add(log)

    const entry: SyncQueueEntry = {
      idempotencyKey: uuidv7(now),
      operation: params.operation,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: { data: params.payload ?? params.after, activityLog: log },
      dependsOn: params.dependsOn,
      status: 'queued',
      retryCount: 0,
      createdAt: now,
    }
    await db.sync_queue.add(entry)
    return log
  })
}

