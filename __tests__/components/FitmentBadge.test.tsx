// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FitmentBadge } from '@/components/ui/FitmentBadge'

describe('FitmentBadge', () => {
  it('shows Exact Fit when type=exact and no vehicleName', () => {
    render(<FitmentBadge fitmentType="exact" />)
    expect(screen.getByText('Exact Fit')).toBeTruthy()
  })

  it('shows vehicle name when type=exact and vehicleName provided', () => {
    render(<FitmentBadge fitmentType="exact" vehicleName="Honda Civic" />)
    expect(screen.getByText('Fits your Honda Civic')).toBeTruthy()
  })

  it('shows aria-label with vehicle name for exact fit', () => {
    render(<FitmentBadge fitmentType="exact" vehicleName="Toyota Prius" />)
    expect(screen.getByLabelText(/fits your toyota prius/i)).toBeTruthy()
  })

  it('shows guarantee text when showGuarantee=true', () => {
    render(<FitmentBadge fitmentType="exact" showGuarantee />)
    expect(screen.getByText(/wrong part.*free return/i)).toBeTruthy()
  })

  it('hides guarantee text by default', () => {
    render(<FitmentBadge fitmentType="exact" />)
    expect(screen.queryByText(/wrong part/i)).toBeNull()
  })

  it('shows Compatible when type=compatible and no vehicleName', () => {
    render(<FitmentBadge fitmentType="compatible" />)
    expect(screen.getByText('Compatible')).toBeTruthy()
  })

  it('shows "May fit" with vehicle name when type=compatible', () => {
    render(<FitmentBadge fitmentType="compatible" vehicleName="Yamaha FZ" />)
    expect(screen.getByText('May fit your Yamaha FZ')).toBeTruthy()
  })

  it('shows "Fitment not verified" when type=unknown', () => {
    render(<FitmentBadge fitmentType="unknown" />)
    expect(screen.getByText('Fitment not verified')).toBeTruthy()
  })

  it('shows vehicle-specific message when type=unknown with vehicleName', () => {
    render(<FitmentBadge fitmentType="unknown" vehicleName="Suzuki Alto" />)
    expect(screen.getByText(/fitment not verified for your suzuki alto/i)).toBeTruthy()
  })
})
