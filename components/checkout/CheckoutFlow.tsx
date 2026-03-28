'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isValidPhone, normalizePhone } from '@/lib/utils/phone'
import type { ShippingAddress } from '@/types'
import { CheckoutSteps } from './CheckoutSteps'

const STEPS = ['Your details', 'Verify', 'Review + Pay']

type Step = 1 | 2 | 3

export function CheckoutFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState<Partial<ShippingAddress>>({})
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'koko'>('cod')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Step 1: send OTP
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidPhone(phone)) {
      setError('Enter a valid Sri Lanka mobile number (07X XXXX XXX)')
      return
    }
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!address.address_line1 || !address.city || !address.district) {
      setError('Delivery address is required')
      return
    }
    setError('')
    setOtpSending(true)

    // In a real implementation, trigger Supabase phone OTP here.
    // Simulated for now — advance to step 2.
    setOtpSending(false)
    setStep(2)
    startCountdown()
  }

  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(58)
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  // Step 2: verify OTP
  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code')
      return
    }
    setOtpVerifying(true)
    setOtpError('')

    // In production: supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    // Simulated:
    await new Promise((r) => setTimeout(r, 800))
    setOtpVerifying(false)
    setStep(3)
  }

  // Step 3: place order
  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    setPlacing(true)
    setError('')

    try {
      const normalizedPhone = normalizePhone(phone)
      const shippingAddress: ShippingAddress = {
        name,
        phone: normalizedPhone,
        address_line1: address.address_line1!,
        address_line2: address.address_line2,
        city: address.city!,
        district: address.district!,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to place order')
      }

      if (paymentMethod === 'koko' && data.redirect_url) {
        window.location.href = data.redirect_url
        return
      }

      router.push(`/orders/${data.order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
      setPlacing(false)
    }
  }

  const inputClass =
    'min-h-[48px] w-full rounded-[4px] border border-[var(--border)] px-3.5 py-2 text-[15px] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus:outline-none transition-colors'
  const labelClass = 'block mb-1.5 text-[13px] font-semibold text-[var(--text-primary)]'

  return (
    <div>
      <CheckoutSteps currentStep={step} />

      <h1
        className="mb-6 text-center text-[20px] font-semibold text-[var(--text-primary)]"
        style={{ letterSpacing: '-0.01em' }}
      >
        Step {step}/3 — {STEPS[step - 1]}
      </h1>

      {error && (
        <div
          className="mb-4 rounded-[4px] border border-[var(--accent)] bg-[var(--accent-light)] p-3 text-[13px] text-[var(--accent)]"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              className={inputClass}
              placeholder="077 XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="tel"
            />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <p className="mb-2 mt-4 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Delivery address
          </p>

          <div>
            <label htmlFor="address1" className={labelClass}>
              Address line 1
            </label>
            <input
              id="address1"
              type="text"
              className={inputClass}
              placeholder="Address line 1"
              value={address.address_line1 ?? ''}
              onChange={(e) => setAddress((a) => ({ ...a, address_line1: e.target.value }))}
              required
            />
          </div>
          <div>
            <input
              type="text"
              className={inputClass}
              placeholder="Address line 2 (optional)"
              value={address.address_line2 ?? ''}
              onChange={(e) => setAddress((a) => ({ ...a, address_line2: e.target.value }))}
              aria-label="Address line 2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className={labelClass}>
                City
              </label>
              <input
                id="city"
                type="text"
                className={inputClass}
                placeholder="Colombo"
                value={address.city ?? ''}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="district" className={labelClass}>
                District
              </label>
              <input
                id="district"
                type="text"
                className={inputClass}
                placeholder="Colombo"
                value={address.district ?? ''}
                onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={otpSending}
            className="min-h-[52px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {otpSending ? 'Sending...' : 'Continue →'}
          </button>
        </form>
      )}

      {/* Step 2: OTP verification */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <div className="mb-4 flex justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--accent)]"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-center text-[17px] font-medium text-[var(--text-primary)]">
            We sent a code to{' '}
            <span className="font-semibold">
              {phone.startsWith('0') ? phone : `0${phone}`}
            </span>
          </p>
          <div>
            <label htmlFor="otp" className={labelClass}>
              6-digit code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className={`${inputClass} text-center tracking-[0.3em] text-[28px]`}
              placeholder="_ _ _ _ _ _"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
            />
            {otpError && (
              <p className="mt-1 text-[13px] text-[var(--accent)]" role="alert">
                {otpError}
              </p>
            )}
          </div>
          <p className="text-center text-[13px] text-[var(--text-secondary)]">
            {countdown > 0 ? (
              <>
                Resend code (
                <span className="tabular-nums">{countdown}s</span>)
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  startCountdown()
                }}
                className="text-[var(--accent)] hover:underline"
              >
                Resend code
              </button>
            )}
          </p>
          <button
            type="submit"
            disabled={otpVerifying}
            className="min-h-[44px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {otpVerifying ? 'Verifying...' : 'Continue →'}
          </button>
        </form>
      )}

      {/* Step 3: Review + Pay */}
      {step === 3 && (
        <form onSubmit={handlePlaceOrder} className="space-y-5">
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-subtle)] p-4 text-[15px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 font-medium">{name}</p>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {address.address_line1}, {address.city}, {address.district}
                </p>
                <p className="text-[13px] text-[var(--text-secondary)]">{phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[13px] text-[var(--accent)] hover:underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="rounded-[8px] border border-[var(--border)] p-4">
            <div className="flex justify-between text-[15px]">
              <span className="text-[var(--text-secondary)]">Delivery fee</span>
              <span>LKR 350</span>
            </div>
          </div>

          {/* Payment method segmented control */}
          <div>
            <p className={labelClass}>Payment method</p>
            <div
              role="tablist"
              className="flex overflow-hidden rounded-[4px] border border-[var(--border)]"
            >
              {[
                {
                  value: 'cod' as const,
                  label: 'Cash on Delivery',
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 14h2M10 14h2" />
                    </svg>
                  ),
                },
                {
                  value: 'koko' as const,
                  label: 'Koko Pay',
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <path d="M1 10h22" />
                    </svg>
                  ),
                },
              ].map((option) => (
                <button
                  key={option.value}
                  role="tab"
                  type="button"
                  aria-selected={paymentMethod === option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 px-3 py-2 text-[14px] font-medium transition-colors ${
                    paymentMethod === option.value
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') setPaymentMethod('koko')
                    if (e.key === 'ArrowLeft') setPaymentMethod('cod')
                  }}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            {paymentMethod === 'cod' && (
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 5v3h-7" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Pay when your order is delivered. We'll call to confirm.
              </p>
            )}
            {paymentMethod === 'koko' && (
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                Pay securely via Koko. You'll be redirected to complete payment.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={placing}
            className="min-h-[56px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[16px] font-bold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {placing
              ? paymentMethod === 'koko'
                ? 'Redirecting to Koko...'
                : 'Placing order...'
              : `Place Order (${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Koko Pay'})`}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Secured checkout · Your data is safe
          </p>
        </form>
      )}
    </div>
  )
}
