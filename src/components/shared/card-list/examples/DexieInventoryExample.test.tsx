import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DexieInventoryExample } from './DexieInventoryExample'
import { generateInventory } from './generateInventory'
import { AppDB } from '@/lib/db'
import { setViewportWidth } from '@/test/setup'

let database: AppDB
let n = 0

beforeEach(async () => {
  setViewportWidth(500)
  database = new AppDB(`test-db-${n++}`)
  await database.inventory.bulkPut(generateInventory(300, 1))
})

describe('DexieInventoryExample', () => {
  it('reads from IndexedDB and renders only a window of items', async () => {
    render(<DexieInventoryExample count={300} database={database} />)
    await waitFor(() =>
      expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0),
    )
    // Offset pagination loads a 60-row window first; far fewer are in the DOM.
    expect(screen.getAllByRole('listitem').length).toBeLessThan(60)
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'aria-posinset',
      '1',
    )
  })

  it('applies live insert / edit / delete without remounting rendered cards', async () => {
    render(<DexieInventoryExample count={300} database={database} />)
    await waitFor(() =>
      expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0),
    )

    const second = screen.getAllByRole('listitem')[1]
    const secondName = second.textContent

    // Edit row 0 in place (updatedAt untouched): rows keep position and DOM nodes.
    const first = await database.inventory
      .orderBy('updatedAt')
      .reverse()
      .first()
    await act(async () => {
      await database.inventory.update(first!.id, { quantity: 777 })
    })
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('777'),
    )
    expect(screen.getAllByRole('listitem')[1]).toBe(second)
    expect(second.textContent).toBe(secondName)

    // Delete row 0: the list shrinks live.
    await act(async () => {
      await database.inventory.delete(first!.id)
    })
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).not.toHaveTextContent(
        first!.name,
      ),
    )

    // Insert a new newest row: it appears first.
    await act(async () => {
      await database.inventory.put({
        id: 'fresh',
        name: 'Fresh item',
        quantity: 1,
        unit: 'pcs',
        updatedAt: Date.now() + 10_000,
      })
    })
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
        'Fresh item',
      ),
    )
  })
})

describe('Dexie v2 migration', () => {
  it('backfills updatedAt for rows written by schema v1', async () => {
    const name = `migrate-${n++}`
    const { default: Dexie } = await import('dexie')
    const v1 = new Dexie(name)
    v1.version(1).stores({ inventory: 'id, name, quantity, unit, updatedAt' })
    await v1
      .table('inventory')
      .put({ id: 'a', name: 'Old', quantity: 1, unit: 'pcs' })
    v1.close()

    const upgraded = new AppDB(name)
    const row = await upgraded.inventory.get('a')
    expect(typeof row?.updatedAt).toBe('number')
    expect(row?.name).toBe('Old')
  })
})
