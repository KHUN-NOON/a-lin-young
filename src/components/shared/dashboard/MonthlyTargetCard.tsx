import * as React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard, DashboardCardHeader } from './DashboardCard'
import { dummyMonthlyTarget } from './dummyData'

/** Semicircle gauge drawn with SVG (no chart dependency). */
const Gauge: React.FC<{ percent: number; label: string }> = ({
  percent,
  label,
}) => {
  const r = 100
  const arcLength = Math.PI * r
  const path = `M 20 120 A ${r} ${r} 0 0 1 220 120`
  return (
    <svg
      viewBox="0 0 240 130"
      className="mx-auto w-full max-w-xs"
      role="img"
      aria-label={label}
    >
      <path
        d={path}
        fill="none"
        strokeWidth={14}
        strokeLinecap="round"
        className="stroke-muted"
      />
      <path
        d={path}
        fill="none"
        strokeWidth={14}
        strokeLinecap="round"
        className="stroke-indigo-500"
        strokeDasharray={`${(arcLength * percent) / 100} ${arcLength}`}
      />
    </svg>
  )
}

const Trend: React.FC<{ dir: 'up' | 'down' }> = ({ dir }) => {
  const Icon = dir === 'up' ? ArrowUp : ArrowDown
  return (
    <Icon
      className={cn(
        'size-4',
        dir === 'up' ? 'text-emerald-500' : 'text-red-500',
      )}
      aria-hidden
    />
  )
}

export const MonthlyTargetCard: React.FC = () => {
  const { t, language } = useLanguage()
  const d = dummyMonthlyTarget
  const money = (n: number, compact = false) =>
    new Intl.NumberFormat(language, {
      style: 'currency',
      currency: 'USD',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(n)
  const percentText = `${new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(d.percent)}%`

  const summary: Array<{
    key: string
    label: string
    value: number
    trend: 'up' | 'down'
  }> = [
    {
      key: 'target',
      label: t('dashboard.target'),
      value: d.target,
      trend: d.targetTrend,
    },
    {
      key: 'revenue',
      label: t('dashboard.revenue'),
      value: d.revenue,
      trend: d.revenueTrend,
    },
    {
      key: 'today',
      label: t('dashboard.today'),
      value: d.today,
      trend: d.todayTrend,
    },
  ]

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <DashboardCard className="rounded-none border-0">
        <DashboardCardHeader
          title={t('dashboard.monthlyTarget')}
          subtitle={t('dashboard.monthlyTargetSubtitle')}
        />
        <div className="relative mt-4">
          <Gauge percent={d.percent} label={t('dashboard.progress')} />
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold">{percentText}</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
              +{new Intl.NumberFormat(language).format(d.delta)}%
            </span>
          </div>
        </div>
        <p className="text-muted-foreground mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed">
          {t('dashboard.targetMessage', { amount: money(d.earnedToday) })}
        </p>
      </DashboardCard>
      <dl className="bg-muted/40 grid grid-cols-3 gap-2 border-t px-4 py-4 text-center sm:px-6">
        {summary.map((s) => (
          <div key={s.key}>
            <dt className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              {s.label}
            </dt>
            <dd className="mt-1 flex items-center justify-center gap-1 font-semibold">
              {money(s.value, true)}
              <Trend dir={s.trend} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
