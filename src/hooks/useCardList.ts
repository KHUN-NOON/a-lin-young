import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLanguage } from '@/context/LanguageContext'
import { useLatest } from '@/hooks/useLatest'
import { useRowVirtualizer } from '@/hooks/useRowVirtualizer'
import type {
  CardKey,
  CardListLayout,
  CardListStatus,
  ColumnCount,
  ResponsiveValue,
  UseCardListOptions,
  VirtualRowModel,
} from '@/types'
import {
  buildLayoutClasses,
  resolveColumns,
  resolveResponsive,
} from '@/utils/breakpoints'

const DEFAULT_LAYOUT: ResponsiveValue<CardListLayout> = {
  base: 'list',
  md: 'grid',
}
const DEFAULT_COLUMNS: ResponsiveValue<ColumnCount> = {
  base: 1,
  sm: 2,
  lg: 3,
  xl: 4,
}

export interface ItemAttrsInput {
  index: number
  setSize: number
  isTabStop: boolean
  isSelected: boolean
  layout: CardListLayout
}

/** Pure attribute builder shared by `getItemProps` and the memoized item component. */
export function buildItemAttrs(input: ItemAttrsInput) {
  return {
    role: 'listitem' as const,
    'aria-setsize': input.setSize,
    'aria-posinset': input.index + 1,
    tabIndex: input.isTabStop ? 0 : -1,
    'data-item-index': input.index,
    'data-layout': input.layout,
    'data-selected': input.isSelected ? 'true' : undefined,
  }
}

export interface ItemHandlers {
  onItemFocus: (key: CardKey) => void
  onItemClick: (key: CardKey) => void
  /** Ref callback helper: focuses the element if a keyboard move targeted it. */
  claimPendingFocus: (key: CardKey, el: HTMLElement | null) => void
}

export function useCardList<TItem>(options: UseCardListOptions<TItem>) {
  const {
    items,
    getItemKey,
    layout = DEFAULT_LAYOUT,
    columns: columnsConfig = DEFAULT_COLUMNS,
    virtualized,
    virtualizeThreshold = 100,
    estimateSize = 120,
    overscan = 4,
    rowGap = 16,
    scrollElementRef,
    scrollMargin: scrollMarginProp,
    fallbackRowCount = 8,
    virtualizer: virtualizerOverride,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage = false,
    loadMoreThreshold = 3,
    rootMargin = '200px',
    threshold = 0,
    isLoading = false,
    error = null,
    onRetry,
    selectionMode = 'none',
    selectedKeys: controlledKeys,
    defaultSelectedKeys,
    onSelectionChange,
  } = options

  // ---------------------------------------------------------------- layout
  const breakpoint = useBreakpoint()
  const activeLayout = resolveResponsive(layout, breakpoint)
  const columns = resolveColumns(layout, columnsConfig, breakpoint)
  const layoutClassName = useMemo(
    () => buildLayoutClasses(layout, columnsConfig),
    [layout, columnsConfig],
  )

  const isVirtualized = virtualized ?? items.length > virtualizeThreshold
  const rowCount = Math.ceil(items.length / columns)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const getItemKeyRef = useLatest(getItemKey)

  // ------------------------------------------------------- scroll margin
  const [measuredMargin, setMeasuredMargin] = useState(0)
  useLayoutEffect(() => {
    if (!isVirtualized || scrollMarginProp !== undefined) return
    const update = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scroller = scrollElementRef?.current
      const next = scroller
        ? rect.top - scroller.getBoundingClientRect().top + scroller.scrollTop
        : rect.top + window.scrollY
      setMeasuredMargin((prev) =>
        Math.abs(prev - next) < 1 ? prev : Math.round(next),
      )
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [isVirtualized, scrollMarginProp, scrollElementRef, columns])
  const scrollMargin = scrollMarginProp ?? measuredMargin

  // -------------------------------------------------------- virtualizer
  // Row keys derive from the first item's key (+ column count) so the
  // measurement cache survives data changes and resets on column changes.
  const rowKey = useCallback(
    (rowIndex: number): string => {
      const first = items[rowIndex * columns]
      return first === undefined
        ? `row-${rowIndex}`
        : `${columns}:${String(getItemKeyRef.current(first))}`
    },
    [items, columns, getItemKeyRef],
  )

  const realVirtualizer = useRowVirtualizer({
    enabled: isVirtualized && !virtualizerOverride,
    count: rowCount,
    estimateSize,
    overscan,
    gap: rowGap,
    scrollMargin,
    getItemKey: rowKey,
    scrollElementRef,
  })
  const virtualizer = virtualizerOverride ?? realVirtualizer

  let virtualRows: Array<VirtualRowModel> = []
  let totalSize = 0
  if (isVirtualized) {
    const virtualItems = virtualizer.getVirtualItems()
    if (virtualItems.length > 0) {
      virtualRows = virtualItems.map((v) => ({
        key: rowKey(v.index),
        index: v.index,
        start: v.start - scrollMargin,
      }))
      totalSize = virtualizer.getTotalSize()
    } else if (rowCount > 0) {
      // No scroll-area size (SSR / jsdom): render a sensible static window.
      const shown = Math.min(rowCount, fallbackRowCount)
      virtualRows = Array.from({ length: shown }, (_, index) => ({
        key: rowKey(index),
        index,
        start: index * (estimateSize + rowGap),
      }))
      totalSize = rowCount * (estimateSize + rowGap)
    }
  }

  // ------------------------------------------------------ infinite scroll
  const fetchRef = useLatest(fetchNextPage)
  const hasNextRef = useLatest(hasNextPage)
  const fetchingRef = useLatest(isFetchingNextPage)
  const inFlightRef = useRef(false)

  const requestNext = useCallback(() => {
    const fetchFn = fetchRef.current
    if (!fetchFn || !hasNextRef.current || fetchingRef.current) return
    if (inFlightRef.current) return
    inFlightRef.current = true
    Promise.resolve(fetchFn())
      .catch(() => undefined) // errors surface through the consumer's `error` prop
      .finally(() => {
        inFlightRef.current = false
      })
  }, [fetchRef, hasNextRef, fetchingRef])

  // Virtualized: derive "near the end" from the last rendered virtual row.
  const lastRowIndex = virtualRows.length
    ? virtualRows[virtualRows.length - 1].index
    : -1
  useEffect(() => {
    if (!isVirtualized || lastRowIndex < 0) return
    if (lastRowIndex >= rowCount - 1 - loadMoreThreshold) requestNext()
  }, [
    isVirtualized,
    lastRowIndex,
    rowCount,
    loadMoreThreshold,
    hasNextPage,
    isFetchingNextPage,
    requestNext,
  ])

  // Non-virtualized: IntersectionObserver on a sentinel.
  const [sentinelEl, setSentinelEl] = useState<Element | null>(null)
  useEffect(() => {
    if (
      isVirtualized ||
      !sentinelEl ||
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }
    // Re-created after every page so a sentinel that is still visible re-fires.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) requestNext()
      },
      { root: scrollElementRef?.current ?? null, rootMargin, threshold },
    )
    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [
    isVirtualized,
    sentinelEl,
    hasNextPage,
    isFetchingNextPage,
    items.length,
    rootMargin,
    threshold,
    scrollElementRef,
    requestNext,
  ])

  // ------------------------------------------------------------ selection
  const [internalSelection, setInternalSelection] = useState<
    ReadonlySet<CardKey>
  >(() => new Set(defaultSelectedKeys))
  const controlledSet = useMemo(
    () => (controlledKeys ? new Set(controlledKeys) : null),
    [controlledKeys],
  )
  const selectedSet: ReadonlySet<CardKey> = controlledSet ?? internalSelection
  const selectedRef = useLatest(selectedSet)
  const onSelectionChangeRef = useLatest(onSelectionChange)
  const isControlled = controlledSet !== null

  const commitSelection = useCallback(
    (next: Set<CardKey>) => {
      if (!isControlled) setInternalSelection(next)
      onSelectionChangeRef.current?.(Array.from(next))
    },
    [isControlled, onSelectionChangeRef],
  )

  const toggleSelection = useCallback(
    (key: CardKey) => {
      if (selectionMode === 'none') return
      const current = selectedRef.current
      if (selectionMode === 'single') {
        commitSelection(current.has(key) ? new Set() : new Set([key]))
        return
      }
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      commitSelection(next)
    },
    [selectionMode, selectedRef, commitSelection],
  )
  const clearSelection = useCallback(
    () => commitSelection(new Set()),
    [commitSelection],
  )
  const isSelected = useCallback(
    (key: CardKey) => selectedSet.has(key),
    [selectedSet],
  )

  // ------------------------------------------------------ live announcements
  const { t } = useLanguage()
  const [prevCount, setPrevCount] = useState(items.length)
  const [liveMessage, setLiveMessage] = useState('')
  if (items.length !== prevCount) {
    setPrevCount(items.length)
    if (prevCount > 0 && items.length > prevCount) {
      setLiveMessage(
        t('cardList.itemsLoaded', {
          count: items.length - prevCount,
          total: items.length,
        }),
      )
    }
  }

  // ------------------------------------------------------ focus & scrolling
  const [focusedKey, setFocusedKey] = useState<CardKey | null>(null)
  const pendingFocusKeyRef = useRef<CardKey | null>(null)

  const focusedIndex = useMemo(() => {
    if (focusedKey === null) return -1
    return items.findIndex((item) => getItemKeyRef.current(item) === focusedKey)
  }, [items, focusedKey, getItemKeyRef])

  const firstKey = items.length > 0 ? getItemKey(items[0]) : null
  const tabStopKey = focusedIndex >= 0 ? focusedKey : firstKey

  const firstRenderedItem = virtualRows.length
    ? virtualRows[0].index * columns
    : 0
  const lastRenderedItem = virtualRows.length
    ? (virtualRows[virtualRows.length - 1].index + 1) * columns - 1
    : -1
  const focusedIsRendered =
    !isVirtualized ||
    focusedIndex < 0 ||
    (focusedIndex >= firstRenderedItem && focusedIndex <= lastRenderedItem)

  const scrollToIndex = useCallback(
    (
      index: number,
      opts?: {
        align?: 'start' | 'center' | 'end' | 'auto'
        behavior?: 'auto' | 'smooth'
      },
    ) => {
      if (isVirtualized) {
        virtualizer.scrollToIndex(Math.floor(index / columns), opts)
      } else {
        containerRef.current
          ?.querySelector<HTMLElement>(`[data-item-index="${index}"]`)
          ?.scrollIntoView({ block: 'nearest' })
      }
    },
    [isVirtualized, virtualizer, columns],
  )

  const scrollToTop = useCallback(
    (behavior: 'auto' | 'smooth' = 'auto') => {
      const scroller = scrollElementRef?.current
      if (scroller) scroller.scrollTo({ top: 0, behavior })
      else if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior })
      }
    },
    [scrollElementRef],
  )

  const moveFocus = useCallback(
    (index: number) => {
      const target = items[index]
      if (target === undefined) return
      const key = getItemKeyRef.current(target)
      setFocusedKey(key)
      scrollToIndex(index)
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-item-index="${index}"]`,
      )
      if (el) {
        pendingFocusKeyRef.current = null
        el.focus({ preventScroll: isVirtualized })
      } else {
        // Not mounted yet – the item claims focus when the virtualizer renders it.
        pendingFocusKeyRef.current = key
      }
    },
    [items, getItemKeyRef, scrollToIndex, isVirtualized],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const itemEl = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-item-index]',
      )
      if (!itemEl) return
      const current = Number(itemEl.dataset.itemIndex)
      const isGrid = activeLayout === 'grid'
      let next = current
      switch (event.key) {
        case 'ArrowDown':
          next = current + (isGrid ? columns : 1)
          break
        case 'ArrowUp':
          next = current - (isGrid ? columns : 1)
          break
        case 'ArrowRight':
          if (!isGrid) return
          next = current + 1
          break
        case 'ArrowLeft':
          if (!isGrid) return
          next = current - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = items.length - 1
          break
        case ' ':
          if (event.target === itemEl && selectionMode !== 'none') {
            event.preventDefault()
            const target = items[current]
            if (target !== undefined)
              toggleSelection(getItemKeyRef.current(target))
          }
          return
        default:
          return
      }
      event.preventDefault()
      next = Math.max(0, Math.min(items.length - 1, next))
      if (next !== current) moveFocus(next)
    },
    [
      activeLayout,
      columns,
      items,
      selectionMode,
      toggleSelection,
      getItemKeyRef,
      moveFocus,
    ],
  )

  // When the focused item is virtualized out, the container becomes the tab
  // stop; focusing it scrolls the item back and restores focus onto it.
  const containerNeedsTabStop =
    isVirtualized && focusedKey !== null && !focusedIsRendered
  const onContainerFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (event.target === event.currentTarget && focusedIndex >= 0) {
        moveFocus(focusedIndex)
      }
    },
    [focusedIndex, moveFocus],
  )

  const itemHandlers = useMemo<ItemHandlers>(
    () => ({
      onItemFocus: (key) => setFocusedKey(key),
      onItemClick: (key) => toggleSelection(key),
      claimPendingFocus: (key, el) => {
        if (el && pendingFocusKeyRef.current === key) {
          pendingFocusKeyRef.current = null
          el.focus({ preventScroll: true })
        }
      },
    }),
    [toggleSelection],
  )

  // ---------------------------------------------------------------- status
  const status: CardListStatus =
    items.length > 0
      ? 'ready'
      : error != null
        ? 'error'
        : isLoading
          ? 'loading'
          : 'empty'

  const setSize = hasNextPage ? -1 : items.length

  // ----------------------------------------------------------- prop getters
  const getContainerProps = () => ({
    ref: containerRef,
    role: 'list' as const,
    'aria-busy': isLoading || isFetchingNextPage,
    'data-layout': activeLayout,
    'data-virtualized': isVirtualized ? 'true' : 'false',
    tabIndex: containerNeedsTabStop ? 0 : undefined,
    onKeyDown,
    onFocus: onContainerFocus,
    className: isVirtualized ? undefined : layoutClassName,
    style: isVirtualized
      ? ({ position: 'relative', height: totalSize, width: '100%' } as const)
      : undefined,
  })

  const getItemProps = (item: TItem, index: number) => {
    const key = getItemKey(item)
    return {
      ...buildItemAttrs({
        index,
        setSize,
        isTabStop: key === tabStopKey && !containerNeedsTabStop,
        isSelected: selectedSet.has(key),
        layout: activeLayout,
      }),
      onFocus: () => itemHandlers.onItemFocus(key),
      onClick: () => itemHandlers.onItemClick(key),
      ref: (el: HTMLElement | null) => itemHandlers.claimPendingFocus(key, el),
    }
  }

  const getSentinelProps = () => ({
    ref: setSentinelEl,
    'aria-hidden': true as const,
    'data-card-list-sentinel': '',
  })

  const getLoadMoreProps = () => ({
    type: 'button' as const,
    disabled: !hasNextPage || isFetchingNextPage,
    'aria-busy': isFetchingNextPage,
    onClick: requestNext,
  })

  const getRetryProps = () => ({
    type: 'button' as const,
    onClick: onRetry,
  })

  return {
    // state
    status,
    items,
    error,
    breakpoint,
    activeLayout,
    columns,
    layoutClassName,
    isVirtualized,
    rowCount,
    rowGap,
    virtualRows,
    totalSize,
    measureRow: virtualizer.measureElement,
    hasNextPage,
    isFetchingNextPage,
    liveMessage,
    setSize,
    tabStopKey,
    containerNeedsTabStop,
    itemHandlers,
    selection: {
      mode: selectionMode,
      selectedKeys: selectedSet,
      isSelected,
      toggle: toggleSelection,
      clear: clearSelection,
    },
    // actions
    scrollToIndex,
    scrollToTop,
    fetchNextPage: requestNext,
    retry: onRetry,
    // prop getters
    getContainerProps,
    getItemProps,
    getSentinelProps,
    getLoadMoreProps,
    getRetryProps,
  }
}

export type UseCardListReturn<TItem> = ReturnType<typeof useCardList<TItem>>
