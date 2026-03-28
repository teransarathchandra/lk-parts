// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'

describe('CheckoutSteps', () => {
  it('marks step 1 as active with aria-current=step', () => {
    const { container } = render(<CheckoutSteps currentStep={1} />)
    const activeCircle = container.querySelector('[aria-current="step"]')
    expect(activeCircle).not.toBeNull()
    expect(activeCircle?.textContent).toBe('1')
  })

  it('marks step 2 as active and step 1 as completed', () => {
    const { container } = render(<CheckoutSteps currentStep={2} />)
    const circles = container.querySelectorAll('.rounded-full')
    // Step 1 completed — shows SVG checkmark
    expect(circles[0].querySelector('svg')).not.toBeNull()
    // Step 2 should have aria-current
    const activeCircle = container.querySelector('[aria-current="step"]')
    expect(activeCircle?.textContent).toBe('2')
  })

  it('marks steps 1 and 2 as completed at step 3', () => {
    const { container } = render(<CheckoutSteps currentStep={3} />)
    const circles = container.querySelectorAll('.rounded-full')
    expect(circles[0].querySelector('svg')).not.toBeNull()
    expect(circles[1].querySelector('svg')).not.toBeNull()
    const activeCircle = container.querySelector('[aria-current="step"]')
    expect(activeCircle?.textContent).toBe('3')
  })

  it('renders nav with aria-label', () => {
    render(<CheckoutSteps currentStep={1} />)
    expect(screen.getByRole('navigation', { name: /checkout progress/i })).toBeTruthy()
  })
})
