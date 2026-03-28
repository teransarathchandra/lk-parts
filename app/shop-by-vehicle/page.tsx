import { CatalogService } from '@/lib/services/CatalogService'
import { Navbar } from '@/components/ui/Navbar'
import { VehicleSelector } from '@/components/catalog/VehicleSelector'

export const revalidate = 3600

export default async function ShopByVehiclePage() {
  const vehicles = await CatalogService.listVehicles()

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1
            className="mb-2 text-[22px] font-semibold text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.01em' }}
          >
            Shop by vehicle
          </h1>
          <p className="mb-6 text-[15px] text-[var(--text-secondary)]">
            Select your vehicle to see parts that fit.
          </p>
          <div className="rounded-[8px] border border-[var(--border)] bg-white p-5">
            <VehicleSelector vehicles={vehicles} showCta />
          </div>
        </div>
      </main>
    </>
  )
}
