import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { DashboardCard } from './DashboardCard'
import { countryFlag, countryName } from './countryUtils'
import { dummyOrders } from './dummyData'

const outlineBtn =
  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted'

export const RecentOrders: React.FC = () => {
  const { t, language } = useLanguage()
  const money = React.useMemo(
    () =>
      new Intl.NumberFormat(language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [language],
  )

  const headers = [
    t('dashboard.col.products'),
    t('dashboard.col.category'),
    t('dashboard.col.country'),
    t('dashboard.col.cr'),
    t('dashboard.col.value'),
  ]

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg leading-relaxed font-semibold">
          {t('dashboard.recentOrders')}
        </h3>
        <div className="flex gap-2">
          <button type="button" className={outlineBtn}>
            <SlidersHorizontal className="size-4" aria-hidden />
            {t('dashboard.filter')}
          </button>
          <button type="button" className={outlineBtn}>
            {t('dashboard.seeAll')}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-y">
              {headers.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="py-3 pr-4 font-normal leading-relaxed"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {dummyOrders.map((o) => (
              <tr key={o.id}>
                <td className="py-3 pr-4 font-semibold">{o.product}</td>
                <td className="text-muted-foreground py-3 pr-4">
                  {o.category}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="text-xl leading-none"
                    role="img"
                    aria-label={countryName(o.country, language)}
                  >
                    {countryFlag(o.country)}
                  </span>
                </td>
                <td className="text-muted-foreground py-3 pr-4">{o.cr}</td>
                <td className="py-3 font-semibold text-emerald-500">
                  {money.format(o.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  )
}
