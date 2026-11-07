import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { defaultInventoryFilter, inventoryFilterSchema } from '@/lib/schemas/inventoryFilter'
import type { InventoryFilter } from '@/lib/schemas/inventoryFilter'
import { useLanguage } from '@/context/LanguageContext'
import type { TranslationKey } from '@/lib/i18n'

/** Search + low-stock filter (React Hook Form + Zod). Emits valid values as they change. */
export function InventoryFilterForm({
  onChange,
}: {
  onChange: (filter: InventoryFilter) => void
}) {
  const { t } = useLanguage()
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<InventoryFilter>({
    resolver: zodResolver(inventoryFilterSchema),
    defaultValues: defaultInventoryFilter,
    mode: 'onChange',
  })

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = inventoryFilterSchema.safeParse(values)
      if (parsed.success) onChange(parsed.data)
    })
    return () => subscription.unsubscribe()
  }, [watch, onChange])

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => e.preventDefault()}
      role="search"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="sr-only">{t('inventory.search')}</span>
        <input
          type="search"
          placeholder={t('inventory.searchPlaceholder')}
          className="rounded-md border bg-background px-3 py-2"
          {...register('search')}
        />
        {errors.search?.message && (
          <span role="alert" className="text-xs text-destructive">
            {t(errors.search.message as TranslationKey)}
          </span>
        )}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('lowStockOnly')} />
        {t('inventory.lowStockOnly')}
      </label>
    </form>
  )
}
