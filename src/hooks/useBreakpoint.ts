import { useSyncExternalStore } from 'react'
import type { Breakpoint } from '@/types'
import { BREAKPOINT_MIN_WIDTH, BREAKPOINT_ORDER } from '@/utils/breakpoints'

const queryFor = (bp: Exclude<Breakpoint, 'base'>) =>
  `(min-width: ${BREAKPOINT_MIN_WIDTH[bp]}px)`

function getActiveBreakpoint(): Breakpoint {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'base'
  }
  let active: Breakpoint = 'base'
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === 'base') continue
    if (window.matchMedia(queryFor(bp)).matches) active = bp
  }
  return active
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }
  const lists = BREAKPOINT_ORDER.filter(
    (bp): bp is Exclude<Breakpoint, 'base'> => bp !== 'base',
  ).map((bp) => window.matchMedia(queryFor(bp)))
  lists.forEach((mql) => mql.addEventListener('change', onChange))
  return () => lists.forEach((mql) => mql.removeEventListener('change', onChange))
}

/**
 * Returns the active Tailwind breakpoint using `matchMedia`, driven by the same
 * widths the class maps in `utils/breakpoints.ts` are derived from.
 */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getActiveBreakpoint, () => 'base')
}
