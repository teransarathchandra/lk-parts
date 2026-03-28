import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
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
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search by part name or number"
                  autoFocus
                  className="min-h-[44px] w-full rounded-[4px] border border-[#CCCCCC] pl-10 pr-3 py-2 text-[15px] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  aria-label="Search parts"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] rounded-[4px] bg-[var(--accent)] px-5 text-[15px] font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Search
              </button>
            </div>
          </form>

          {query ? (
            <>
              <p className="mb-4 text-[13px] text-[var(--text-secondary)]">
                Results for &ldquo;<strong className="text-[var(--text-primary)]">{query}</strong>&rdquo;
              </p>
              <SearchResults query={query} vehicleId={vehicleId} />
            </>
          ) : (
            <>
              <h1
                className="mb-4 text-[18px] font-bold text-[var(--text-primary)]"
                style={{ letterSpacing: '-0.01em' }}
              >
                Search parts
              </h1>
              <p className="py-8 text-center text-[15px] text-[var(--text-secondary)]">
                Enter a part name or part number to search.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
    </>
  )
}
