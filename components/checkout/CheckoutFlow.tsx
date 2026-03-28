'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isValidPhone, normalizePhone } from '@/lib/utils/phone'
import type { ShippingAddress } from '@/types'
import { CheckoutSteps } from './CheckoutSteps'

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
    'min-h-[44px] w-full rounded-[2px] border border-[var(--border)] px-3 py-2 text-[15px] focus:border-[var(--accent)] focus:outline-none'
  const labelClass = 'block mb-1 text-[13px] font-medium text-[var(--text-secondary)]'

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
        <div className="mb-4 rounded-[4px] border border-[var(--accent)] bg-[var(--accent-light)] p-3 text-[13px] text-[var(--accent)]" role="alert">
          {error}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <label htmlFor="phone" className={labelClass}>Phone number</label>
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
            <label htmlFor="name" className={labelClass}>Full name</label>
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
          <div>
            <label htmlFor="address1" className={labelClass}>Delivery address</label>
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
              <label htmlFor="city" className={labelClass}>City</label>
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
              <label htmlFor="district" className={labelClass}>District</label>
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
            className="min-h-[44px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {otpSending ? 'Sending...' : 'Continue →'}
          </button>
        </form>
      )}

      {/* Step 2: OTP verification */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <p className="text-[15px] text-[var(--text-secondary)] text-center">
            We sent a code to {phone.startsWith('0') ? phone : `0${phone}`}
          </p>
          <div>
            <label htmlFor="otp" className={labelClass}>6-digit code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className={`${inputClass} tracking-[0.3em] text-center text-[22px]`}
              placeholder="_ _ _ _ _ _"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
            />
            {otpError && (
              <p className="mt-1 text-[13px] text-[var(--accent)]" role="alert">{otpError}</p>
            )}
          </div>
          <p className="text-center text-[13px] text-[var(--text-secondary)]">
            {countdown > 0 ? (
              `Resend code (${countdown}s)`
            ) : (
              <button
                type="button"
                onClick={() => { startCountdown() }}
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
            <p className="font-medium mb-1">{name}</p>
            <p className="text-[var(--text-secondary)] text-[13px]">
              {address.address_line1}, {address.city}, {address.district}
            </p>
            <p className="text-[var(--text-secondary)] text-[13px]">{phone}</p>
          </div>

          <div className="rounded-[8px] border border-[var(--border)] p-4">
            <div className="flex justify-between text-[15px] mb-2">
              <span className="text-[var(--text-secondary)]">Delivery fee</span>
              <span>LKR 350</span>
            </div>
          </div>

          {/* Payment method segmented control */}
          <div>
            <p className={labelClass}>Payment method</p>
            <div
              role="tablist"
              className="flex rounded-[4px] border border-[var(--border)] overflow-hidden"
            >
              {[
                { value: 'cod' as const, label: 'Cash on Delivery' },
                { value: 'koko' as const, label: 'Koko Pay' },
              ].map((option) => (
                <button
                  key={option.value}
                  role="tab"
                  type="button"
                  aria-selected={paymentMethod === option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={`min-h-[44px] flex-1 px-3 py-2 text-[14px] font-medium transition-colors ${
                    paymentMethod === option.value
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') setPaymentMethod('koko')
                    if (e.key === 'ArrowLeft') setPaymentMethod('cod')
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {paymentMethod === 'cod' && (
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
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
            className="min-h-[44px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {placing
              ? paymentMethod === 'koko'
                ? 'Redirecting to Koko...'
                : 'Placing order...'
              : `Place Order (${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Koko Pay'})`}
          </button>
        </form>
      )}
    </div>
  )
}
