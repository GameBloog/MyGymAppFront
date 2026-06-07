import React, { useMemo, useState } from "react"
import { CheckCircle2, ChevronDown, ListChecks } from "lucide-react"
import { useOnboarding } from "./useOnboarding"

export const OnboardingChecklist: React.FC = () => {
  const { checklist, checklistCompleted, isActive, isLoading } = useOnboarding()
  const [isExpanded, setIsExpanded] = useState(false)

  const pendingCount = useMemo(
    () => checklist.filter((item) => !item.completed).length,
    [checklist],
  )

  if (isLoading || isActive || checklistCompleted || checklist.length === 0) {
    return null
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[color:var(--student-border)] bg-[color:var(--student-surface-strong)] text-[color:var(--student-text)] shadow-2xl">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-3">
          <span className="rounded-xl bg-[color:var(--student-accent-surface)] p-2">
            <ListChecks className="h-5 w-5 text-[color:var(--student-accent)]" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Primeiros passos</span>
            <span className="block text-xs text-[color:var(--student-text-soft)]">
              {pendingCount} pendência(s) para completar a configuração
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[color:var(--student-text-soft)] transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-[color:var(--student-border)] p-4 pt-3">
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    item.completed
                      ? "text-[color:var(--student-success)]"
                      : "text-[color:var(--student-text-muted)]"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs leading-5 text-[color:var(--student-text-soft)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
