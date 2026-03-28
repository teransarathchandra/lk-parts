// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/ui/Footer'

describe('Footer', () => {
  it('renders LK Parts brand text', () => {
    render(<Footer />)
    expect(screen.getAllByText(/LK Parts/).length).toBeGreaterThan(0)
  })

  it('renders Returns Policy link', () => {
    render(<Footer />)
    expect(screen.getByText('Returns Policy')).toBeTruthy()
  })

  it('shows WhatsApp link when supportPhone is provided', () => {
    render(<Footer supportPhone="94771234567" />)
    const link = screen.getByRole('link', { name: /whatsapp support/i })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toContain('wa.me/94771234567')
  })

  it('hides WhatsApp line when supportPhone is not provided', () => {
    render(<Footer />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })

  it('hides WhatsApp line when supportPhone is empty string', () => {
    render(<Footer supportPhone="" />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })

  it('hides WhatsApp line when supportPhone is null', () => {
    render(<Footer supportPhone={null} />)
    expect(screen.queryByText(/WhatsApp/)).toBeNull()
  })
})
