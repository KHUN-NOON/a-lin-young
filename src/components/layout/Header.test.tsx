import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Header } from './Header'
import { ThemeProvider } from '@/context/ThemeContext'
import { LayoutProvider, useLayout } from '@/context/LayoutContext'
import { setViewportWidth } from '@/test/setup'

function MobileState() {
  const { mobileOpen, expanded } = useLayout()
  return (
    <output>
      {`mobile:${mobileOpen} expanded:${expanded}`}
    </output>
  )
}

const setup = () =>
  render(
    <ThemeProvider>
      <LayoutProvider>
        <Header />
        <MobileState />
      </LayoutProvider>
    </ThemeProvider>,
  )

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setViewportWidth(390)
  })

  it('toggle button opens the mobile drawer state on small screens', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }))
    expect(screen.getByRole('status')).toHaveTextContent('mobile:true')
  })

  it('toggle button expands the rail on md+ screens', async () => {
    setViewportWidth(1280)
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }))
    expect(screen.getByRole('status')).toHaveTextContent('expanded:true')
  })

  it('theme toggle flips the dark class and persists the choice', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(
      screen.getByRole('button', { name: /switch to (dark|light) mode/i }),
    )
    const isDark = document.documentElement.classList.contains('dark')
    expect(localStorage.getItem('theme')).toBe(isDark ? 'dark' : 'light')
  })

  it('the ⋯ button reveals the header actions on mobile', async () => {
    const user = userEvent.setup()
    setup()
    const more = screen.getByRole('button', { name: /toggle header actions/i })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    await user.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
  })
})
