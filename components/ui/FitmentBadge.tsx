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
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold text-white"
          style={{ backgroundColor: 'var(--fit-exact-bg)' }}
          aria-label={
            vehicleName
              ? `Fits your ${vehicleName} — wrong part free return guaranteed`
              : 'Exact fit confirmed'
          }
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {vehicleName ? `Fits your ${vehicleName}` : 'Exact Fit'}
        </span>
        {showGuarantee && (
          <p className="mt-2 border-l-4 border-[var(--fit-exact-bg)] bg-emerald-50 py-2.5 pl-4 pr-3 text-[13px] text-[var(--fit-exact-bg)]">
            🛡 Wrong part? Free return within 7 days — guaranteed.
          </p>
        )}
      </div>
    )
  }

  if (fitmentType === 'compatible') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold text-white ${className}`}
        style={{ backgroundColor: 'var(--fit-compat-bg)' }}
      >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 2L11 10H1L6 2z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M6 5.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="6" cy="8.5" r="0.5" fill="white"/>
        </svg>
        {vehicleName ? `May fit your ${vehicleName}` : 'Compatible'}
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
