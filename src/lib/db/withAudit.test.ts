import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { AppDB } from './index'
import { diffEntities, withAudit } from './withAudit'
import type { Category } from '@/types/db'

const names: string[] = []
const fresh = () => {
  const db = new AppDB(`audit-${Math.random()}`)
  names.push(db.name)
  return db
}
afterEach(async () => {
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)))
})

const actor = { userId: 'u1', userName: 'Aye' }
const cat = (over: Partial<Category> = {}): Category => ({
  id: 'c1',
  name: 'Cables',
  createdAt: 1,
  updatedAt: 1,
  version: 0,
  syncStatus: 'synced',
  ...over,
})

describe('diffEntities', () => {
  it('returns field-level diffs and ignores bookkeeping fields', () => {
    expect(diffEntities(cat(), cat({ name: 'Wires', updatedAt: 9 }))).toEqual({
      name: ['Cables', 'Wires'],
    })
  })
})

describe('withAudit', () => {
  it('writes entity, activity log and queue entry atomically', async () => {
    const db = fresh()
    const after = cat()
    const log = await withAudit(db, {
      actor,
      action: 'create',
      operation: 'CREATE_CATEGORY',
      entityType: 'categories',
      entityId: after.id,
      entityLabel: after.name,
      after,
      table: db.categories,
    })
    expect((await db.categories.get('c1'))?.syncStatus).toBe('pending')
    expect(await db.activity_logs.get(log.id)).toMatchObject({
      userId: 'u1',
      action: 'create',
    })
    const q = await db.sync_queue.toArray()
    expect(q).toHaveLength(1)
    expect(q[0].status).toBe('queued')
    expect(q[0].payload).toMatchObject({ activityLog: { id: log.id } })
    db.close()
  })

  it('rolls back everything if the writer fails', async () => {
    const db = fresh()
    await expect(
      withAudit(db, {
        actor,
        action: 'update',
        operation: 'UPDATE_CATEGORY',
        entityType: 'categories',
        entityId: 'c1',
        entityLabel: 'Cables',
        write: async () => {
          throw new Error('boom')
        },
      }),
    ).rejects.toThrow('boom')
    expect(await db.activity_logs.count()).toBe(0)
    expect(await db.sync_queue.count()).toBe(0)
    db.close()
  })
})
