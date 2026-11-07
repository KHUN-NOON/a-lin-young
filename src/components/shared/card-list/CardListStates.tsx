import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { useCardListContext } from './CardListContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils'

/** Shown when there are no items, no error and nothing is loading. */
export function CardListEmpty({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { list } = useCardListContext()
  const { t } = useLanguage()
  if (list.status !== 'empty') return null
  return <div {...props}>{children ?? t('common.noItems')}</div>
}

export interface CardListErrorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children?:
    ReactNode | ((args: { error: unknown; retry?: () => void }) => ReactNode)
}

/** Shown whenever `error` is set. Pass a render function to get `retry`. */
export function CardListError({ children, ...props }: CardListErrorProps) {
  const { list } = useCardListContext()
  const { t } = useLanguage()
  if (list.error == null) return null
  const content =
    typeof children === 'function'
      ? children({ error: list.error, retry: list.retry })
      : (children ?? (
          <>
            <span>{t('common.somethingWentWrong')}</span>{' '}
            {list.retry && (
              <button {...list.getRetryProps()}>{t('common.retry')}</button>
            )}
          </>
        ))
  return (
    <div role="alert" {...props}>
      {content}
    </div>
  )
}

export interface CardListLoadingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** `initial`: first load (no items yet). `next`: while fetching the next page. */
  when?: 'initial' | 'next'
  count?: number
  renderSkeleton?: (index: number) => ReactNode
  gapClassName?: string
}

/** Skeleton slots, laid out with the same responsive classes as the list. */
export function CardListLoading({
  when = 'initial',
  count,
  renderSkeleton,
  gapClassName = 'gap-4',
  className,
  ...props
}: CardListLoadingProps) {
  const { list } = useCardListContext()
  const visible =
    when === 'initial'
      ? list.status === 'loading'
      : list.status === 'ready' && list.isFetchingNextPage
  if (!visible) return null
  const slots = count ?? (when === 'initial' ? 6 : list.columns)
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(list.layoutClassName, gapClassName, className)}
      data-layout={list.activeLayout}
    >
      {Array.from({ length: slots }, (_, i) => (
        <div key={i}>{renderSkeleton ? renderSkeleton(i) : null}</div>
      ))}
    </div>
  )
}

/** IntersectionObserver target. Renders nothing while virtualized (rows drive loading). */
export function CardListSentinel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { list } = useCardListContext()
  if (list.isVirtualized || list.status !== 'ready' || !list.hasNextPage)
    return null
  return (
    <div
      {...props}
      {...list.getSentinelProps()}
      className={cn('h-px w-full', className)}
    />
  )
}

/** Accessible "Load more" fallback button. */
export function CardListLoadMore({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { list } = useCardListContext()
  const { t } = useLanguage()
  if (list.status !== 'ready' || !list.hasNextPage) return null
  return (
    <button {...props} {...list.getLoadMoreProps()}>
      {children ?? t('common.loadMore')}
    </button>
  )
}

/** End-of-list message, shown once there is nothing more to fetch. */
export function CardListEnd({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { list } = useCardListContext()
  if (list.status !== 'ready' || list.hasNextPage || !children) return null
  return <div {...props}>{children}</div>
}
