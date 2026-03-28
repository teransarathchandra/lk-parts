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
          <div className="mb-4 flex items-center justify-between rounded-[8px] bg-[#111111] px-4 py-3.5">
            <div>
              <p className="text-[12px] font-medium text-white/60 uppercase tracking-wider">Showing parts for</p>
              <h1 className="text-[20px] font-bold text-white">
                {vehicleLabel}
              </h1>
            </div>
            <Link
              href="/shop-by-vehicle"
              className="min-h-[44px] flex items-center rounded-[4px] px-3 py-1 text-[13px] text-white/70 hover:text-white hover:underline"
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
              className={`flex-none min-h-[44px] flex items-center rounded-[4px] border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                !activeSection
                  ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]'
              }`}
            >
              All
            </Link>
            {SUB_SECTIONS.map((s) => (
              <Link
                key={s.key}
                href={`/parts/${slug}?section=${s.key}`}
                className={`flex-none min-h-[44px] flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeSection === s.key
                    ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-3.5 h-3.5">
                  <path d={s.icon} />
                </svg>
                {s.label}
              </Link>
            ))}
          </nav>

          {/* Verified fitment products */}
          {exactAndCompatible.length > 0 && (
            <section aria-labelledby="fitting-heading" className="mb-6">
              <h2 id="fitting-heading" className="mb-4 text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
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
                <h2 id="unknown-heading" className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Compatibility not yet verified for your vehicle
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
              <svg className="mx-auto mb-4 text-[var(--border)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <p className="mb-1 text-[16px] font-semibold text-[var(--text-primary)]">
                No parts listed yet
              </p>
              <p className="mb-5 text-[14px] text-[var(--text-secondary)]">
                We haven&apos;t listed parts for {vehicleLabel} yet.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="rounded-[4px] border border-[var(--border)] px-4 py-2.5 text-[13px] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Browse all parts
                </Link>
                <Link
                  href="/shop-by-vehicle"
                  className="rounded-[4px] bg-[var(--accent)] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
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
      <div className="mb-4 relative w-full aspect-[4/3] overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            <span className="text-[12px] font-medium uppercase tracking-wide">{product.sub_section ?? 'Part'}</span>
          </div>
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
          <p className="mt-2 w-full border-l-4 border-[var(--fit-exact-bg)] bg-emerald-50 pl-4 pr-3 py-3 rounded-r-[4px] text-[13px] text-[var(--fit-exact-bg)]">
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
        className="mb-1 text-[22px] font-bold text-[var(--text-primary)]"
        style={{ letterSpacing: '-0.01em' }}
      >
        {product.name}
      </h1>

      {product.oem_part_number && (
        <p className="mb-2 font-mono text-[13px] text-[var(--text-secondary)]">
          OEM: {product.oem_part_number}
        </p>
      )}

      {orderCount > 0 && (
        <p className="mb-2 text-[13px] text-[var(--fit-exact-bg)] font-medium">
          Ordered {orderCount} times for this vehicle
        </p>
      )}

      {/* Price */}
      <div className="border-t border-[var(--border)] pt-4 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[16px] text-[var(--text-secondary)] mr-1">LKR</span>
          <span className="text-[28px] font-extrabold" style={{ color: 'var(--accent)' }}>
            {product.price.toLocaleString()}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[14px] text-[var(--text-secondary)] line-through">
              LKR {product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="mb-4">
        <StockBadge
          quantity={product.quantity}
          lowStockThreshold={product.low_stock_threshold}
        />
      </div>

      {product.description && (
        <div className="mb-5 text-[14px] text-[var(--text-secondary)] leading-6">
          {product.description}
        </div>
      )}

      {/* Exact-fit vehicle warning (shown when no vehicle selected) */}
      {isExact && (
        <div className="mb-3 flex items-start gap-2 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-none" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>Select your vehicle first to confirm fitment and enable your free return.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {product.quantity > 0 ? (
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            className="min-h-[52px] text-[16px] font-semibold"
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
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[4px] px-4 py-2 text-[15px] font-medium text-white"
            style={{ backgroundColor: 'var(--whatsapp-green)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
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
