import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { UseCardListReturn } from '@/hooks/useCardList'
import type { CardKey } from '@/types'

export interface CardListContextValue {
  list: UseCardListReturn<unknown>
  renderCard: (item: unknown, index: number) => ReactNode
  getItemKey: (item: unknown) => CardKey
  renderKey?: unknown
}

export const CardListContext = createContext<CardListContextValue | null>(null)

export function useCardListContext(): CardListContextValue {
  const ctx = useContext(CardListContext)
  if (!ctx) {
    throw new Error('CardList.* components must be rendered inside <CardList>')
  }
  return ctx
}
