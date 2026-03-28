const STEPS = ['Your details', 'Verify', 'Review + Pay']

interface CheckoutStepsProps {
  currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-6 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const stepNumber = i + 1
        const isCompleted = currentStep > stepNumber
        const isActive = currentStep === stepNumber

        return (
          <div key={label} className="flex items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                isCompleted
                  ? 'text-white'
                  : isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--border)] text-[var(--text-secondary)]'
              }`}
              style={isCompleted ? { backgroundColor: 'var(--accent)', opacity: 0.6 } : undefined}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-8 ${
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
