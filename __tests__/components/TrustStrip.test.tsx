// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrustStrip } from '@/components/ui/TrustStrip'

describe('TrustStrip', () => {
  it('renders 7-day return and secure checkout items', () => {
    render(<TrustStrip />)
    expect(screen.getByText(/7-day return/)).toBeTruthy()
    expect(screen.getByText(/Secure checkout/)).toBeTruthy()
  })

  it('hides WhatsApp link when supportPhone is not provided', () => {
    render(<TrustStrip />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })

  it('shows WhatsApp link when supportPhone is provided', () => {
    render(<TrustStrip supportPhone="94771234567" />)
    const link = screen.getByText(/WhatsApp support/)
    expect(link).toBeTruthy()
    expect(link.closest('a')?.getAttribute('href')).toContain('wa.me/94771234567')
  })

  it('hides WhatsApp link when supportPhone is empty string', () => {
    render(<TrustStrip supportPhone="" />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })

  it('hides WhatsApp link when supportPhone is null', () => {
    render(<TrustStrip supportPhone={null} />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })
})
