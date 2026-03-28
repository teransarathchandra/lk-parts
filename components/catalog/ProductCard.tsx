import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { FitmentBadge } from '@/components/ui/FitmentBadge'
import { StockBadge } from '@/components/ui/StockBadge'
import { AddToCartButton } from '@/components/catalog/AddToCartButton'

interface ProductCardProps {
  product: Product
  vehicleName?: string
  compact?: boolean
}

export function ProductCard({ product, vehicleName, compact = false }: ProductCardProps) {
  const isOutOfStock = product.quantity === 0
  const isExactFit = product.fitment_type === 'exact'
  const images = Array.isArray(product.images) ? product.images : []

  return (
    <article
      className={`relative rounded-[8px] border border-[var(--border)] bg-white transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      {/* Exact fit "Free return" corner ribbon */}
      {isExactFit && !isOutOfStock && (
        <div
          className="absolute right-0 top-0 z-10 rounded-bl-[4px] rounded-tr-[8px] bg-[var(--fit-exact-bg)] px-2 py-0.5 text-[11px] font-semibold text-white"
          aria-hidden="true"
        >
          Free return
        </div>
      )}

      {/* Product image */}
      <Link href={`/parts/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[8px] bg-[var(--bg-subtle)]">
          {images.length > 0 ? (
            <Image
              src={images[0]}
              alt={`${product.name}${vehicleName ? ` for ${vehicleName}` : ''}`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[13px] text-[var(--text-secondary)]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--border)]"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
              <span>{product.sub_section}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/parts/${product.slug}`} className="block">
          <h3
            className="mb-0.5 line-clamp-2 text-[18px] font-semibold leading-[1.2] text-[var(--text-primary)] hover:text-[var(--accent)]"
            style={{ letterSpacing: '-0.01em' }}
          >
            {product.name}
          </h3>
          {product.oem_part_number && (
            <p className="mb-1 text-[13px] text-[var(--text-secondary)]">
              <span className="mr-0.5 font-semibold opacity-50">#</span>
              {product.oem_part_number}
            </p>
          )}
        </Link>

        {/* Fitment badge — above price */}
        <div className="mb-2">
          <FitmentBadge
            fitmentType={product.fitment_type ?? 'unknown'}
            vehicleName={vehicleName}
          />
        </div>

        {/* Price */}
        <div className="mb-2 flex items-baseline gap-1.5">
          <span className="text-[16px] font-semibold" style={{ color: 'var(--accent)' }}>
            LKR
          </span>
          <span className="text-[22px] font-bold" style={{ color: 'var(--accent)' }}>
            {product.price.toLocaleString()}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[14px] text-[var(--text-secondary)] line-through">
              {product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="mb-3">
          <StockBadge
            quantity={product.quantity}
            lowStockThreshold={product.low_stock_threshold}
          />
        </div>

        {/* Add to cart */}
        {!isOutOfStock && (
          <AddToCartButton productId={product.id} productName={product.name} />
        )}
      </div>
    </article>
  )
}
