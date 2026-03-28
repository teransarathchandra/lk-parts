import type { OrderStatus } from '@/types'

const STEPS: { label: string; statuses: OrderStatus[] }[] = [
  { label: 'Pending', statuses: ['created'] },
  { label: 'Confirmed', statuses: ['cod_confirmed', 'paid', 'processing'] },
  { label: 'Shipped', statuses: ['shipped'] },
  { label: 'Delivered', statuses: ['delivered'] },
]

const HAPPY_PATH_STATUSES = new Set<OrderStatus>(STEPS.flatMap((s) => s.statuses))

interface OrderStatusStepperProps {
  status: OrderStatus
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const activeStepIndex = STEPS.findIndex((s) => s.statuses.includes(status))
  const isOffHappyPath = !HAPPY_PATH_STATUSES.has(status)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = activeStepIndex > i
          const isActive = activeStepIndex === i

          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                    isCompleted
                      ? 'bg-[var(--fit-exact-bg)] text-white'
                      : isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  {isCompleted ? '✓' : i + 1}
                </div>
                <span
                  className={`mt-1 text-[11px] ${
                    isActive
                      ? 'font-semibold text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mb-4 h-px w-10 ${
                    isCompleted ? 'bg-[var(--fit-exact-bg)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {isOffHappyPath && (
        <p className="mt-2 text-center text-[13px] text-[var(--text-secondary)]">
          Status: {status.replace(/_/g, ' ')}
        </p>
      )}
    </div>
  )
}
