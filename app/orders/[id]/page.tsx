import { Navbar } from '@/components/ui/Navbar'
import { OrderStatusClient } from '@/components/checkout/OrderStatusClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <OrderStatusClient orderId={id} />
        </div>
      </main>
    </>
  )
}
