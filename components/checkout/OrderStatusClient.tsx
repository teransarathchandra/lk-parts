'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order } from '@/types'
import { OrderStatusStepper } from '@/components/ui/OrderStatusStepper'

const STATUS_LABELS: Record<string, string> = {
  created: 'Order placed',
  cod_confirmed: 'COD confirmed — awaiting dispatch',
  payment_initiated: 'Payment in progress',
  paid: 'Payment confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  closed: 'Closed',
  cancelled: 'Cancelled',
  payment_failed: 'Payment failed',
}

const POSITIVE_STATUSES = new Set(['created', 'cod_confirmed', 'processing', 'shipped', 'delivered'])

interface OrderStatusClientProps {
  orderId: string
}

export function OrderStatusClient({ orderId }: OrderStatusClientProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [verifyError, setVerifyError] = useState('')

  // Initial fetch: returns {id, status} only — no PII until phone verified
  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setOrder(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [orderId])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const last4 = phoneInput.replace(/\D/g, '')
    if (last4.length !== 4) return

    setVerifying(true)
    setVerifyError('')
    try {
      const res = await fetch(`/api/orders/${orderId}?phone_last4=${last4}`)
      if (res.status === 403) {
        setVerifyError('Phone number does not match. Check the last 4 digits.')
        setVerifying(false)
        return
      }
      if (!res.ok) {
        setVerifyError('Something went wrong. Please try again.')
        setVerifying(false)
        return
      }
      const data = await res.json()
      setOrder(data)
      setVerified(true)
    } catch {
      setVerifyError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-6 w-1/2 animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
        <div className="rounded-[8px] border border-[var(--border)] p-4">
          <div className="mb-4 flex justify-between">
            <div className="h-7 w-32 animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
            <div className="h-7 w-24 animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-[15px] text-[var(--text-secondary)]">Order not found.</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  // Phone verification gate
  if (!verified) {
    return (
      <div className="mx-auto max-w-xs">
        <div className="mb-6 flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[var(--border)]"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1
          className="mb-2 text-[22px] font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.01em' }}
        >
          Confirm your phone
        </h1>
        <p className="mb-6 text-[15px] text-[var(--text-secondary)]">
          Enter the last 4 digits of your phone number to view order details.
        </p>
        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]{4}"
            placeholder="4567"
            className="min-h-[44px] w-full rounded-[2px] border border-[var(--border)] px-3 py-2 text-center tracking-[0.4em] text-[32px] focus:border-[var(--accent)] focus:outline-none"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            autoFocus
          />
          <p className="mt-1 text-center text-[11px] text-[var(--text-secondary)]">
            e.g. if your number is 077 123 4567, enter 4567
          </p>
          {verifyError && (
            <p className="flex items-center gap-1.5 text-[13px] text-[var(--accent)]" role="alert">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              {verifyError}
            </p>
          )}
          <button
            type="submit"
            disabled={verifying}
            className="min-h-[48px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {verifying ? 'Checking...' : 'View order'}
          </button>
        </form>
      </div>
    )
  }

  // Order confirmed — show pending payment banner if applicable
  const isPendingKoko = order.status === 'payment_initiated'
  const isPositiveStatus = POSITIVE_STATUSES.has(order.status)

  return (
    <div>
      {isPendingKoko && (
        <div
          className="mb-4 rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800"
          role="status"
        >
          You have a payment in progress —{' '}
          <strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong>
        </div>
      )}

      {isPositiveStatus && (
        <div className="mb-6 flex items-center gap-3 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-emerald-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-[14px] font-semibold text-emerald-800">Order confirmed!</p>
            <p className="text-[12px] text-emerald-600">We'll contact you to confirm delivery.</p>
          </div>
        </div>
      )}

      <h1
        className="mb-4 text-[22px] font-semibold text-[var(--text-primary)]"
        style={{ letterSpacing: '-0.01em' }}
      >
        <span className="font-mono text-[14px] font-bold text-[var(--text-secondary)]">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </h1>

      <OrderStatusStepper status={order.status} />

      <p className="mb-5 text-[15px] text-[var(--text-secondary)]">
        Status:{' '}
        <strong className="text-[var(--text-primary)]">
          {STATUS_LABELS[order.status] ?? order.status}
        </strong>
      </p>

      {/* Order items */}
      <div className="mb-5 space-y-3">
        {(order.items ?? []).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-[8px] border border-[var(--border)] px-4 py-4 text-[15px]"
          >
            <div>
              <p className="font-medium">{item.product?.name ?? 'Product'}</p>
              <p className="text-[13px] text-[var(--text-secondary)]">Qty: {item.quantity}</p>
              {item.fitment_snapshot && (
                <p className="text-[12px]" style={{ color: 'var(--fit-exact-bg)' }}>
                  ✓ Exact fit — {item.fitment_snapshot.vehicle_slug.replace(/-/g, ' ')}
                </p>
              )}
            </div>
            <span className="font-semibold text-[var(--accent)]">
              LKR {(item.unit_price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="rounded-[8px] border border-[var(--border)] p-4 text-[15px]">
        <div className="mb-1 flex justify-between">
          <span className="text-[var(--text-secondary)]">Subtotal</span>
          <span>LKR {order.subtotal.toLocaleString()}</span>
        </div>
        <div className="mb-1 flex justify-between">
          <span className="text-[var(--text-secondary)]">Delivery</span>
          <span>LKR {order.delivery_fee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--border)] pt-2">
          <span className="font-semibold">Total</span>
          <span className="text-[17px] font-bold text-[var(--accent)]">
            LKR {order.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment failed: retry */}
      {order.status === 'payment_failed' && (
        <div className="mt-4 rounded-[4px] bg-[var(--accent-light)] p-4 text-[14px]">
          <p className="mb-2 font-medium text-[var(--accent)]">Payment failed.</p>
          <Link href="/checkout" className="text-[var(--accent)] underline">
            Try again or switch to Cash on Delivery →
          </Link>
        </div>
      )}

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--accent)] hover:underline"
      >
        ← Continue shopping
      </Link>
    </div>
  )
}
