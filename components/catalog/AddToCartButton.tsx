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
        className={`min-h-[44px] w-full rounded-[4px] px-4 py-2.5 text-[15px] font-medium text-white transition-colors disabled:cursor-not-allowed ${
          isAdded
            ? 'bg-[var(--fit-exact-bg)]'
            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[#891600]'
        } ${className}`}
        aria-label={`Add ${productName} to cart`}
      >
        {isAdding ? 'Adding...' : isAdded ? 'Added ✓' : 'Add to cart'}
      </button>
      {isError && (
        <p className="mt-1 text-[13px] text-[var(--accent)]" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
