'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Cart } from '@/types'
import { TrustStrip } from '@/components/ui/TrustStrip'

export function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => {
        setCart(data?.id ? data : null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function removeItem(productId: string) {
    await fetch(`/api/cart/items/${productId}`, { method: 'DELETE' })
    setCart((prev) => {
      if (!prev) return null
      return {
        ...prev,
        items: (prev.items ?? []).filter((i) => i.product_id !== productId),
      }
    })
    window.dispatchEvent(new CustomEvent('cart:updated'))
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-white p-4"
          >
            <div className="h-20 w-20 flex-none animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-full animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
              <div className="h-3 w-3/5 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
              <div className="h-3 w-2/5 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
            </div>
          </div>
        ))}
        {/* Order summary skeleton */}
        <div className="mt-6 rounded-[8px] border border-[var(--border)] bg-white p-4">
          <div className="mb-4 h-4 w-1/3 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
          <div className="space-y-3">
            <div className="h-3 w-full animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
            <div className="h-3 w-full animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
            <div className="h-3 w-2/3 animate-pulse rounded-[2px] bg-[var(--bg-subtle)]" />
          </div>
          <div className="mt-4 h-[52px] w-full animate-pulse rounded-[4px] bg-[var(--bg-subtle)]" />
        </div>
      </div>
    )
  }

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 flex justify-center">
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[var(--border)]"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <p className="mb-1 text-[18px] font-semibold text-[var(--text-primary)]">
          Your cart is empty
        </p>
        <p className="mb-6 text-[13px] text-[var(--text-secondary)]">
          Browse parts for your vehicle to get started.
        </p>
        <Link
          href="/"
          className="rounded-[4px] bg-[var(--accent)] px-6 py-3 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Browse parts →
        </Link>
      </div>
    )
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  )
  const deliveryFee = 350
  const total = subtotal + deliveryFee

  return (
    <div>
      {/* Cart items */}
      <div className="mb-6 space-y-3">
        {items.map((item) => {
          const product = item.product
          if (!product) return null
          const images = Array.isArray(product.images) ? product.images : []

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-white p-4"
            >
              {/* Product image */}
              <div className="relative h-20 w-20 flex-none overflow-hidden rounded-[4px] bg-[var(--bg-subtle)]">
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--text-secondary)]">
                    {product.sub_section}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/parts/${product.slug}`}
                  className="line-clamp-2 block text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                >
                  {product.name}
                </Link>
                {product.oem_part_number && (
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {product.oem_part_number}
                  </p>
                )}
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-semibold text-[var(--accent)]">
                    <span className="text-[13px] font-normal">LKR </span>
                    <span className="text-[17px]">
                      {(product.price * item.quantity).toLocaleString()}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--border)] px-2 py-0.5 text-[13px] font-medium">
                      ×{item.quantity}
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order summary */}
      <div className="rounded-[8px] border border-[var(--border)] bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Order summary
        </h2>
        <div className="space-y-2 text-[15px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>LKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <svg
                width="12"
                height="12"
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
              Delivery
            </span>
            <span>LKR {deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Total</span>
            <span className="text-[17px] text-[var(--accent)]">
              LKR {total.toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Proceed to checkout
        </Link>

        <div className="mt-4">
          <TrustStrip supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
        </div>
      </div>
    </div>
  )
}
