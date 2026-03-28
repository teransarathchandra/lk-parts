interface StockBadgeProps {
  quantity: number
  lowStockThreshold?: number
}

export function StockBadge({ quantity, lowStockThreshold = 5 }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden="true" />
        Out of stock
      </span>
    )
  }

  if (quantity <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-700">
        <span className="relative inline-flex" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
        </span>
        Low Stock ({quantity})
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-medium"
      style={{ color: 'var(--stock-in-color)' }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--stock-in-color)]"
        aria-hidden="true"
      />
      In Stock ({quantity})
    </span>
  )
}
