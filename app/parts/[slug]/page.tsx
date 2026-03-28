import { CatalogService } from '@/lib/services/CatalogService'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AddToCartButton } from '@/components/catalog/AddToCartButton'
import { StockBadge } from '@/components/ui/StockBadge'
import { TrustStrip } from '@/components/ui/TrustStrip'
import Link from 'next/link'
import type { SubSection } from '@/types'
import { notFound } from 'next/navigation'

// Parts catalog page: /parts/[vehicle-slug]
// Also handles product detail: /parts/[product-slug]

export const revalidate = 300

const SUB_SECTIONS: { key: SubSection; label: string; icon: string }[] = [
  { key: 'engine', label: 'Engine', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v.75H3.75A2.25 2.25 0 001.5 6.75v3a2.25 2.25 0 002.25 2.25h.75v.75A2.25 2.25 0 006.75 15h3a2.25 2.25 0 002.25-2.25v-.75h.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25H12V3.75A2.25 2.25 0 0010.5 1.5z' },
  { key: 'filters', label: 'Filters', icon: 'M3 4.5A.75.75 0 013.75 3.75h8.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.5zm1.5 3a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5h-5.5A.75.75 0 014.5 7.5zm2 3a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z' },
  { key: 'brakes', label: 'Brakes', icon: 'M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zM8 5a3 3 0 100 6A3 3 0 008 5z' },
  { key: 'suspension', label: 'Suspension', icon: 'M8 1v14M4 5l4-4 4 4M4 11l4 4 4-4' },
  { key: 'electrical', label: 'Electrical', icon: 'M3.75 13.5l10.5-11.25L12 10.5h4.5L5.25 21.75 8 13.5H3.75z' },
  { key: 'transmission', label: 'Transmission', icon: 'M7.5 3.75A1.5 1.5 0 006 5.25v.75H4.875A1.125 1.125 0 003.75 7.125v1.5c0 .621.504 1.125 1.125 1.125H6v.75a1.5 1.5 0 001.5 1.5h1.5A1.5 1.5 0 0010.5 10.5v-.75h1.125A1.125 1.125 0 0012.75 8.625v-1.5A1.125 1.125 0 0011.625 6H10.5v-.75a1.5 1.5 0 00-1.5-1.5H7.5z' },
  { key: 'cooling', label: 'Cooling', icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' },
  { key: 'lighting', label: 'Lighting', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' },
  { key: 'body', label: 'Body', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z' },
  { key: 'wheels_tyres', label: 'Wheels & Tyres', icon: 'M12 3a9 9 0 100 18A9 9 0 0012 3zm0 3.75a5.25 5.25 0 110 10.5A5.25 5.25 0 0112 6.75zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  { key: 'interior', label: 'Interior', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
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
        <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
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
            className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1"
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
                className={`flex-none min-h-[44px] flex items-center gap-1.5 rounded-[4px] border px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeSection === s.key
                    ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.icon} />
                </svg>
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
      <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
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
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE

  return (
    <article>
      {/* Images */}
      <div className="mb-4 h-56 w-full overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
      </div>

      {/* Fitment badge */}
      {isExact && (
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'var(--fit-exact-bg)' }}
          >
            ✓ Exact Fit
          </span>
          <p className="mt-2 w-full rounded-[4px] border border-[var(--fit-exact-bg)] bg-emerald-50 px-3 py-2 text-[13px] text-[var(--fit-exact-bg)]">
            🛡 Wrong part? Free return within 7 days — guaranteed.
          </p>
        </div>
      )}
      {isCompatible && (
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'var(--fit-compat-bg)' }}
          >
            ⚠ Compatible — verify before ordering
          </span>
        </div>
      )}

      <h1
        className="mb-1 text-[20px] font-semibold text-[var(--text-primary)]"
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
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-[24px] font-bold" style={{ color: 'var(--accent)' }}>
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
        <StockBadge
          quantity={product.quantity}
          lowStockThreshold={product.low_stock_threshold}
        />
      </div>

      {product.description && (
        <div className="mb-5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {product.description}
        </div>
      )}

      {/* Exact-fit vehicle warning (shown when no vehicle selected) */}
      {isExact && (
        <p className="mb-3 rounded-[4px] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
          Select your vehicle first to confirm fitment and enable your free return.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {product.quantity > 0 ? (
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            className="min-h-[52px]"
          />
        ) : (
          <span className="flex min-h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--bg-subtle)] px-4 py-2 text-[15px] text-[var(--text-secondary)]">
            Out of stock
          </span>
        )}
        {(isCompatible || fitmentType === 'unknown') && supportPhone && (
          <a
            href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hi, I need help with ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] w-full items-center justify-center rounded-[4px] px-4 py-2 text-[15px] font-medium text-white"
            style={{ backgroundColor: 'var(--whatsapp-green)' }}
          >
            Ask via WhatsApp ↗
          </a>
        )}
      </div>

      <div className="mt-4">
        <TrustStrip supportPhone={supportPhone} />
      </div>
    </article>
  )
}
