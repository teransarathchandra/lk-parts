// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/ui/Navbar'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// CartIcon does its own fetch — stub it
vi.mock('@/components/ui/CartIcon', () => ({
  CartIcon: () => <button aria-label="Cart">Cart</button>,
}))

describe('Navbar', () => {
  it('renders the site logo linking to home', () => {
    render(<Navbar />)
    // The LK span is aria-hidden; accessible name is "Parts"
    const logo = screen.getByRole('link', { name: 'Parts' })
    expect(logo.getAttribute('href')).toBe('/')
  })

  it('renders search link', () => {
    render(<Navbar />)
    const searchLink = screen.getByRole('link', { name: /search parts/i })
    expect(searchLink.getAttribute('href')).toBe('/search')
  })

  it('renders CartIcon', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /cart/i })).toBeTruthy()
  })

  it('renders main navigation header', () => {
    render(<Navbar />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })
})
