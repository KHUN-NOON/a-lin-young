import * as React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard, DashboardCardHeader } from './DashboardCard'
import { countryFlag, countryName } from './countryUtils'
import { dummyDemographic } from './dummyData'

/** Pins in the 0–100 viewBox of the stylised map. */
const PINS = [
  { x: 22, y: 38 },
  { x: 47, y: 28 },
  { x: 49, y: 32 },
  { x: 76, y: 56 },
]

/** Simplified dotted world map placeholder (swap for a real map later). */
const WorldMap: React.FC<{ label: string }> = ({ label }) => (
  <svg
    viewBox="0 0 100 55"
    className="bg-muted/40 h-40 w-full rounded-xl border sm:h-48"
    role="img"
    aria-label={label}
  >
    <defs>
      <pattern id="dots" width="2" height="2" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" className="fill-muted-foreground/40" />
      </pattern>
    </defs>
    <g fill="url(#dots)">
      <path d="M8 18 L28 12 L36 24 L30 36 L22 44 L14 34 Z" />
      <path d="M26 44 L34 46 L32 58 L28 58 Z" />
      <path d="M44 14 L62 12 L88 18 L90 32 L78 44 L66 36 L54 40 L46 30 Z" />
      <path d="M48 36 L58 38 L60 52 L52 54 Z" />
      <path d="M78 52 L92 50 L92 58 L80 58 Z" />
    </g>
    {PINS.map((p, i) => (
      <circle
        key={i}
        cx={p.x}
        cy={p.y * 0.55 + 4}
        r={1.2}
        className="fill-indigo-500"
      />
    ))}
  </svg>
)

export const CustomersDemographic: React.FC = () => {
  const { t, language } = useLanguage()
  const nf = React.useMemo(() => new Intl.NumberFormat(language), [language])
  const pf = React.useMemo(
    () =>
      new Intl.NumberFormat(language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [language],
  )

  return (
    <DashboardCard>
      <DashboardCardHeader
        title={t('dashboard.customersDemographic')}
        subtitle={t('dashboard.customersDemographicSubtitle')}
      />
      <div className="mt-4">
        <WorldMap label={t('dashboard.map')} />
      </div>
      <ul className="mt-5 space-y-4">
        {dummyDemographic.map((row) => (
          <li key={row.country} className="flex items-center gap-3">
            <span className="text-3xl leading-none" aria-hidden>
              {countryFlag(row.country)}
            </span>
            <div className="flex-1">
              <p className="font-semibold leading-relaxed">
                {countryName(row.country, language)}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t('dashboard.customersCount', {
                  count: nf.format(row.customers),
                })}
              </p>
            </div>
            <span className="text-sm font-medium">
              {pf.format(row.percent)}%
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
