import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-constants"
import { InlineSpinner } from "./LoadingSpinner"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Always pass a single child to Slot
    const content = loading ? (
      <span className="flex items-center justify-center">
        <InlineSpinner size="sm" className="mr-2" />
        <span>
          {children}
        </span>
      </span>
    ) : (
      <span>
        {children}
      </span>
    );

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }), 
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          !disabled && !loading && "transition-transform hover:scale-[1.02] active:scale-[0.98]"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
