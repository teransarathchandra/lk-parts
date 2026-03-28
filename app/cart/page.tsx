import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { CartClient } from '@/components/checkout/CartClient'

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1
            className="mb-6 text-[22px] font-semibold text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.01em' }}
          >
            Your cart
          </h1>
          <CartClient />
        </div>
      </main>
      <Footer supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
    </>
  )
}
