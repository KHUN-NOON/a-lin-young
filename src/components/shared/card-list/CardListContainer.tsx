import { useMemo } from 'react'
import { CardListItem } from './CardListItem'
import { CardListRow } from './CardListRow'
import type { RowSharedProps } from './CardListRow'
import { useCardListContext } from './CardListContext'
import { cn } from '@/utils'

export interface CardListContainerProps {
  className?: string
  /** Gap between columns/rows. Keep it in sync with the `rowGap` option when virtualized. */
  gapClassName?: string
  /** Extra classes for each virtual row. */
  rowClassName?: string
  /** Extra classes for each item wrapper. */
  itemClassName?: string
}

/** The grid/list wrapper. Renders items (or virtual rows) through `renderCard`. */
export function CardListContainer({
  className,
  gapClassName = 'gap-4',
  rowClassName,
  itemClassName,
}: CardListContainerProps) {
  const { list, renderCard, getItemKey, renderKey } = useCardListContext()

  const tabStopKey = list.containerNeedsTabStop ? null : list.tabStopKey
  const selectedKeys = list.selection.selectedKeys
  const shared = useMemo<RowSharedProps<unknown>>(
    () => ({
      getItemKey,
      renderCard,
      renderKey,
      setSize: list.setSize,
      tabStopKey,
      selectedKeys,
      layout: list.activeLayout,
      handlers: list.itemHandlers,
      itemClassName,
    }),
    [
      getItemKey,
      renderCard,
      renderKey,
      list.setSize,
      tabStopKey,
      selectedKeys,
      list.activeLayout,
      list.itemHandlers,
      itemClassName,
    ],
  )

  if (list.status !== 'ready') return null

  const { className: layoutClass, ...containerProps } = list.getContainerProps()

  if (!list.isVirtualized) {
    return (
      <div
        {...containerProps}
        className={cn(layoutClass, gapClassName, className)}
      >
        {list.items.map((item, index) => {
          const key = getItemKey(item)
          return (
            <CardListItem
              key={key}
              item={item}
              index={index}
              itemKey={key}
              setSize={shared.setSize}
              isTabStop={key === tabStopKey}
              isSelected={selectedKeys.has(key)}
              layout={list.activeLayout}
              handlers={list.itemHandlers}
              renderCard={renderCard}
              renderKey={renderKey}
              className={itemClassName}
            />
          )
        })}
      </div>
    )
  }

  const rowClasses = cn(list.layoutClassName, gapClassName, rowClassName)
  return (
    <div {...containerProps} className={className}>
      {list.virtualRows.map((row) => (
        <CardListRow
          key={row.key}
          rowIndex={row.index}
          start={row.start}
          columns={list.columns}
          items={list.items}
          className={rowClasses}
          measureRow={list.measureRow}
          shared={shared}
        />
      ))}
    </div>
  )
}
