import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** Keeps a ref pointing at the latest value so stable callbacks can read it. */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
