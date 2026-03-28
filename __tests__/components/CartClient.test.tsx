// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CartClient } from '@/components/checkout/CartClient'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('@/components/ui/TrustStrip', () => ({
  TrustStrip: () => <div data-testid="trust-strip" />,
}))

beforeEach(() => {
  vi.resetAllMocks()
})

const CART_WITH_ITEM = {
  id: 'c1',
  items: [
    {
      id: 'ci1',
      product_id: 'p1',
      quantity: 2,
      product: {
        id: 'p1',
        name: 'Oil Filter',
        slug: 'oil-filter',
        price: 1500,
        images: [],
        oem_part_number: 'OEM-123',
        sub_section: 'engine',
      },
    },
  ],
}

describe('CartClient', () => {
  it('shows loading skeleton initially', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {})) // never resolves
    const { container } = render(<CartClient />)
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('shows empty cart state when cart has no items', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(JSON.stringify({ id: 'c1', items: [] }), { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    expect(await screen.findByText(/your cart is empty/i)).toBeTruthy()
  })

  it('shows browse link when cart is empty', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(JSON.stringify({ id: 'c1', items: [] }), { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    expect(await screen.findByRole('link', { name: /browse parts/i })).toBeTruthy()
  })

  it('renders cart items from API', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(JSON.stringify(CART_WITH_ITEM), { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    expect(await screen.findByText('Oil Filter')).toBeTruthy()
  })

  it('shows total price for item (price × quantity)', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(JSON.stringify(CART_WITH_ITEM), { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    // 1500 × 2 = 3000
    expect(await screen.findByText('3,000')).toBeTruthy()
  })

  it('shows remove button for each cart item', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(JSON.stringify(CART_WITH_ITEM), { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    expect(await screen.findByRole('button', { name: /remove oil filter from cart/i })).toBeTruthy()
  })

  it('removes item from UI after clicking remove', async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(CART_WITH_ITEM), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 })) // DELETE response
    vi.stubGlobal('fetch', fetchMock)

    await act(async () => render(<CartClient />))
    const removeBtn = await screen.findByRole('button', { name: /remove oil filter from cart/i })

    await act(async () => {
      fireEvent.click(removeBtn)
    })

    expect(screen.queryByText('Oil Filter')).toBeNull()
  })

  it('dispatches cart:updated event after removing item', async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(CART_WITH_ITEM), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const dispatched: string[] = []
    window.addEventListener('cart:updated', () => dispatched.push('cart:updated'))

    await act(async () => render(<CartClient />))
    const removeBtn = await screen.findByRole('button', { name: /remove oil filter from cart/i })

    await act(async () => {
      fireEvent.click(removeBtn)
    })

    expect(dispatched).toContain('cart:updated')
  })

  it('shows empty state when API returns no cart', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response('{}', { status: 200 }))
    )
    await act(async () => render(<CartClient />))
    expect(await screen.findByText(/your cart is empty/i)).toBeTruthy()
  })
})
