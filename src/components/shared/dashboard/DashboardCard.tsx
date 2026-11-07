import * as React from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/context/LanguageContext'

/** Base surface used by every dashboard widget. */
export const DashboardCard: React.FC<React.ComponentProps<'div'>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('bg-card rounded-2xl border p-4 sm:p-6', className)}
    {...props}
  />
)

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

/** Title (+ optional subtitle) with a "more options" button by default. */
export const DashboardCardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const { t } = useLanguage()
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg leading-relaxed font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action ?? (
        <button
          type="button"
          aria-label={t('dashboard.moreOptions')}
          className="text-muted-foreground hover:text-foreground rounded-md p-1"
        >
          <MoreVertical className="size-5" aria-hidden />
        </button>
      )}
    </div>
  )
}
