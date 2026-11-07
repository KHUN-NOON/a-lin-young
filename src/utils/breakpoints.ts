import type {
  Breakpoint,
  CardListLayout,
  ColumnCount,
  ResponsiveValue,
} from '@/types'

/**
 * Single source of truth for breakpoints. The JS column count (matchMedia) and
 * the Tailwind class maps below are both derived from this order/these widths,
 * so they cannot drift apart. Values mirror Tailwind v4 defaults.
 */
export const BREAKPOINT_ORDER: ReadonlyArray<Breakpoint> = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
]

export const BREAKPOINT_MIN_WIDTH: Record<Exclude<Breakpoint, 'base'>, number> =
  {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }

/** Mobile-first cascade: the value of the largest specified breakpoint <= active. */
export function resolveResponsive<T>(
  value: ResponsiveValue<T>,
  active: Breakpoint,
): T {
  let result = value.base
  for (const bp of BREAKPOINT_ORDER) {
    const candidate = value[bp]
    if (candidate !== undefined) result = candidate
    if (bp === active) break
  }
  return result
}

// NOTE: class names are written out literally so Tailwind can statically detect them.
const DISPLAY_CLASS: Record<Breakpoint, Record<CardListLayout, string>> = {
  base: { list: 'flex flex-col', grid: 'grid' },
  sm: { list: 'sm:flex sm:flex-col', grid: 'sm:grid' },
  md: { list: 'md:flex md:flex-col', grid: 'md:grid' },
  lg: { list: 'lg:flex lg:flex-col', grid: 'lg:grid' },
  xl: { list: 'xl:flex xl:flex-col', grid: 'xl:grid' },
  '2xl': { list: '2xl:flex 2xl:flex-col', grid: '2xl:grid' },
}

const GRID_COLS_CLASS: Record<Breakpoint, Record<ColumnCount, string>> = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
  '2xl': {
    1: '2xl:grid-cols-1',
    2: '2xl:grid-cols-2',
    3: '2xl:grid-cols-3',
    4: '2xl:grid-cols-4',
    5: '2xl:grid-cols-5',
    6: '2xl:grid-cols-6',
  },
}

/** Effective column count at a breakpoint (lists are always 1 column). */
export function resolveColumns(
  layout: ResponsiveValue<CardListLayout>,
  columns: ResponsiveValue<ColumnCount>,
  active: Breakpoint,
): ColumnCount {
  return resolveResponsive(layout, active) === 'list'
    ? 1
    : resolveResponsive(columns, active)
}

/**
 * Build the responsive display / grid-cols classes. Only emits a class at a
 * breakpoint when the layout or column count actually changes there.
 */
export function buildLayoutClasses(
  layout: ResponsiveValue<CardListLayout>,
  columns: ResponsiveValue<ColumnCount>,
): string {
  const classes: Array<string> = []
  let prevLayout: CardListLayout | undefined
  let prevCols: ColumnCount | undefined

  for (const bp of BREAKPOINT_ORDER) {
    const layoutAt = resolveResponsive(layout, bp)
    const colsAt = resolveColumns(layout, columns, bp)
    if (layoutAt !== prevLayout) classes.push(DISPLAY_CLASS[bp][layoutAt])
    if (layoutAt === 'grid' && (colsAt !== prevCols || prevLayout === 'list')) {
      classes.push(GRID_COLS_CLASS[bp][colsAt])
    }
    prevLayout = layoutAt
    prevCols = colsAt
  }
  return classes.join(' ')
}
