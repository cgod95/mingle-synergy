import React from "react"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export type InputOTPProps = React.InputHTMLAttributes<HTMLInputElement>

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn("text-center text-lg font-semibold", className)}
      {...props}
    />
  )
)
InputOTP.displayName = "InputOTP"

export type InputOTPGroupProps = React.InputHTMLAttributes<HTMLDivElement>

const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
)
InputOTPGroup.displayName = "InputOTPGroup"

export interface InputOTPSlotProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  char?: string
  hasFakeCaret?: boolean
}

const InputOTPSlot = React.forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ char, hasFakeCaret, className, ...props }, ref) => (
    <div className={cn("relative h-10 w-10 text-center text-lg", className)}>
      <Input
        ref={ref}
        className={cn(
          "absolute inset-0 text-center text-lg font-semibold",
          className
        )}
        {...props}
      />
      {char && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {char}
        </div>
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-4 w-px bg-foreground duration-150" />
        </div>
      )}
    </div>
  )
)
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  )
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
