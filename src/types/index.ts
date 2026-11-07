// Global shared types used across the application

export * from './card-list'

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  /** Epoch ms of the last write – used for Last-Write-Wins conflict resolution. */
  updatedAt: number
  category?: string
  note?: string
}
