// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartIcon } from '@/components/ui/CartIcon'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

beforeEach(() => {
  vi.resetAllMocks()
})

function mockCartResponse(items: { quantity: number }[]) {
  vi.stubGlobal('fetch', () =>
    Promise.resolve(new Response(JSON.stringify({ id: 'c1', items }), { status: 200 }))
  )
}

describe('CartIcon', () => {
  it('hides badge when cart is empty', async () => {
    mockCartResponse([])
    await act(async () => render(<CartIcon />))
    expect(screen.queryByText(/\d/)).toBeNull()
  })

  it('shows count from API', async () => {
    mockCartResponse([{ quantity: 3 }, { quantity: 2 }])
    await act(async () => render(<CartIcon />))
    expect(await screen.findByText('5')).toBeTruthy()
  })

  it('shows 9+ when count exceeds 9', async () => {
    mockCartResponse(Array.from({ length: 5 }, () => ({ quantity: 2 })))
    await act(async () => render(<CartIcon />))
    expect(await screen.findByText('9+')).toBeTruthy()
  })

  it('refreshes count when cart:updated fires', async () => {
    mockCartResponse([{ quantity: 1 }])
    await act(async () => render(<CartIcon />))
    expect(await screen.findByText('1')).toBeTruthy()

    mockCartResponse([{ quantity: 1 }, { quantity: 1 }])
    await act(async () => {
      window.dispatchEvent(new CustomEvent('cart:updated'))
    })
    expect(await screen.findByText('2')).toBeTruthy()
  })
})
