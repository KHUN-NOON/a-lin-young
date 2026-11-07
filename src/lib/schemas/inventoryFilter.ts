import { z } from 'zod'

export const inventoryFilterSchema = z.object({
  search: z.string().trim().max(60, 'inventory.filter.searchMax'),
  lowStockOnly: z.boolean(),
})

export type InventoryFilter = z.infer<typeof inventoryFilterSchema>

export const defaultInventoryFilter: InventoryFilter = {
  search: '',
  lowStockOnly: false,
}
