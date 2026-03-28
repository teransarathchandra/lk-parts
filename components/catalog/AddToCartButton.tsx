'use client'

import { useState } from 'react'

interface AddToCartButtonProps {
  productId: string
  productName: string
  quantity?: number
  className?: string
}

export function AddToCartButton({
  productId,
  productName,
  quantity = 1,
  className = '',
}: AddToCartButtonProps) {
  const [state, setState] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleAdd() {
    setState('adding')
    setErrorMsg('')

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add')
      }

      setState('added')
      window.dispatchEvent(new CustomEvent('cart:updated'))
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add'
      if (msg.toLowerCase().includes('out of stock')) {
        setErrorMsg('Out of stock')
      } else {
        setErrorMsg(msg)
      }
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const isAdding = state === 'adding'
  const isAdded = state === 'added'
  const isError = state === 'error'

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={isAdding || isAdded}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[4px] px-4 py-2.5 text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed ${
          isAdded
            ? 'bg-[var(--fit-exact-bg)]'
            : isError
            ? 'bg-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-1 hover:bg-[var(--accent-hover)] active:bg-[#891600]'
            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[#891600]'
        } ${className}`}
        aria-label={`Add ${productName} to cart`}
      >
        {isAdding ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding...
          </>
        ) : isAdded ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added to cart
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Add to cart
          </>
        )}
      </button>
      {isError && (
        <p className="mt-1 text-[13px] text-[var(--accent)]" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
