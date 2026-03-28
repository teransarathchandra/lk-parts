'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await fetch('/api/cart')
        if (res.ok) {
          const data = await res.json()
          const items = data?.items ?? []
          setCount(items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0))
        }
      } catch {}
    }
    loadCart()
    window.addEventListener('cart:updated', loadCart)
    return () => window.removeEventListener('cart:updated', loadCart)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--text-secondary)]"
      aria-label={`Cart${count > 0 ? `, ${count} items` : ''}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 10a4 4 0 01-8 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
