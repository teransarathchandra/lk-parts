import { CatalogService } from '@/lib/services/CatalogService'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { VehicleSelector } from '@/components/catalog/VehicleSelector'
import Link from 'next/link'

export const revalidate = 3600

export default async function ShopByVehiclePage() {
  const vehicles = await CatalogService.listVehicles()

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Home
          </Link>
          <h1
            className="mb-2 text-[26px] font-semibold text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.01em' }}
          >
            Shop by vehicle
          </h1>
          <p className="mb-6 text-[15px] text-[var(--text-secondary)]">
            Select your vehicle to browse exact-fit parts.
          </p>
          <div className="overflow-hidden rounded-[8px] border border-[var(--border)] bg-white p-5">
            <div className="h-1 bg-[var(--accent)] rounded-t-[8px] -mx-5 -mt-5 mb-5" />
            <VehicleSelector vehicles={vehicles} showCta />
          </div>
        </div>
      </main>
      <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
    </>
  )
}
