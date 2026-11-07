import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CardList } from './CardList'
import type { CardListProps } from './CardList'
import { MockIntersectionObserver, setViewportWidth } from '@/test/setup'
import type { RowVirtualizer } from '@/types'

interface Row {
  id: string
  name: string
}
const makeItems = (n: number): Array<Row> =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i}`, name: `Item ${i}` }))
const getKey = (r: Row) => r.id
const renderCard = (r: Row) => <span>{r.name}</span>

type HarnessProps = Partial<CardListProps<Row>> & {
  count?: number
  useScrollElement?: boolean
  extra?: ReactNode
}

function Harness({
  count = 10,
  useScrollElement = true,
  extra,
  ...rest
}: HarnessProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  return (
    <div ref={ref} data-testid="scroller">
      <CardList<Row>
        items={rest.items ?? makeItems(count)}
        getItemKey={getKey}
        renderCard={renderCard}
        scrollElementRef={useScrollElement ? ref : undefined}
        estimateSize={100}
        {...rest}
      >
        <CardList.Loading renderSkeleton={() => <i>skeleton</i>} />
        <CardList.Empty>Nothing here</CardList.Empty>
        <CardList.Error />
        <CardList.Container />
        <CardList.Sentinel />
        {extra}
      </CardList>
    </div>
  )
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  setViewportWidth(500)
})

describe('CardList windowing', () => {
  it('renders only a window of 10,000 items (custom scroll element)', () => {
    render(<Harness count={10_000} />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
    expect(items.length).toBeLessThan(40)
    expect(items[0]).toHaveAttribute('aria-posinset', '1')
    expect(items[0]).toHaveAttribute('aria-setsize', '10000')
    expect(screen.getByRole('list')).toHaveAttribute('data-virtualized', 'true')
  })

  it('renders only a window with window scrolling', () => {
    render(<Harness count={10_000} useScrollElement={false} />)
    expect(screen.getAllByRole('listitem').length).toBeLessThan(40)
  })

  it('virtualizes by rows in grid mode', () => {
    setViewportWidth(1400) // xl => grid, 4 columns
    render(<Harness count={10_000} />)
    const items = screen.getAllByRole('listitem')
    expect(items.length % 4).toBe(0)
    expect(items.length).toBeLessThan(200)
    expect(screen.getByRole('list')).toHaveAttribute('data-layout', 'grid')
  })

  it('renders everything without virtualization below the threshold', () => {
    render(<Harness count={20} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(20)
    expect(screen.getByRole('list')).toHaveAttribute(
      'data-virtualized',
      'false',
    )
  })

  it('uses a static fallback window when the scroll area has no size', () => {
    const empty: RowVirtualizer = {
      getVirtualItems: () => [],
      getTotalSize: () => 0,
      measureElement: () => undefined,
      scrollToIndex: () => undefined,
      scrollToOffset: () => undefined,
    }
    render(<Harness count={500} virtualizer={empty} fallbackRowCount={5} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})

describe('CardList responsive layout', () => {
  it('is a single-column list on small screens and a grid on larger ones', () => {
    const { unmount } = render(<Harness count={5} />)
    expect(screen.getByRole('list')).toHaveAttribute('data-layout', 'list')
    expect(screen.getByRole('list').className).toContain('flex-col')
    unmount()

    setViewportWidth(1100) // lg => grid, 3 columns
    render(<Harness count={5} />)
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-layout', 'grid')
    expect(list.className).toContain('md:grid')
    expect(list.className).toContain('lg:grid-cols-3')
  })
})

describe('CardList infinite scroll', () => {
  it('virtualized: fetches once near the end, guarding duplicates', () => {
    const fetchNextPage = vi.fn(() => new Promise<void>(() => undefined))
    const { rerender } = render(
      <Harness
        count={5}
        virtualized
        hasNextPage
        fetchNextPage={fetchNextPage}
      />,
    )
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    rerender(
      <Harness
        count={5}
        virtualized
        hasNextPage
        fetchNextPage={fetchNextPage}
      />,
    )
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('virtualized: does not fetch while a request is in flight', () => {
    const fetchNextPage = vi.fn()
    render(
      <Harness
        count={5}
        virtualized
        hasNextPage
        isFetchingNextPage
        fetchNextPage={fetchNextPage}
      />,
    )
    expect(fetchNextPage).not.toHaveBeenCalled()
  })

  it('non-virtualized: sentinel + IntersectionObserver, guarded and cleaned up', () => {
    const fetchNextPage = vi.fn(() => new Promise<void>(() => undefined))
    const { unmount } = render(
      <Harness
        count={5}
        hasNextPage
        fetchNextPage={fetchNextPage}
        rootMargin="50px"
      />,
    )
    const observer = MockIntersectionObserver.instances.at(-1)!
    observer.trigger(true)
    observer.trigger(true)
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    unmount()
    expect(
      MockIntersectionObserver.instances.every((o) => o.disconnected),
    ).toBe(true)
  })

  it('does not render a sentinel when virtualized', () => {
    const { container } = render(<Harness count={5} virtualized hasNextPage />)
    expect(container.querySelector('[data-card-list-sentinel]')).toBeNull()
  })

  it('offers an accessible Load more button', async () => {
    const user = userEvent.setup()
    const fetchNextPage = vi.fn()
    render(
      <Harness
        count={5}
        hasNextPage
        fetchNextPage={fetchNextPage}
        extra={<CardList.LoadMore />}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Load more' }))
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('announces newly loaded items politely', () => {
    const { rerender } = render(<Harness count={5} />)
    rerender(<Harness count={8} />)
    expect(screen.getByRole('status')).toHaveTextContent('3 more items loaded')
  })
})

describe('CardList states', () => {
  it('shows skeletons while loading', () => {
    render(<Harness items={[]} isLoading />)
    expect(screen.getAllByText('skeleton').length).toBeGreaterThan(0)
  })

  it('shows the empty state', () => {
    render(<Harness items={[]} />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows an error with a working retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<Harness items={[]} error={new Error('boom')} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('marks the list busy while fetching the next page', () => {
    render(<Harness count={5} isFetchingNextPage hasNextPage />)
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
  })
})

describe('CardList performance', () => {
  it('does not re-render items when renderCard identity changes', () => {
    const first = vi.fn((r: Row) => <span>{r.name}</span>)
    const second = vi.fn((r: Row) => <span>{r.name}</span>)
    const items = makeItems(5)
    const { rerender } = render(<Harness items={items} renderCard={first} />)
    expect(first).toHaveBeenCalled()
    rerender(<Harness items={items} renderCard={second} />)
    expect(second).not.toHaveBeenCalled()
  })

  it('re-renders items when renderKey changes', () => {
    const card = vi.fn((r: Row) => <span>{r.name}</span>)
    const items = makeItems(3)
    const { rerender } = render(
      <Harness items={items} renderCard={card} renderKey={1} />,
    )
    card.mockClear()
    rerender(<Harness items={items} renderCard={card} renderKey={2} />)
    expect(card).toHaveBeenCalledTimes(3)
  })

  it('positions virtual rows with transform, not top', () => {
    const { container } = render(<Harness count={500} />)
    const row = container.querySelector<HTMLElement>('[role="presentation"]')!
    expect(row.style.transform).toMatch(/translateY/)
    expect(row.style.top).toBe('0px')
  })
})

describe('CardList keyboard & selection', () => {
  const mockVirtualizer = () => {
    const scrollToIndex = vi.fn()
    const virtualizer: RowVirtualizer = {
      getVirtualItems: () =>
        [0, 1, 2].map((index) => ({
          key: index,
          index,
          start: index * 100,
          size: 100,
        })),
      getTotalSize: () => 1000,
      measureElement: () => undefined,
      scrollToIndex,
      scrollToOffset: () => undefined,
    }
    return { virtualizer, scrollToIndex }
  }

  it('arrow keys move focus and call scrollToIndex (virtualized)', async () => {
    const user = userEvent.setup()
    const { virtualizer, scrollToIndex } = mockVirtualizer()
    render(<Harness count={10} virtualized virtualizer={virtualizer} />)
    await user.tab()
    expect(screen.getAllByRole('listitem')[0]).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(scrollToIndex).toHaveBeenCalledWith(1, undefined)
    expect(screen.getAllByRole('listitem')[1]).toHaveFocus()
  })

  it('arrow keys move focus (non-virtualized)', async () => {
    const user = userEvent.setup()
    render(<Harness count={5} />)
    await user.tab()
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')
    expect(screen.getAllByRole('listitem')[1]).toHaveFocus()
  })

  it('supports multi selection via click and space', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <Harness
        count={3}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    )
    const items = screen.getAllByRole('listitem')
    await user.click(items[0])
    await user.click(items[1])
    expect(items[0]).toHaveAttribute('data-selected', 'true')
    expect(items[1]).toHaveAttribute('data-selected', 'true')
    await user.keyboard(' ')
    expect(items[1]).not.toHaveAttribute('data-selected')
    expect(onSelectionChange).toHaveBeenLastCalledWith(['r0'])
  })

  it('single selection replaces the previous choice', async () => {
    const user = userEvent.setup()
    render(<Harness count={3} selectionMode="single" />)
    const items = screen.getAllByRole('listitem')
    await user.click(items[0])
    await user.click(items[2])
    expect(items[0]).not.toHaveAttribute('data-selected')
    expect(items[2]).toHaveAttribute('data-selected', 'true')
  })
})
