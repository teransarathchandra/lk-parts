// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AddToCartButton } from '@/components/catalog/AddToCartButton'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('AddToCartButton', () => {
  it('shows idle label by default', () => {
    render(<AddToCartButton productId="p1" productName="Oil Filter" />)
    expect(screen.getByRole('button')).toHaveTextContent('Add to cart')
  })

  it('shows Adding... while fetch is in flight', async () => {
    let resolve: (value: Response) => void
    const promise = new Promise<Response>((r) => (resolve = r))
    vi.stubGlobal('fetch', () => promise)

    render(<AddToCartButton productId="p1" productName="Oil Filter" />)
    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByText('Adding...')).toBeTruthy()
    resolve!(new Response('{}', { status: 200 }))
  })

  it('shows Added ✓ on success and dispatches cart:updated', async () => {
    const dispatched: string[] = []
    window.addEventListener('cart:updated', () => dispatched.push('cart:updated'))

    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response('{}', { status: 200 }))
    )

    render(<AddToCartButton productId="p1" productName="Oil Filter" />)
    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByText('Added ✓')).toBeTruthy()
    expect(dispatched).toContain('cart:updated')
  })

  it('shows error message on failure', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Out of stock' }), { status: 400 })
      )
    )

    render(<AddToCartButton productId="p1" productName="Oil Filter" />)
    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Out of stock')
  })

  it('resets to idle after 2s on success', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response('{}', { status: 200 }))
    )

    render(<AddToCartButton productId="p1" productName="Oil Filter" />)
    fireEvent.click(screen.getByRole('button'))

    await screen.findByText('Added ✓')
    // Wait for the 2s reset timeout
    await new Promise((r) => setTimeout(r, 2100))
    expect(screen.getByRole('button')).toHaveTextContent('Add to cart')
  }, 10000)
})
