# CardList – headless, virtualized, infinite-scroll card list

A table replacement that renders **cards**. Logic lives in `useCardList` (`src/hooks/useCardList.ts`);
the components in this folder are thin wrappers. The component never renders card UI – you supply it
through `renderCard`.

Works fully offline: it takes plain arrays and never reads network state.

```tsx
const scrollRef = useRef<HTMLDivElement>(null)

<div ref={scrollRef} className="h-[70vh] overflow-auto">
  <CardList
    items={items}
    getItemKey={(i) => i.id}
    renderCard={(i) => <InventoryCard item={i} />}
    scrollElementRef={scrollRef}          // omit to scroll the window
    layout={{ base: 'list', md: 'grid' }}
    columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
    hasNextPage={hasNextPage}
    isFetchingNextPage={isFetchingNextPage}
    fetchNextPage={fetchNextPage}
  >
    <CardList.Loading renderSkeleton={() => <Skeleton />} />
    <CardList.Empty>No items</CardList.Empty>
    <CardList.Error />
    <CardList.Container />
    <CardList.Sentinel />
    <CardList.End>End of list</CardList.End>
  </CardList>
</div>
```

Examples (10,000 generated items, DOM-node readout under the list) are in `examples/`:
`DexieInventoryExample` (`useLiveQuery` + IndexedDB) and `QueryInventoryExample` (`useInfiniteQuery`).
Both are mounted on the dashboard through `CardListDemo`.

## API

### Components

| Component                                 | Purpose                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `<CardList<TItem>>`                       | Root. Runs `useCardList`, provides context, renders an `aria-live` region.                                                                  |
| `.Container`                              | The list/grid wrapper (`role="list"`). Renders items or virtual rows via `renderCard`.                                                      |
| `.Item`                                   | Memoized wrapper around one card (used by Container; props-only, no context).                                                               |
| `.Empty` / `.Loading` / `.Error` / `.End` | State slots. `Loading` takes `when="initial" \| "next"`, `count`, `renderSkeleton`. `Error` accepts a render function `({ error, retry })`. |
| `.Sentinel`                               | IntersectionObserver target (non-virtualized only).                                                                                         |
| `.LoadMore`                               | Accessible "Load more" button fallback.                                                                                                     |

### `useCardList(options)` returns

State: `status`, `items`, `columns`, `activeLayout`, `breakpoint`, `isVirtualized`, `rowCount`, `virtualRows`,
`totalSize`, `liveMessage`, `selection`. Actions: `scrollToIndex(i, opts?)`, `scrollToTop()`, `fetchNextPage()`.
Prop getters: `getContainerProps()`, `getItemProps(item, index)`, `getSentinelProps()`, `getLoadMoreProps()`, `getRetryProps()`.

### Props (`CardListProps<TItem>` = `UseCardListOptions<TItem>` + render props)

| Prop                                                         | Type                                | Default                              | Notes                                                                      |
| ------------------------------------------------------------ | ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `items`                                                      | `TItem[]`                           | –                                    |                                                                            |
| `getItemKey`                                                 | `(item) => string \| number`        | –                                    | Must be stable & unique; keys the measurement cache.                       |
| `renderCard`                                                 | `(item, index) => ReactNode`        | –                                    | Identity changes don't re-render unchanged items.                          |
| `renderKey`                                                  | `unknown`                           | –                                    | Change to force item re-render if `renderCard` closes over outside state.  |
| `layout`                                                     | `ResponsiveValue<'list' \| 'grid'>` | `{ base: 'list', md: 'grid' }`       | Mobile-first.                                                              |
| `columns`                                                    | `ResponsiveValue<1..6>`             | `{ base: 1, sm: 2, lg: 3, xl: 4 }`   | Only used while `grid`.                                                    |
| `virtualized`                                                | `boolean`                           | `items.length > virtualizeThreshold` |                                                                            |
| `virtualizeThreshold`                                        | `number`                            | `100`                                |                                                                            |
| `estimateSize`                                               | `number`                            | `120`                                | Initial row height guess (px).                                             |
| `overscan`                                                   | `number`                            | `4`                                  | Rows.                                                                      |
| `rowGap`                                                     | `number`                            | `16`                                 | Virtual row gap (px); match your `gapClassName` (`gap-4` = 16).            |
| `scrollElementRef`                                           | `RefObject<HTMLElement>`            | window                               | Custom scroller.                                                           |
| `scrollMargin`                                               | `number`                            | measured                             | List offset in the scroll area.                                            |
| `fallbackRowCount`                                           | `number`                            | `8`                                  | Rows rendered if the scroll area has no size.                              |
| `virtualizer`                                                | `RowVirtualizer`                    | –                                    | Inject a fake virtualizer in tests.                                        |
| `fetchNextPage` / `hasNextPage` / `isFetchingNextPage`       |                                     |                                      | Directly compatible with `useInfiniteQuery`.                               |
| `loadMoreThreshold`                                          | `number`                            | `3`                                  | Virtualized: fetch when the last rendered row is within N rows of the end. |
| `rootMargin` / `threshold`                                   |                                     | `'200px'` / `0`                      | Non-virtualized IntersectionObserver.                                      |
| `isLoading` / `error` / `onRetry`                            |                                     |                                      | Drive Loading / Error states.                                              |
| `selectionMode`                                              | `'none' \| 'single' \| 'multiple'`  | `'none'`                             | Click or Space toggles.                                                    |
| `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` |                                     |                                      | Controlled / uncontrolled.                                                 |

`Container` props: `className`, `gapClassName` (`gap-4`), `rowClassName`, `itemClassName`.

## How it works

- **One breakpoint config** (`src/utils/breakpoints.ts`): `matchMedia` queries (JS column count) and the static
  Tailwind class maps are generated from the same table, so they cannot drift. Cards can adapt with
  `data-layout` (`in-data-[layout=list]:flex-row`).
- **Virtualization by rows**: `rowCount = ceil(items.length / columns)`; each row is a grid/flex line. List mode is
  `columns = 1`. Rows are positioned with `transform: translateY`, measured with `measureElement`.
  Row keys are `columns:firstItemKey`, so measurements survive data changes and reset on column changes.
- **Infinite scroll**: virtualized → derived from the last virtual row; otherwise a sentinel + IntersectionObserver
  (no scroll listeners). A duplicate-fetch guard covers both.
- **Keyboard**: roving tabindex; arrows (grid-aware), Home/End call `scrollToIndex`; if the focused item is
  virtualized out the container becomes the tab stop and restores focus on the item.

## Caveats

- **Only visible rows exist in the DOM**: browser find-in-page (Ctrl+F) and screen-reader "read all" only see
  that window. `aria-setsize`/`aria-posinset` are provided on items (`setsize = -1` while more pages exist).
  `aria-rowcount` is intentionally _not_ set because it is invalid on `role="list"`.
- **Dynamic heights**: unmeasured rows use `estimateSize`; a poor estimate causes small scrollbar jumps.
  Cards that change height after render (images) are re-measured by the ResizeObserver on the row.
- **Row gap**: `rowGap` (JS) and `gapClassName` (CSS) must agree.
- **Inserts above the viewport** shift content (no scroll anchoring); edits and appends/deletes below don't.
- **Window mode** measures `scrollMargin` on mount/resize; pass `scrollMargin` if content above the list changes height.
- **Memoization**: items re-render only on item/index/selection/focus changes. If `renderCard` reads external state,
  pass `renderKey`.
- Column counts are limited to 1–6 so Tailwind classes stay statically analyzable.
- Selection is click/Space on the item wrapper; stop propagation on interactive children.

## Offline / Dexie notes

`useDexieInventory` reads a growing `limit(n + 1)` window over the `updatedAt` index in one `useLiveQuery`.
Inserts/edits/deletes inside the window update live with stable keys (scroll offset and measurements kept). Schema
v2 backfills `updatedAt` on existing rows (see `src/lib/db/index.ts`).

## Benchmark

Run `npm run dev`, open `/dashboard`, and read the line under the list ("rendered N cards · M DOM nodes").
With 10,000 items the list keeps a few dozen cards in the DOM (jsdom test: < 40 list items at a 600px viewport);
node counts depend on viewport size, columns and overscan, and stay constant as the dataset grows.

## Tests

`npm test` – colocated Vitest + RTL tests (observers, `matchMedia` and element sizes are mocked in
`src/test/setup.ts`; Dexie tests use `fake-indexeddb`).
