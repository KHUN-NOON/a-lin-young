import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Box, Users } from 'lucide-react'
import { MonthlySalesChart } from '@/components/shared/dashboard/MonthlySalesChart'
import { AcquisitionChannels } from '@/components/shared/dashboard/AcquisitionChannels'
import { CustomersDemographic } from '@/components/shared/dashboard/CustomersDemographic'
import { RecentOrders } from '@/components/shared/dashboard/RecentOrders'
import { SessionsByDevice } from '@/components/shared/dashboard/SessionsByDevice'
import { MonthlyTargetCard } from '@/components/shared/dashboard/MonthlyTargetCard'
import { StatCard } from '@/components/shared/dashboard/StatCard'
import { StatisticsCard } from '@/components/shared/dashboard/StatisticsCard'
import { dummyStats } from '@/components/shared/dashboard/dummyData'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Dashboard route – displayed at `/`.
 * `__root.tsx` already provides `MainLayout`, so only page content is rendered.
 * All widgets currently use dummy data.
 */
export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const { t } = useLanguage()

  useEffect(() => {
    document.title = `${t('dashboard.title')} | ${t('app.title')}`
  }, [t])

  return (
    <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
      <div className="space-y-4 md:space-y-6 lg:col-span-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          <StatCard
            icon={<Users className="size-6" aria-hidden />}
            label={t('dashboard.customers')}
            value={dummyStats.customers.value}
            change={dummyStats.customers.change}
          />
          <StatCard
            icon={<Box className="size-6" aria-hidden />}
            label={t('dashboard.orders')}
            value={dummyStats.orders.value}
            change={dummyStats.orders.change}
          />
        </div>
        <MonthlySalesChart />
      </div>

      <div className="lg:col-span-4">
        <MonthlyTargetCard />
      </div>

      <div className="lg:col-span-12">
        <StatisticsCard />
      </div>

      <div className="lg:col-span-5">
        <CustomersDemographic />
      </div>
      <div className="lg:col-span-7">
        <RecentOrders />
      </div>

      <div className="lg:col-span-7">
        <AcquisitionChannels />
      </div>
      <div className="lg:col-span-5">
        <SessionsByDevice />
      </div>
    </section>
  )
}
