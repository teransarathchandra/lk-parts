import Link from 'next/link'
import { CartIcon } from './CartIcon'

interface NavbarProps {
  vehicleNickname?: string | null
}

export function Navbar({ vehicleNickname }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-[18px] font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.01em' }}
        >
          LK Parts
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Link
            href="/search"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--text-secondary)]"
            aria-label="Search parts"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>

          {/* Garage indicator */}
          <Link
            href="/shop-by-vehicle"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            aria-label={vehicleNickname ? `My Garage: ${vehicleNickname}` : 'My Garage'}
          >
            {vehicleNickname ? (
              <span className="max-w-[100px] truncate text-[12px] font-medium text-[var(--fit-exact-bg)]">
                {vehicleNickname}
              </span>
            ) : (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--border)' }}
              />
            )}
          </Link>

          {/* Cart */}
          <CartIcon />
        </div>
      </div>
    </header>
  )
}
