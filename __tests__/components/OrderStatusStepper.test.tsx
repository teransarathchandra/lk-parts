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

  it('shows raw status text for off-happy-path statuses', () => {
    render(<OrderStatusStepper status="payment_failed" />)
    expect(screen.getByText(/payment failed/i)).toBeTruthy()
  })

  it('shows raw status text for cancelled status', () => {
    render(<OrderStatusStepper status="cancelled" />)
    expect(screen.getByText(/cancelled/i)).toBeTruthy()
  })

  it('does not throw for unknown status values', () => {
    expect(() =>
      render(<OrderStatusStepper status={'mystery_status' as never} />)
    ).not.toThrow()
  })
})
