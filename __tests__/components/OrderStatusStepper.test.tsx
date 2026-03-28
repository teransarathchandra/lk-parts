// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusStepper } from '@/components/ui/OrderStatusStepper'

describe('OrderStatusStepper', () => {
  it('shows Pending as active for created status', () => {
    const { container } = render(<OrderStatusStepper status="created" />)
    const circles = container.querySelectorAll('.rounded-full')
    // Step 1 (Pending) should have accent bg
    expect(circles[0].className).toContain('bg-[var(--accent)]')
  })

  it('shows Confirmed as active for paid status', () => {
    const { container } = render(<OrderStatusStepper status="paid" />)
    const circles = container.querySelectorAll('.rounded-full')
    // Step 1 completed, step 2 active
    expect(circles[0].className).toContain('bg-[var(--fit-exact-bg)]')
    expect(circles[1].className).toContain('bg-[var(--accent)]')
  })

  it('shows Shipped as active for shipped status', () => {
    const { container } = render(<OrderStatusStepper status="shipped" />)
    const circles = container.querySelectorAll('.rounded-full')
    expect(circles[2].className).toContain('bg-[var(--accent)]')
  })

  it('shows Delivered as active for delivered status', () => {
    const { container } = render(<OrderStatusStepper status="delivered" />)
    const circles = container.querySelectorAll('.rounded-full')
    expect(circles[3].className).toContain('bg-[var(--accent)]')
  })

  it('renders nothing for payment_failed status', () => {
    const { container } = render(<OrderStatusStepper status="payment_failed" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for cancelled status', () => {
    const { container } = render(<OrderStatusStepper status="cancelled" />)
    expect(container.firstChild).toBeNull()
  })

  it('does not throw for unknown status values', () => {
    expect(() =>
      render(<OrderStatusStepper status={'mystery_status' as never} />)
    ).not.toThrow()
  })
})
