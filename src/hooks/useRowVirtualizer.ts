import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'
import type { RefObject } from 'react'
import type { RowVirtualizer } from '@/types'

export interface UseRowVirtualizerOptions {
  enabled: boolean
  count: number
  estimateSize: number
  overscan: number
  gap: number
  scrollMargin: number
  getItemKey: (rowIndex: number) => string
  scrollElementRef?: RefObject<HTMLElement | null>
}

/**
 * Wraps `useVirtualizer` (custom scroll element) and `useWindowVirtualizer`
 * (window scroll). Hooks can't be called conditionally, so both are mounted and
 * the inactive one is disabled with `count: 0`.
 */
export function useRowVirtualizer({
  enabled,
  count,
  estimateSize,
  overscan,
  gap,
  scrollMargin,
  getItemKey,
  scrollElementRef,
}: UseRowVirtualizerOptions): RowVirtualizer {
  const useWindow = !scrollElementRef

  const elementVirtualizer = useVirtualizer<HTMLElement, Element>({
    enabled: enabled && !useWindow,
    count: enabled && !useWindow ? count : 0,
    getScrollElement: () => scrollElementRef?.current ?? null,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    scrollMargin,
    getItemKey,
  })

  const windowVirtualizer = useWindowVirtualizer<Element>({
    enabled: enabled && useWindow,
    count: enabled && useWindow ? count : 0,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    scrollMargin,
    getItemKey,
  })

  return useWindow ? windowVirtualizer : elementVirtualizer
}
