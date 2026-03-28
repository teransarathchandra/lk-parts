'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order } from '@/types'

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
    return <div className="py-12 text-center text-[var(--text-secondary)]">Loading order...</div>
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
        <h1
          className="mb-2 text-[22px] font-semibold text-[var(--text-primary)]"
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
            placeholder="Last 4 digits (e.g. 4567)"
            className="min-h-[44px] w-full rounded-[2px] border border-[var(--border)] px-3 py-2 text-[22px] text-center tracking-[0.3em] focus:border-[var(--accent)] focus:outline-none"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            autoFocus
          />
          {verifyError && (
            <p className="text-[13px] text-[var(--accent)]" role="alert">{verifyError}</p>
          )}
          <button
            type="submit"
            disabled={verifying}
            className="min-h-[44px] w-full rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-medium text-white hover:bg-[#aa1b00] disabled:opacity-60"
          >
            {verifying ? 'Checking...' : 'View order'}
          </button>
        </form>
      </div>
    )
  }

  // Order confirmed — show pending payment banner if applicable
  const isPendingKoko = order.status === 'payment_initiated'

  return (
    <div>
      {isPendingKoko && (
        <div
          className="mb-4 rounded-[4px] bg-amber-50 border border-amber-200 px-4 py-3 text-[14px] text-amber-800"
          role="status"
        >
          You have a payment in progress —{' '}
          <strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong>
        </div>
      )}

      <h1
        className="mb-1 text-[22px] font-semibold text-[var(--text-primary)]"
        style={{ letterSpacing: '-0.01em' }}
      >
        Order #{order.id.slice(0, 8).toUpperCase()}
      </h1>

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
            className="flex items-center justify-between rounded-[8px] border border-[var(--border)] p-3 text-[15px]"
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
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>
              LKR {(item.unit_price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="rounded-[8px] border border-[var(--border)] p-4 text-[15px]">
        <div className="flex justify-between mb-1">
          <span className="text-[var(--text-secondary)]">Subtotal</span>
          <span>LKR {order.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[var(--text-secondary)]">Delivery</span>
          <span>LKR {order.delivery_fee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
          <span>Total</span>
          <span>LKR {order.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment failed: retry */}
      {order.status === 'payment_failed' && (
        <div className="mt-4 rounded-[4px] bg-[var(--accent-light)] p-4 text-[14px]">
          <p className="mb-2 font-medium text-[var(--accent)]">Payment failed.</p>
          <Link
            href="/checkout"
            className="text-[var(--accent)] underline"
          >
            Try again or switch to Cash on Delivery →
          </Link>
        </div>
      )}

      <div className="mt-5">
        <Link
          href="/"
          className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          ← Continue shopping
        </Link>
      </div>
    </div>
  )
}
