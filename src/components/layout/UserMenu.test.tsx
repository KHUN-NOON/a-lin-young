import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { UserMenu } from './UserMenu'

describe('UserMenu', () => {
  it('opens, lists items, and closes on Escape returning focus', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    const trigger = screen.getByRole('button', { name: /open user menu/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /edit profile/i })).toHaveFocus()
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /open user menu/i }))
    await user.keyboard('{ArrowDown}')
    expect(
      screen.getByRole('menuitem', { name: /account settings/i }),
    ).toHaveFocus()
  })

  it('closes on outside click', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <UserMenu />
        <button type="button">outside</button>
      </div>,
    )
    await user.click(screen.getByRole('button', { name: /open user menu/i }))
    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
