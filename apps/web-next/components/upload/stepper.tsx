"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: number
  name: string
  description: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}

export function Stepper({ steps, currentStep, completedSteps }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 && "flex-1")}>
            <div className="flex items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2",
                  completedSteps.includes(step.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground bg-background text-muted-foreground",
                )}
              >
                {completedSteps.includes(step.id) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    completedSteps.includes(step.id) || currentStep === step.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.name}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 top-10 h-6 w-0.5",
                  completedSteps.includes(step.id) ? "bg-primary" : "bg-muted-foreground",
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
