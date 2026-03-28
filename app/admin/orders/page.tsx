import { OrderService } from '@/lib/services/OrderService'
import { AdminOrderCard } from '@/components/admin/AdminOrderCard'
import { Navbar } from '@/components/ui/Navbar'

export const revalidate = 0 // always fresh

export default async function AdminOrdersPage() {
  const orders = await OrderService.listForAdmin({ limit: 50 })

  const pendingCod = orders.filter((o) => o.status === 'cod_confirmed').length

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1
            className="mb-1 text-[22px] font-semibold text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.01em' }}
          >
            Admin
          </h1>
          <p className="mb-5 text-[15px] text-[var(--text-secondary)]">
            Orders
            {pendingCod > 0 && (
              <span className="ml-2 inline-flex items-center rounded-[4px] bg-amber-100 px-2 py-0.5 text-[12px] font-medium text-amber-700">
                {pendingCod} pending COD
              </span>
            )}
          </p>

          {orders.length === 0 ? (
            <p className="py-12 text-center text-[15px] text-[var(--text-secondary)]">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <AdminOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
