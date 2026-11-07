import * as React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard } from './DashboardCard'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  /** Percentage change; negative values render as a decrease. */
  change: number
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
}) => {
  const { t, language } = useLanguage()
  const isUp = change >= 0
  const Arrow = isUp ? ArrowUp : ArrowDown
  const percent = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(change))

  return (
    <DashboardCard>
      <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div className="mt-5 flex items-end justify-between gap-2">
        <div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {new Intl.NumberFormat(language).format(value)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            isUp
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-red-500/15 text-red-500',
          )}
        >
          <Arrow
            className="size-3"
            aria-label={t(isUp ? 'dashboard.trendUp' : 'dashboard.trendDown')}
          />
          {percent}%
        </span>
      </div>
    </DashboardCard>
  )
}
