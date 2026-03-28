'use client'

import { useState } from 'react'
import type { Order } from '@/types'
import { generateWhatsAppLink } from '@/lib/utils/phone'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  cod_confirmed: { label: 'COD pending', color: '#92400E' },
  payment_initiated: { label: 'Payment pending', color: '#92400E' },
  paid: { label: 'Paid', color: '#065F46' },
  processing: { label: 'Processing', color: '#065F46' },
  shipped: { label: 'Shipped', color: '#1d4ed8' },
  delivered: { label: 'Delivered', color: '#065F46' },
  closed: { label: 'Closed', color: '#6B7280' },
  cancelled: { label: 'Cancelled', color: '#6B7280' },
  payment_failed: { label: 'Failed', color: '#CC2200' },
}

interface AdminOrderCardProps {
  order: Order
}

export function AdminOrderCard({ order }: AdminOrderCardProps) {
  const [status, setStatus] = useState(order.status)
  const [confirmState, setConfirmState] = useState<'idle' | 'confirming' | 'done'>('idle')

  const customer = order.customer
  const firstItem = order.items?.[0]
  const itemSummary = firstItem
    ? `${firstItem.product?.name ?? 'Part'}${
        (order.items?.length ?? 0) > 1 ? ` +${(order.items?.length ?? 1) - 1} more` : ''
      }`
    : 'No items'

  const statusInfo = STATUS_LABELS[status] ?? { label: status, color: '#6B7280' }
  const isCodPending = status === 'cod_confirmed'
  const hasPhone = !!customer?.phone

  const waLink = hasPhone
    ? generateWhatsAppLink(
        customer!.phone,
        [
          `Hi ${customer?.name ?? 'there'}!`,
          `Your LK Parts order #${order.id.slice(0, 8).toUpperCase()} (${itemSummary}) — LKR ${order.total.toLocaleString()}`,
          'Please let us know if you have any questions.',
        ].join('\n')
      )
    : null

  async function handleConfirmCod() {
    setConfirmState('confirming')
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      })
      if (res.ok) {
        setStatus('processing')
        setConfirmState('done')
        setTimeout(() => setConfirmState('idle'), 3000)
      } else {
        setConfirmState('idle')
        alert('Failed to confirm — try again')
      }
    } catch {
      setConfirmState('idle')
      alert('Network error — try again')
    }
  }

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-white p-4">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold text-[15px] text-[var(--text-primary)]">
            #{order.id.slice(0, 8).toUpperCase()} —{' '}
            {customer?.name ?? 'Unknown'}
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">{itemSummary}</p>
        </div>
        <span
          className="rounded-[4px] px-2 py-0.5 text-[11px] font-semibold text-white"
          style={{ backgroundColor: statusInfo.color }}
        >
          ● {statusInfo.label}
        </span>
      </div>

      {/* Price + payment */}
      <p className="mb-3 text-[15px] font-semibold" style={{ color: 'var(--accent)' }}>
        LKR {order.total.toLocaleString()}
        <span className="ml-2 text-[13px] font-normal text-[var(--text-secondary)]">
          · {order.payment_method.toUpperCase()}
        </span>
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {/* COD confirm */}
        {isCodPending && (
          <button
            onClick={handleConfirmCod}
            disabled={confirmState !== 'idle'}
            className={`min-h-[44px] flex-1 rounded-[4px] px-3 py-2 text-[13px] font-medium text-white transition-colors disabled:cursor-not-allowed ${
              confirmState === 'done'
                ? 'bg-[var(--fit-exact-bg)]'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {confirmState === 'confirming'
              ? 'Confirming...'
              : confirmState === 'done'
              ? 'Confirmed ✓'
              : '✓ Confirm COD'}
          </button>
        )}

        {/* WhatsApp */}
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] flex items-center justify-center rounded-[4px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            WhatsApp ↗
          </a>
        ) : (
          <button
            disabled
            className="min-h-[44px] flex items-center justify-center rounded-[4px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--border)] cursor-not-allowed"
            title="No phone number on file"
          >
            WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
