import { CatalogService } from '@/lib/services/CatalogService'
import { VehicleSelector } from '@/components/catalog/VehicleSelector'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import Link from 'next/link'

export const revalidate = 3600

const POPULAR_VEHICLES = [
  { label: 'Honda CB150R', slug: 'bike-honda-cb150r-ex' },
  { label: 'Yamaha FZ-S', slug: 'bike-yamaha-fz-s-v3' },
  { label: 'Toyota Corolla', slug: 'car-toyota-corolla-141' },
  { label: 'Bajaj Pulsar 150', slug: 'bike-bajaj-pulsar-150ns' },
  { label: 'Honda Civic EK3', slug: 'car-honda-civic-ek3' },
  { label: 'Yamaha R15', slug: 'bike-yamaha-r15-v3' },
]

export default async function HomePage() {
  const vehicles = await CatalogService.listVehicles()

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-[#111111] px-4 py-12 text-white sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 h-0.5 w-12 bg-[var(--accent)]" />
            <h1
              className="mb-3 text-[34px] font-extrabold leading-tight text-white sm:text-[44px]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Find parts that fit your exact vehicle.
            </h1>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-white/70">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Fitment-checked parts
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Fast Sri Lanka delivery
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Free returns on exact fit
              </span>
            </div>

            {/* Vehicle selector card */}
            <div
              className="overflow-hidden rounded-[8px] border-l-4 bg-white p-5 text-left shadow-lg shadow-black/20"
              style={{ borderLeftColor: 'var(--accent)' }}
            >
              <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M5 17a2 2 0 004 0M15 17a2 2 0 004 0"/></svg>
                Find parts for your vehicle
              </p>
              <VehicleSelector vehicles={vehicles} showCta />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8">

          {/* Search fallback */}
          <section className="mb-8">
            <div className="my-8 flex items-center gap-3">
              <div className="flex-1 border-t border-[var(--border)]" />
              <span className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">or</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            <form action="/search" method="GET">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    name="q"
                    type="search"
                    placeholder="e.g. 15400-PLM-A02 or oil filter"
                    className="min-h-[48px] w-full rounded-[2px] border border-[#CCCCCC] pl-10 pr-3 py-2 text-[15px] focus:border-[var(--accent)] focus:outline-none"
                    aria-label="Search by part name or number"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[48px] rounded-[4px] bg-[var(--accent)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--accent-hover)]"
                >
                  Search
                </button>
              </div>
            </form>
          </section>

          {/* Popular vehicles */}
          <section aria-labelledby="popular-heading">
            <h2
              id="popular-heading"
              className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]"
            >
              Browse popular vehicles
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POPULAR_VEHICLES.map((v) => (
                <Link
                  key={v.slug}
                  href={`/parts/${v.slug}`}
                  className="flex min-h-[44px] items-center justify-between rounded-[4px] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                >
                  {v.label}
                  <span className="ml-2 text-[11px] text-[var(--text-secondary)]">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
    </>
  )
}
