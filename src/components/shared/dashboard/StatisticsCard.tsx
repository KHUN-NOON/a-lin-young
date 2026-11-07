import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard } from './DashboardCard'
import { dummyStatistics } from './dummyData'
import type { StatisticsTab } from './dummyData'

const TABS: Array<StatisticsTab> = ['overview', 'sales', 'revenue']
const W = 600
const H = 160

const toPath = (values: Array<number>, max: number) =>
  values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W
      const y = H - (v / max) * H
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

export const StatisticsCard: React.FC = () => {
  const { t, language } = useLanguage()
  const [tab, setTab] = React.useState<StatisticsTab>('overview')
  const data = dummyStatistics[tab]
  const max = Math.max(...data.a, ...data.b) * 1.1

  // Fake range: Oct 25 – Oct 31
  const range = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(language, {
      month: 'short',
      day: 'numeric',
    })
    return `${fmt.format(new Date(2024, 9, 25))} - ${fmt.format(new Date(2024, 9, 31))}`
  }, [language])

  return (
    <DashboardCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg leading-relaxed font-semibold">
            {t('dashboard.statistics')}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('dashboard.statisticsSubtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" className="bg-muted inline-flex rounded-lg p-0.5">
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium leading-relaxed',
                  tab === id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`dashboard.tab.${id}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={t('dashboard.dateRange')}
            className="text-muted-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <CalendarDays className="size-4" aria-hidden />
            {range}
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-6 h-40 w-full sm:h-56"
        role="img"
        aria-label={t(`dashboard.tab.${tab}`)}
      >
        <path
          d={toPath(data.a, max)}
          fill="none"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          className="stroke-indigo-500"
        />
        <path
          d={toPath(data.b, max)}
          fill="none"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          className="stroke-sky-400"
        />
      </svg>
    </DashboardCard>
  )
}
