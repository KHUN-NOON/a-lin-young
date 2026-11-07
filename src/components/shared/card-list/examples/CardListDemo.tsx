import { useState } from 'react'
import { DexieInventoryExample } from './DexieInventoryExample'
import { QueryInventoryExample } from './QueryInventoryExample'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils'

type TabKey = 'dexie' | 'query'

/** Demo of both data sources with 10,000 generated inventory items. */
export function CardListDemo() {
  const [tab, setTab] = useState<TabKey>('dexie')
  const { t } = useLanguage()

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'dexie', label: t('demo.tabDexie') },
    { key: 'query', label: t('demo.tabQuery') },
  ]

  return (
    <div className="space-y-3">
      <div role="group" aria-label={t('demo.dataSource')} className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-md border px-3 py-1 text-sm',
              tab === key && 'bg-primary text-primary-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'dexie' ? <DexieInventoryExample /> : <QueryInventoryExample />}
    </div>
  )
}
