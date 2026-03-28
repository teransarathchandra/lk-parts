interface StockBadgeProps {
  quantity: number
  lowStockThreshold?: number
}

export function StockBadge({ quantity, lowStockThreshold = 5 }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <span className="rounded-[4px] bg-gray-100 px-2 py-0.5 text-[12px] text-gray-500">
        Out of stock
      </span>
    )
  }

  if (quantity <= lowStockThreshold) {
    return (
      <span className="rounded-[4px] bg-amber-100 px-2 py-0.5 text-[12px] text-amber-700">
        Low Stock ({quantity})
      </span>
    )
  }

  return (
    <span
      className="inline-block rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[12px] font-medium"
      style={{ color: 'var(--stock-in-color)' }}
    >
      In Stock ({quantity})
    </span>
  )
}
