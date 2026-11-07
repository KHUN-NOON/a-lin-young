import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { useLanguage } from '@/context/LanguageContext'

/** Demo/benchmark helper: reports how many DOM nodes the list actually renders. */
export function DomStats({
  rootRef,
  totalItems,
}: {
  rootRef: RefObject<HTMLElement | null>
  totalItems: number
}) {
  const [stats, setStats] = useState({ nodes: 0, cards: 0 })
  const { language, t } = useLanguage()

  useEffect(() => {
    const measure = () => {
      const root = rootRef.current
      if (!root) return
      const nodes = root.querySelectorAll('*').length
      const cards = root.querySelectorAll('[role="listitem"]').length
      setStats((prev) =>
        prev.nodes === nodes && prev.cards === cards ? prev : { nodes, cards },
      )
    }
    measure()
    const id = setInterval(measure, 500)
    return () => clearInterval(id)
  }, [rootRef])

  return (
    <p className="text-xs text-muted-foreground" aria-live="off">
      {t('demo.domStats', {
        total: totalItems.toLocaleString(language),
        cards: stats.cards.toLocaleString(language),
        nodes: stats.nodes.toLocaleString(language),
      })}
    </p>
  )
}
