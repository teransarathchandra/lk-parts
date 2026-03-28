interface FooterProps {
  supportPhone?: string | null
}

export function Footer({ supportPhone }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-white px-4 py-6 mt-auto">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
        <span>LK Parts · Sri Lanka</span>
        {supportPhone && (
          <a
            href={`https://wa.me/${supportPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)]"
          >
            WhatsApp: {supportPhone}
          </a>
        )}
        <a
          href="#"
          className="hover:text-[var(--text-primary)]"
        >
          {/* TODO: /returns */}
          Returns Policy
        </a>
      </div>
    </footer>
  )
}
