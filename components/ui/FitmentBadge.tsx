'use client'

import type { FitmentType } from '@/types'

interface FitmentBadgeProps {
  fitmentType: FitmentType
  vehicleName?: string
  showGuarantee?: boolean
  className?: string
}

export function FitmentBadge({
  fitmentType,
  vehicleName,
  showGuarantee = false,
  className = '',
}: FitmentBadgeProps) {
  if (fitmentType === 'exact') {
    return (
      <div className={className}>
        <span
          className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] font-semibold text-white"
          style={{ backgroundColor: 'var(--fit-exact-bg)' }}
          aria-label={
            vehicleName
              ? `Fits your ${vehicleName} — wrong part free return guaranteed`
              : 'Exact fit confirmed'
          }
        >
          ✓ {vehicleName ? `Fits your ${vehicleName}` : 'Exact Fit'}
        </span>
        {showGuarantee && (
          <p className="mt-2 rounded-[4px] border border-[#065F46] bg-emerald-50 px-3 py-2 text-[13px] text-[#065F46]">
            🛡 Wrong part? Free return within 7 days — guaranteed.
          </p>
        )}
      </div>
    )
  }

  if (fitmentType === 'compatible') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] font-semibold text-white ${className}`}
        style={{ backgroundColor: 'var(--fit-compat-bg)' }}
      >
        ⚠ {vehicleName ? `May fit your ${vehicleName}` : 'Compatible'}
      </span>
    )
  }

  // Unknown
  return (
    <span
      className={`text-[12px] font-normal ${className}`}
      style={{ color: 'var(--fit-unknown)' }}
    >
      {vehicleName
        ? `Fitment not verified for your ${vehicleName}`
        : 'Fitment not verified'}
    </span>
  )
}
