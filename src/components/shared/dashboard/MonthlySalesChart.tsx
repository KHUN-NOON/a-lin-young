import * as React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard, DashboardCardHeader } from './DashboardCard'
import { dummyMonthlySales } from './dummyData'

const Y_TICKS = [0, 100, 200, 300, 400]
const MAX = 400

export const MonthlySalesChart: React.FC = () => {
  const { t, language } = useLanguage()
  const months = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(language, { month: 'short' })
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(2024, i, 1)),
    )
  }, [language])
  const nf = React.useMemo(() => new Intl.NumberFormat(language), [language])

  return (
    <DashboardCard>
      <DashboardCardHeader title={t('dashboard.monthlySales')} />
      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-[28rem] gap-3">
          {/* Y axis */}
          <div
            className="text-muted-foreground flex h-48 flex-col-reverse justify-between text-xs"
            aria-hidden
          >
            {Y_TICKS.map((tick) => (
              <span key={tick} className="leading-none">
                {nf.format(tick)}
              </span>
            ))}
          </div>
          <div className="flex-1">
            {/* Plot area */}
            <div
              className="relative h-48"
              role="img"
              aria-label={t('dashboard.monthlySales')}
            >
              {Y_TICKS.map((tick) => (
                <div
                  key={tick}
                  className="border-border absolute inset-x-0 border-t"
                  style={{ bottom: `${(tick / MAX) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {dummyMonthlySales.map((value, i) => (
                  <div
                    key={months[i]}
                    className="w-3 rounded-t-md bg-indigo-500 sm:w-4"
                    style={{ height: `${(value / MAX) * 100}%` }}
                    title={`${months[i]}: ${nf.format(value)}`}
                  />
                ))}
              </div>
            </div>
            {/* X axis */}
            <div className="text-muted-foreground mt-2 flex justify-between text-xs leading-relaxed">
              {months.map((m) => (
                <span key={m} className="w-6 text-center">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
