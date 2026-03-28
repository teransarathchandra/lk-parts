interface FooterProps {
  supportPhone?: string | null
}

export function Footer({ supportPhone }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-auto">
      <div className="mx-auto max-w-lg px-4 pt-8 pb-6">
        {/* Brand + tagline */}
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">LK Parts</p>
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
            Genuine &amp; aftermarket spare parts for vehicles in Sri Lanka.
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-[var(--border)]" aria-hidden="true" />

        {/* Links row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
          {supportPhone && (
            <a
              href={`https://wa.me/${supportPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)]"
              aria-label={`WhatsApp support: ${supportPhone}`}
            >
              {/* WhatsApp icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  fill="var(--whatsapp-green)"
                />
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.406A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  stroke="var(--whatsapp-green)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {supportPhone}
            </a>
          )}
          <a
            href="#"
            className="hover:text-[var(--text-primary)]"
          >
            {/* TODO: /returns */}
            Returns Policy
          </a>
          <span className="ml-auto text-[var(--text-secondary)]">© 2025 LK Parts</span>
        </div>
      </div>
    </footer>
  )
}
