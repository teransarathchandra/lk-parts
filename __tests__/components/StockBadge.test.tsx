// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockBadge } from '@/components/ui/StockBadge'

describe('StockBadge', () => {
  it('shows Out of stock pill for quantity 0', () => {
    render(<StockBadge quantity={0} />)
    expect(screen.getByText('Out of stock')).toBeTruthy()
  })

  it('shows Low Stock pill when quantity is at or below threshold', () => {
    render(<StockBadge quantity={3} lowStockThreshold={5} />)
    expect(screen.getByText('Low Stock (3)')).toBeTruthy()
  })

  it('shows In Stock green pill for normal stock levels', () => {
    const { container } = render(<StockBadge quantity={20} />)
    const badge = screen.getByText('In Stock (20)')
    expect(badge).toBeTruthy()
    // Should have emerald background class
    expect(badge.className).toContain('bg-emerald-50')
  })

  it('uses default threshold of 5', () => {
    render(<StockBadge quantity={5} />)
    expect(screen.getByText('Low Stock (5)')).toBeTruthy()
  })

  it('shows In Stock when quantity is exactly threshold + 1', () => {
    render(<StockBadge quantity={6} lowStockThreshold={5} />)
    expect(screen.getByText('In Stock (6)')).toBeTruthy()
  })
})
