import { Navbar } from '@/components/ui/Navbar'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <CheckoutFlow />
        </div>
      </main>
    </>
  )
}
