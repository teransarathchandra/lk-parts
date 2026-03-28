'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Vehicle, VehicleType } from '@/types'

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  onSelect?: (vehicle: Vehicle) => void
  showCta?: boolean
  className?: string
}

export function VehicleSelector({
  vehicles,
  onSelect,
  showCta = true,
  className = '',
}: VehicleSelectorProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<VehicleType | ''>('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')

  // Derived option lists (client-side cascade filtering)
  const types = Array.from(new Set(vehicles.map((v) => v.type))).sort()
  const brands = selectedType
    ? Array.from(
        new Set(
          vehicles.filter((v) => v.type === selectedType).map((v) => v.brand)
        )
      ).sort()
    : []
  const models = selectedBrand
    ? Array.from(
        new Set(
          vehicles
            .filter((v) => v.type === selectedType && v.brand === selectedBrand)
            .map((v) => v.model)
        )
      ).sort()
    : []
  const variants = selectedModel
    ? vehicles
        .filter(
          (v) =>
            v.type === selectedType &&
            v.brand === selectedBrand &&
            v.model === selectedModel
        )
        .map((v) => v.variant ?? '')
        .filter(Boolean)
        .sort()
    : []

  const selectedVehicle =
    selectedType && selectedBrand && selectedModel
      ? vehicles.find(
          (v) =>
            v.type === selectedType &&
            v.brand === selectedBrand &&
            v.model === selectedModel &&
            (variants.length === 0 || v.variant === selectedVariant)
        ) ?? null
      : null

  function handleTypeChange(type: VehicleType | '') {
    setSelectedType(type)
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedVariant('')
  }

  function handleBrandChange(brand: string) {
    setSelectedBrand(brand)
    setSelectedModel('')
    setSelectedVariant('')
  }

  function handleModelChange(model: string) {
    setSelectedModel(model)
    setSelectedVariant('')
  }

  function handleShowParts() {
    if (!selectedVehicle) return
    onSelect?.(selectedVehicle)
    const [type, brand, model, variant] = selectedVehicle.slug.split('-').join('/').split('/')
    router.push(`/parts/${selectedVehicle.slug}`)
  }

  const labelClass = 'block text-[13px] font-medium text-[var(--text-secondary)] mb-1'
  const selectClass =
    'w-full min-h-[44px] rounded-[2px] border border-[var(--border)] bg-white px-3 py-2 text-[15px] text-[var(--text-primary)] disabled:text-[var(--text-secondary)] disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Type */}
      <div>
        <label htmlFor="vs-type" className={labelClass}>
          Vehicle type
        </label>
        <select
          id="vs-type"
          className={selectClass}
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value as VehicleType | '')}
        >
          <option value="">Select type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t === 'bike' ? 'Motorcycle' : t === 'car' ? 'Car' : t === 'van' ? 'Van' : '3-Wheeler'}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="vs-brand" className={labelClass}>
          Brand
        </label>
        <select
          id="vs-brand"
          className={selectClass}
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          disabled={!selectedType}
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label htmlFor="vs-model" className={labelClass}>
          Model
        </label>
        <select
          id="vs-model"
          className={selectClass}
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!selectedBrand}
        >
          <option value="">Select model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Variant (if available) */}
      {variants.length > 0 && (
        <div>
          <label htmlFor="vs-variant" className={labelClass}>
            Variant
          </label>
          <select
            id="vs-variant"
            className={selectClass}
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            disabled={!selectedModel}
          >
            <option value="">Select variant</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {showCta && (
        <button
          onClick={handleShowParts}
          disabled={!selectedVehicle}
          className="min-h-[44px] w-full rounded-[4px] bg-[var(--accent)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedVehicle ? `Show parts for ${selectedModel}` : 'Select your vehicle first'}
        </button>
      )}
    </div>
  )
}
