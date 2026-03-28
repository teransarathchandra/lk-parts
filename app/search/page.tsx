import { Navbar } from '@/components/ui/Navbar'
import { SearchResults } from '@/components/catalog/SearchResults'

interface PageProps {
  searchParams: Promise<{ q?: string; vehicle_id?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const query = sp.q ?? ''
  const vehicleId = sp.vehicle_id

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Search form */}
          <form action="/search" method="GET" className="mb-6">
            {vehicleId && <input type="hidden" name="vehicle_id" value={vehicleId} />}
            <div className="flex gap-2">
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search by part name or number"
                autoFocus
                className="min-h-[44px] flex-1 rounded-[2px] border border-[var(--border)] px-3 py-2 text-[15px] focus:border-[var(--accent)] focus:outline-none"
                aria-label="Search parts"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-[4px] bg-[var(--accent)] px-5 text-[15px] font-medium text-white hover:bg-[#aa1b00]"
              >
                Search
              </button>
            </div>
          </form>

          {query ? (
            <SearchResults query={query} vehicleId={vehicleId} />
          ) : (
            <p className="py-8 text-center text-[15px] text-[var(--text-secondary)]">
              Enter a part name or part number to search.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
