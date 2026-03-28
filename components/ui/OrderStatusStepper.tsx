import type { OrderStatus } from '@/types'

const STEPS: { key: string; label: string }[] = [
  { key: 'created', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

// Map current status to a 1-based step number
function getStepIndex(status: string): number {
  if (['delivered'].includes(status)) return 4
  if (['shipped'].includes(status)) return 3
  if (['processing', 'paid'].includes(status)) return 2
  if (['created', 'cod_confirmed', 'payment_initiated'].includes(status)) return 1
  return 0
}

interface OrderStatusStepperProps {
  status: OrderStatus
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const activeStep = getStepIndex(status)
  const isFailed = ['cancelled', 'payment_failed'].includes(status)

  if (isFailed) return null

  return (
    <div className="mb-6 flex items-start">
      {STEPS.map((step, i) => {
        const stepNum = i + 1
        const isCompleted = activeStep > stepNum
        const isActive = activeStep === stepNum

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted || isActive ? 'bg-[var(--fit-exact-bg)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  isCompleted
                    ? 'bg-[var(--fit-exact-bg)] text-white'
                    : isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-[var(--border)] bg-white text-[var(--text-secondary)]'
                }`}
              >
                {isCompleted ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted ? 'bg-[var(--fit-exact-bg)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-1.5 px-1 text-center text-[10px] font-medium leading-tight ${
                isActive
                  ? 'text-[var(--accent)]'
                  : isCompleted
                  ? 'text-[var(--fit-exact-bg)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
