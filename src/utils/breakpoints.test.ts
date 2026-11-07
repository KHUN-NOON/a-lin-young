import { describe, expect, it } from 'vitest'
import {
  buildLayoutClasses,
  resolveColumns,
  resolveResponsive,
} from './breakpoints'

describe('breakpoints', () => {
  it('cascades mobile-first', () => {
    const v = { base: 1, md: 2, xl: 4 } as const
    expect(resolveResponsive(v, 'base')).toBe(1)
    expect(resolveResponsive(v, 'sm')).toBe(1)
    expect(resolveResponsive(v, 'lg')).toBe(2)
    expect(resolveResponsive(v, '2xl')).toBe(4)
  })

  it('forces one column while the layout is a list', () => {
    const layout = { base: 'list', md: 'grid' } as const
    const columns = { base: 3, md: 3 } as const
    expect(resolveColumns(layout, columns, 'sm')).toBe(1)
    expect(resolveColumns(layout, columns, 'md')).toBe(3)
  })

  it('emits statically-known classes that match the JS column count', () => {
    const classes = buildLayoutClasses(
      { base: 'list', md: 'grid' },
      { base: 1, sm: 2, lg: 3, xl: 4 },
    )
    expect(classes).toBe(
      'flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    )
  })
})
