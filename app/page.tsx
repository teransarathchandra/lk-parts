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
        <section className="bg-[#111111] px-4 py-10 text-white">
          <div className="mx-auto max-w-2xl text-center">
            <h1
              className="mb-3 text-[32px] font-bold leading-tight text-white sm:text-[40px]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Find parts that fit your exact vehicle.
            </h1>
            <p className="mb-8 text-[14px] text-white/70">
              ✓ Fitment-checked parts available&nbsp;&nbsp;·&nbsp;&nbsp;✓ Sri Lanka delivery&nbsp;&nbsp;·&nbsp;&nbsp;✓ Free returns on exact fit
            </p>

            {/* Vehicle selector card */}
            <div
              className="rounded-[8px] border-l-4 bg-white p-5 text-left"
              style={{ borderLeftColor: 'var(--accent)' }}
            >
              <p className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">
                Find parts for your vehicle
              </p>
              <VehicleSelector vehicles={vehicles} showCta />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-4 py-8">

          {/* Search fallback */}
          <section className="mb-8 text-center">
            <p className="mb-2 text-[13px] text-[var(--text-secondary)]">
              Or search by part number
            </p>
            <form action="/search" method="GET">
              <div className="flex gap-2">
                <input
                  name="q"
                  type="search"
                  placeholder="e.g. 15400-PLM-A02 or oil filter"
                  className="min-h-[48px] flex-1 rounded-[2px] border border-[var(--text-secondary)] px-3 py-2 text-[15px] focus:border-[var(--accent)] focus:outline-none"
                  aria-label="Search by part name or number"
                />
                <button
                  type="submit"
                  className="min-h-[48px] rounded-[4px] bg-[var(--accent)] px-5 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)]"
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
              Popular vehicles
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POPULAR_VEHICLES.map((v) => (
                <Link
                  key={v.slug}
                  href={`/parts/${v.slug}`}
                  className="flex min-h-[44px] items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-center text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {v.label}
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
