import * as React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard, DashboardCardHeader } from './DashboardCard'
import { dummyChannels } from './dummyData'

const Y_TICKS = [0, 30, 60, 90, 120]
const MAX = 120

export const AcquisitionChannels: React.FC = () => {
  const { t, language } = useLanguage()
  const nf = React.useMemo(() => new Intl.NumberFormat(language), [language])
  const months = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(language, { month: 'short' })
    return dummyChannels.months.map((m) => fmt.format(new Date(2024, m, 1)))
  }, [language])

  const legend = [
    { label: t('dashboard.direct'), color: 'bg-indigo-400' },
    { label: t('dashboard.organic'), color: 'bg-violet-300' },
    { label: t('dashboard.referral'), color: 'bg-sky-300' },
  ]
  const total = new Intl.NumberFormat(language, {
    notation: 'compact',
  }).format(dummyChannels.total)

  return (
    <DashboardCard>
      <DashboardCardHeader title={t('dashboard.acquisitionChannels')} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <ul className="text-muted-foreground flex flex-wrap gap-4">
          {legend.map((l) => (
            <li
              key={l.label}
              className="flex items-center gap-2 leading-relaxed"
            >
              <span className={`size-3 rounded-full ${l.color}`} aria-hidden />
              {l.label}
            </li>
          ))}
        </ul>
        <span className="font-semibold">
          {t('dashboard.totalValue', { total })}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
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
          <div
            className="relative h-48"
            role="img"
            aria-label={t('dashboard.acquisitionChannels')}
          >
            {Y_TICKS.map((tick) => (
              <div
                key={tick}
                className="border-border absolute inset-x-0 border-t"
                style={{ bottom: `${(tick / MAX) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end justify-around">
              {months.map((m, i) => (
                <div
                  key={m}
                  className="flex w-5 flex-col-reverse overflow-hidden rounded-md sm:w-8"
                  style={{
                    height: `${
                      ((dummyChannels.referral[i] +
                        dummyChannels.organic[i] +
                        dummyChannels.direct[i]) /
                        MAX) *
                      100
                    }%`,
                  }}
                >
                  <div
                    className="bg-sky-300"
                    style={{ flex: dummyChannels.referral[i] }}
                  />
                  <div
                    className="bg-violet-300"
                    style={{ flex: dummyChannels.organic[i] }}
                  />
                  <div
                    className="bg-indigo-400"
                    style={{ flex: dummyChannels.direct[i] }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="text-muted-foreground mt-2 flex justify-around text-xs leading-relaxed">
            {months.map((m) => (
              <span key={m} className="w-8 text-center">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
