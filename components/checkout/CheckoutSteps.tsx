const STEPS = [
  { label: 'Your details', short: 'Details' },
  { label: 'Verify', short: 'Verify' },
  { label: 'Review + Pay', short: 'Pay' },
]

interface CheckoutStepsProps {
  currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8 flex items-start justify-center gap-0">
      {STEPS.map((step, i) => {
        const stepNumber = i + 1
        const isCompleted = currentStep > stepNumber
        const isActive = currentStep === stepNumber

        return (
          <div key={step.label} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold ${
                  isCompleted
                    ? 'text-white'
                    : isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--border)] text-[var(--text-secondary)]'
                }`}
                style={isCompleted ? { backgroundColor: 'var(--accent)', opacity: 0.6 } : undefined}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeLinecap="round"
                  >
                    <path d="M5 12l4 4L19 7" stroke="white" strokeWidth="2" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`mt-1 text-center text-[11px] font-medium ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : isCompleted
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)]'
                }`}
                style={isCompleted ? { opacity: 0.6 } : undefined}
              >
                {step.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 mt-4 h-px w-10 ${
                  isCompleted ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
                style={isCompleted ? { opacity: 0.6 } : undefined}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
