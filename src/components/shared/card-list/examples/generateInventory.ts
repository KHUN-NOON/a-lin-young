import type { InventoryItem } from '@/types'

export const LOW_STOCK_THRESHOLD = 15

const NAMES = [
  'Copper wire 2.5mm',
  'MCB breaker 16A',
  'LED bulb 9W',
  'Two-way switch',
  'Wall socket 13A',
  'PVC conduit 20mm',
  'Cable tie 200mm',
  'Ceramic fuse 10A',
  'Relay 24V',
  'Junction box',
  'Extension reel 20m',
  'Isolator 32A',
  'Dimmer switch',
  'Ceiling rose',
  'Earth rod',
  'Insulation tape',
]
const UNITS = ['pcs', 'm', 'box', 'roll']
const CATEGORIES = ['Wiring', 'Protection', 'Lighting', 'Fittings']
const NOTES = [
  undefined,
  undefined,
  'Supplier lead time: 3 days.',
  'Fragile – store upright. Reorder when stock falls below the minimum level agreed with the supplier, and check the batch number on delivery.',
]

// Small deterministic PRNG so demos/benchmarks/tests are reproducible.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Newest first: item `i` has `updatedAt = now - i * 1000`. */
export function generateInventory(
  count: number,
  seed = 42,
  now = Date.now(),
): Array<InventoryItem> {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[Math.floor(rand() * NAMES.length)]
    return {
      id: `item-${String(i).padStart(6, '0')}`,
      name: `${name} #${i}`,
      quantity: Math.floor(rand() * 200),
      unit: UNITS[Math.floor(rand() * UNITS.length)],
      category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
      note: NOTES[Math.floor(rand() * NOTES.length)],
      updatedAt: now - i * 1000,
    }
  })
}
