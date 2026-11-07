import * as React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard, DashboardCardHeader } from './DashboardCard'
import { dummyDevices } from './dummyData'

const COLORS = {
  desktop: { stroke: 'stroke-blue-600', bg: 'bg-blue-600' },
  mobile: { stroke: 'stroke-indigo-400', bg: 'bg-indigo-400' },
  tablet: { stroke: 'stroke-indigo-100', bg: 'bg-indigo-100' },
} as const

const R = 80
const CIRC = 2 * Math.PI * R

export const SessionsByDevice: React.FC = () => {
  const { t, language } = useLanguage()
  const total = dummyDevices.reduce((sum, d) => sum + d.value, 0)

  let consumed = 0
  const segments = dummyDevices.map((d) => {
    const len = (d.value / total) * CIRC
    const segment = { key: d.key, len, offset: consumed }
    consumed += len
    return segment
  })

  return (
    <DashboardCard>
      <DashboardCardHeader title={t('dashboard.sessionsByDevice')} />
      <div className="relative mx-auto mt-6 w-full max-w-xs">
        <svg
          viewBox="0 0 200 200"
          className="w-full -rotate-90"
          role="img"
          aria-label={t('dashboard.sessionsByDevice')}
        >
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={100}
              cy={100}
              r={R}
              fill="none"
              strokeWidth={36}
              className={COLORS[s.key].stroke}
              strokeDasharray={`${s.len} ${CIRC - s.len}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">
            {new Intl.NumberFormat(language).format(total)}
          </span>
          <span className="text-muted-foreground text-sm leading-relaxed">
            {t('dashboard.total')}
          </span>
        </div>
      </div>
      <ul className="text-muted-foreground mt-6 flex flex-wrap justify-center gap-4 text-sm">
        {dummyDevices.map((d) => (
          <li key={d.key} className="flex items-center gap-2 leading-relaxed">
            <span
              className={`size-2.5 rounded-full ${COLORS[d.key].bg}`}
              aria-hidden
            />
            {t(`dashboard.${d.key}`)}
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
