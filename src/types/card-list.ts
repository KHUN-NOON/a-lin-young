import type { RefObject } from 'react'

/** Tailwind breakpoints (plus the un-prefixed mobile-first `base`). */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/** Mobile-first responsive value: `base` is required, larger breakpoints override it. */
export type ResponsiveValue<T> = { base: T } & Partial<
  Record<Exclude<Breakpoint, 'base'>, T>
>

export type CardListLayout = 'list' | 'grid'

export type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6

export type CardKey = string | number

export type SelectionMode = 'none' | 'single' | 'multiple'

export type CardListStatus = 'loading' | 'error' | 'empty' | 'ready'

/** Minimal virtualizer surface used by `useCardList` (also the test-mock seam). */
export interface RowVirtualItem {
  key: string | number | bigint
  index: number
  start: number
  size: number
}

export interface RowVirtualizer {
  getVirtualItems: () => Array<RowVirtualItem>
  getTotalSize: () => number
  measureElement: (node: Element | null) => void
  scrollToIndex: (
    index: number,
    options?: {
      align?: 'start' | 'center' | 'end' | 'auto'
      behavior?: 'auto' | 'smooth'
    },
  ) => void
  scrollToOffset: (
    offset: number,
    options?: {
      align?: 'start' | 'center' | 'end' | 'auto'
      behavior?: 'auto' | 'smooth'
    },
  ) => void
}

export interface VirtualRowModel {
  key: string
  index: number
  /** Offset relative to the list container (scrollMargin already removed). */
  start: number
}

export interface UseCardListOptions<TItem> {
  items: ReadonlyArray<TItem>
  getItemKey: (item: TItem) => CardKey

  /** Mobile-first layout, e.g. `{ base: 'list', md: 'grid' }`. */
  layout?: ResponsiveValue<CardListLayout>
  /** Mobile-first columns used while the layout is `grid`. */
  columns?: ResponsiveValue<ColumnCount>

  /** Force virtualization on/off. Default: on when `items.length > virtualizeThreshold`. */
  virtualized?: boolean
  virtualizeThreshold?: number
  /** Initial row height guess (px); rows are measured afterwards. */
  estimateSize?: number
  overscan?: number
  /** Vertical gap between virtual rows (px). Must match your column gap class. */
  rowGap?: number
  /** Custom scroll element. When omitted the window scrolls. */
  scrollElementRef?: RefObject<HTMLElement | null>
  /** Offset of the list from the top of the scroll area. Measured automatically when omitted. */
  scrollMargin?: number
  /** Rows rendered when the scroll area has no size (SSR / jsdom). */
  fallbackRowCount?: number
  /** Replace the real virtualizer (tests). */
  virtualizer?: RowVirtualizer

  fetchNextPage?: () => unknown
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  /** Virtualized: fetch when the last rendered row is within N rows of the end. */
  loadMoreThreshold?: number
  /** Non-virtualized IntersectionObserver options. */
  rootMargin?: string
  threshold?: number | Array<number>

  isLoading?: boolean
  error?: unknown
  onRetry?: () => void

  selectionMode?: SelectionMode
  selectedKeys?: ReadonlyArray<CardKey>
  defaultSelectedKeys?: ReadonlyArray<CardKey>
  onSelectionChange?: (keys: Array<CardKey>) => void
}
