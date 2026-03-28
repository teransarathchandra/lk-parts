'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Cart } from '@/types'

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
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-[8px] bg-[var(--bg-subtle)]" />
        ))}
      </div>
    )
  }

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[15px] text-[var(--text-secondary)]">Your cart is empty.</p>
        <Link
          href="/"
          className="rounded-[4px] bg-[var(--accent)] px-6 py-3 text-[15px] font-medium text-white hover:bg-[#aa1b00]"
        >
          Browse parts
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
              className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-white p-3"
            >
              {/* Product image */}
              <div className="relative h-16 w-16 flex-none rounded-[4px] bg-[var(--bg-subtle)] overflow-hidden">
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--text-secondary)]">
                    {product.sub_section}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/parts/${product.slug}`}
                  className="block text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] truncate"
                >
                  {product.name}
                </Link>
                {product.oem_part_number && (
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {product.oem_part_number}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[15px] font-semibold" style={{ color: 'var(--accent)' }}>
                    LKR {(product.price * item.quantity).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      Qty: {item.quantity}
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      ×
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
        <h2 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">
          Order summary
        </h2>
        <div className="space-y-2 text-[15px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>LKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Delivery</span>
            <span>LKR {deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-[4px] bg-[var(--accent)] px-4 py-3 text-[15px] font-medium text-white hover:bg-[#aa1b00]"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}
