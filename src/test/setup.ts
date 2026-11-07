import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// --- Observers -------------------------------------------------------------
export class MockIntersectionObserver {
  static instances: Array<MockIntersectionObserver> = []
  callback: IntersectionObserverCallback
  elements = new Set<Element>()
  disconnected = false
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }
  observe(el: Element) {
    this.elements.add(el)
  }
  unobserve(el: Element) {
    this.elements.delete(el)
  }
  disconnect() {
    this.disconnected = true
    this.elements.clear()
  }
  takeRecords() {
    return []
  }
  trigger(isIntersecting: boolean) {
    this.callback(
      Array.from(this.elements).map(
        (target) => ({ isIntersecting, target }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    )
  }
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
vi.stubGlobal('ResizeObserver', MockResizeObserver)

// --- matchMedia: viewport width controlled by tests -------------------------
let viewportWidth = 1280
const listeners = new Set<() => void>()

export function setViewportWidth(width: number) {
  viewportWidth = width
  listeners.forEach((l) => l())
}

window.matchMedia = ((query: string) => {
  const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0)
  return {
    get matches() {
      return viewportWidth >= min
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  }
}) as unknown as typeof window.matchMedia

// --- Element sizes: give the virtualizer a real viewport in jsdom ------------
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return 600
  },
})
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return 1000
  },
})
Element.prototype.scrollTo = () => undefined
Element.prototype.scrollIntoView = () => undefined
window.scrollTo = () => undefined
