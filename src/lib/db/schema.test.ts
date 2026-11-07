import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { AppDB, SCHEMA_VERSION } from './index'

const names: string[] = []
const fresh = () => {
  const n = `test-${names.length}-${Math.random()}`
  names.push(n)
  return n
}

afterEach(async () => {
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)))
})

describe('AppDB schema', () => {
  it('creates all spec tables and seeds meta on fresh install', async () => {
    const db = new AppDB(fresh())
    const tables = db.tables.map((t) => t.name)
    for (const t of [
      'categories',
      'items',
      'price_history',
      'stock_movements',
      'invoices',
      'invoice_items',
      'activity_logs',
      'sync_queue',
      'conflicts',
      'session',
      'users_cache',
      'meta',
    ]) {
      expect(tables).toContain(t)
    }
    expect((await db.meta.get('schemaVersion'))?.value).toBe(SCHEMA_VERSION)
    expect(typeof (await db.meta.get('deviceId'))?.value).toBe('string')
    db.close()
  })

  it('preserves legacy inventory rows when upgrading from v2', async () => {
    const name = fresh()
    const old = new Dexie(name)
    old.version(2).stores({ inventory: 'id, name, quantity, unit, updatedAt' })
    await old
      .table('inventory')
      .add({ id: 'a', name: 'Wire', quantity: 3, unit: 'm', updatedAt: 1 })
    old.close()

    const db = new AppDB(name)
    expect(await db.inventory.get('a')).toMatchObject({
      name: 'Wire',
      quantity: 3,
    })
    expect(await db.meta.get('deviceId')).toBeDefined()
    db.close()
  })

  it('enforces unique invoiceNumber and idempotencyKey', async () => {
    const db = new AppDB(fresh())
    const base = {
      createdAt: 1,
      updatedAt: 1,
      version: 0,
      syncStatus: 'pending' as const,
    }
    const inv = {
      ...base,
      invoiceNumber: 'D1-20261107-1',
      totalAmount: 1,
      date: 1,
      createdBy: 'u',
      deviceId: 'd',
      status: 'completed' as const,
    }
    await db.invoices.add({ id: '1', ...inv })
    await expect(db.invoices.add({ id: '2', ...inv })).rejects.toThrow()

    const q = {
      operation: 'UPDATE_ITEM',
      entityType: 'items',
      entityId: 'x',
      payload: {},
      status: 'queued' as const,
      retryCount: 0,
      createdAt: 1,
    }
    await db.sync_queue.add({ idempotencyKey: 'k', ...q })
    await expect(
      db.sync_queue.add({ idempotencyKey: 'k', ...q }),
    ).rejects.toThrow()
    db.close()
  })
})
