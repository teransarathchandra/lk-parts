import { CatalogService } from '@/lib/services/CatalogService'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Navbar } from '@/components/ui/Navbar'
import Link from 'next/link'
import type { SubSection } from '@/types'
import { notFound } from 'next/navigation'

// Parts catalog page: /parts/[vehicle-slug]
// Also handles product detail: /parts/[product-slug]

export const revalidate = 300

const SUB_SECTIONS: { key: SubSection; label: string }[] = [
  { key: 'engine', label: 'Engine' },
  { key: 'filters', label: 'Filters' },
  { key: 'brakes', label: 'Brakes' },
  { key: 'suspension', label: 'Suspension' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'cooling', label: 'Cooling' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'body', label: 'Body' },
  { key: 'wheels_tyres', label: 'Wheels & Tyres' },
  { key: 'interior', label: 'Interior' },
]

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const activeSection = sp.section as SubSection | undefined

  // Try vehicle slug first
  const vehicle = await CatalogService.getVehicleBySlug(slug)

  if (!vehicle) {
    // Try as product slug
    const product = await CatalogService.getProductBySlug(slug)
    if (!product) notFound()

    // Product detail page
    const orderCount = 0 // vehicle context not available here

    const vehicleName = undefined
    return (
      <>
        <Navbar />
        <main id="main-content" className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1 text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
            >
              ← Back
            </Link>
            <ProductDetailContent product={product} orderCount={orderCount} />
          </div>
        </main>
      </>
    )
  }

  // Vehicle catalog page
  const vehicleLabel = [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(' ')
  const products = await CatalogService.getProductsForVehicle(vehicle.id, {
    subSection: activeSection,
    fitmentType: 'all',
    limit: 50,
  })

  const exactAndCompatible = products.filter(
    (p) => p.fitment_type === 'exact' || p.fitment_type === 'compatible'
  )
  const unknown = products.filter((p) => p.fitment_type === 'unknown')

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Vehicle banner */}
          <div className="mb-4 flex items-center justify-between rounded-[4px] bg-[var(--bg-subtle)] px-4 py-3">
            <div>
              <p className="text-[12px] text-[var(--text-secondary)]">Showing parts for</p>
              <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
                {vehicleLabel}
              </h1>
            </div>
            <Link
              href="/shop-by-vehicle"
              className="min-h-[44px] flex items-center rounded-[4px] px-3 py-1 text-[13px] text-[var(--accent)] hover:underline"
            >
              Change
            </Link>
          </div>

          {/* Sub-section filter chips */}
          <nav
            aria-label="Filter by sub-section"
            className="mb-4 flex gap-2 overflow-x-auto pb-1"
          >
            <Link
              href={`/parts/${slug}`}
              className={`flex-none min-h-[44px] flex items-center rounded-[4px] border px-3 py-1 text-[13px] font-medium transition-colors ${
                !activeSection
                  ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
              }`}
            >
              All
            </Link>
            {SUB_SECTIONS.map((s) => (
              <Link
                key={s.key}
                href={`/parts/${slug}?section=${s.key}`}
                className={`flex-none min-h-[44px] flex items-center rounded-[4px] border px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeSection === s.key
                    ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>

          {/* Verified fitment products */}
          {exactAndCompatible.length > 0 && (
            <section aria-labelledby="fitting-heading" className="mb-6">
              <h2 id="fitting-heading" className="mb-3 text-[13px] font-medium text-[var(--text-secondary)]">
                {exactAndCompatible.length} parts for your {vehicleLabel}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {exactAndCompatible.map((p) => (
                  <ProductCard key={p.id} product={p} vehicleName={vehicleLabel} />
                ))}
              </div>
            </section>
          )}

          {/* Unknown fitment separator */}
          {unknown.length > 0 && (
            <section aria-labelledby="unknown-heading">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex-1 border-t border-[var(--border)]" />
                <h2 id="unknown-heading" className="text-[12px] text-[var(--text-secondary)]">
                  Not yet verified for your vehicle
                </h2>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {unknown.map((p) => (
                  <ProductCard key={p.id} product={p} vehicleName={vehicleLabel} />
                ))}
              </div>
            </section>
          )}

          {products.length === 0 && (
            <div className="py-12 text-center">
              <p className="mb-3 text-[15px] text-[var(--text-secondary)]">
                No parts listed for {vehicleLabel} yet.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-[13px] hover:border-[var(--accent)]"
                >
                  Browse all
                </Link>
                <Link
                  href="/shop-by-vehicle"
                  className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-[13px] hover:border-[var(--accent)]"
                >
                  Change vehicle
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

// Inline product detail component (used when slug matches a product)
async function ProductDetailContent({
  product,
  orderCount,
}: {
  product: Awaited<ReturnType<typeof CatalogService.getProductBySlug>>
  orderCount: number
}) {
  if (!product) return null

  const fitmentType = product.fitment_type ?? 'unknown'
  const isExact = fitmentType === 'exact'
  const isCompatible = fitmentType === 'compatible'

  return (
    <article>
      {/* Images */}
      <div className="mb-4 h-56 w-full rounded-[8px] bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <span className="text-[13px]">{product.sub_section}</span>
        )}
      </div>

      {/* Fitment badge */}
      {fitmentType !== 'unknown' && (
        <div className="mb-3">
          {isExact && (
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] font-semibold text-white"
                style={{ backgroundColor: 'var(--fit-exact-bg)' }}
              >
                ✓ Exact Fit
              </span>
              <p className="mt-2 rounded-[4px] border border-[#065F46] bg-emerald-50 px-3 py-2 text-[13px] text-[#065F46]">
                🛡 Wrong part? Free return within 7 days — guaranteed.
              </p>
            </div>
          )}
          {isCompatible && (
            <span
              className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] font-semibold text-white"
              style={{ backgroundColor: 'var(--fit-compat-bg)' }}
            >
              ⚠ Compatible — verify before ordering
            </span>
          )}
        </div>
      )}

      <h1
        className="mb-1 text-[18px] font-semibold text-[var(--text-primary)]"
        style={{ letterSpacing: '-0.01em' }}
      >
        {product.name}
      </h1>

      {product.oem_part_number && (
        <p className="mb-1 text-[13px] text-[var(--text-secondary)]">
          OEM: {product.oem_part_number}
        </p>
      )}

      {orderCount > 0 && (
        <p className="mb-2 text-[13px] text-[var(--text-secondary)]">
          Ordered {orderCount} times
        </p>
      )}

      {/* Price */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-[22px] font-bold" style={{ color: 'var(--accent)' }}>
          LKR {product.price.toLocaleString()}
        </span>
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="text-[14px] text-[var(--text-secondary)] line-through">
            LKR {product.compare_at_price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Stock */}
      <div className="mb-4">
        <span className="text-[13px] text-[var(--text-secondary)]">
          {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of stock'}
        </span>
      </div>

      {product.description && (
        <div className="mb-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {product.description}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {product.quantity > 0 ? (
          <button
            className="min-h-[44px] flex-1 rounded-[4px] bg-[var(--accent)] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#aa1b00]"
            onClick={undefined}
          >
            Add to cart
          </button>
        ) : (
          <span className="min-h-[44px] flex-1 rounded-[4px] bg-[var(--bg-subtle)] px-4 py-2 text-[15px] text-center text-[var(--text-secondary)]">
            Out of stock
          </span>
        )}
        {(isCompatible || fitmentType === 'unknown') && (
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? ''}?text=Hi, I need help with ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] rounded-[4px] border border-[var(--border)] px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Ask via WhatsApp ↗
          </a>
        )}
      </div>
    </article>
  )
}
