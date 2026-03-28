// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VehicleSelector } from '@/components/catalog/VehicleSelector'
import type { Vehicle } from '@/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const VEHICLES: Vehicle[] = [
  { id: 'v1', type: 'car', brand: 'Toyota', model: 'Prius', variant: null, year_from: 2018, year_to: null, slug: 'toyota-prius', is_active: true, created_at: '' },
  { id: 'v2', type: 'car', brand: 'Toyota', model: 'Aqua', variant: null, year_from: 2019, year_to: null, slug: 'toyota-aqua', is_active: true, created_at: '' },
  { id: 'v3', type: 'bike', brand: 'Honda', model: 'CB150R', variant: 'ABS', year_from: 2020, year_to: null, slug: 'honda-cb150r-abs', is_active: true, created_at: '' },
  { id: 'v4', type: 'bike', brand: 'Honda', model: 'CB150R', variant: 'Non-ABS', year_from: 2020, year_to: null, slug: 'honda-cb150r', is_active: true, created_at: '' },
]

describe('VehicleSelector', () => {
  it('renders type select with vehicle types', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    expect(screen.getByLabelText(/vehicle type/i)).toBeTruthy()
    expect(screen.getByRole('option', { name: /car/i })).toBeTruthy()
    expect(screen.getByRole('option', { name: /motorcycle/i })).toBeTruthy()
  })

  it('brand select is disabled until type is chosen', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    expect(screen.getByLabelText(/brand/i)).toBeDisabled()
  })

  it('enables brand select after selecting a type', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    expect(screen.getByLabelText(/brand/i)).not.toBeDisabled()
  })

  it('filters brands by selected type', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    expect(screen.getByRole('option', { name: 'Toyota' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Honda' })).toBeNull()
  })

  it('model select is disabled until brand is chosen', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    expect(screen.getByLabelText(/model/i)).toBeDisabled()
  })

  it('filters models by type + brand', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Toyota' } })
    expect(screen.getByRole('option', { name: 'Prius' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Aqua' })).toBeTruthy()
  })

  it('CTA button is disabled when no vehicle selected', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('CTA button shows model name when vehicle is selected', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Toyota' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Prius' } })
    expect(screen.getByRole('button')).not.toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent('Show parts for Prius')
  })

  it('shows variant select when model has variants', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'bike' } })
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Honda' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'CB150R' } })
    expect(screen.getByLabelText(/variant/i)).toBeTruthy()
  })

  it('resets downstream selects when type changes', () => {
    render(<VehicleSelector vehicles={VEHICLES} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Toyota' } })
    // Change type — brand should reset
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'bike' } })
    expect((screen.getByLabelText(/brand/i) as HTMLSelectElement).value).toBe('')
  })

  it('hides CTA when showCta=false', () => {
    render(<VehicleSelector vehicles={VEHICLES} showCta={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('calls onSelect when vehicle is selected and button clicked', () => {
    const onSelect = vi.fn()
    render(<VehicleSelector vehicles={VEHICLES} onSelect={onSelect} />)
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: 'car' } })
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Toyota' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Prius' } })
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'v1' }))
  })
})
