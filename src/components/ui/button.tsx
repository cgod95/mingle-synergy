
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-button transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[#F3643E] text-white shadow-[0_2px_8px_rgba(243,100,62,0.2)] hover:brightness-105 hover:shadow-none",
        destructive:
          "bg-[#EF4444] text-white hover:brightness-105",
        outline:
          "border border-[#E5E7EB] bg-white hover:bg-[#F9F9F9] text-[#212832]",
        secondary:
          "bg-[#F9F9F9] text-[#7B8794] hover:bg-[#F1F5F9]",
        ghost: "hover:bg-[#F9F9F9] text-[#7B8794]",
        link: "text-[#F3643E] underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-[#F3643E] to-[#FF7D58] text-white shadow-[0_2px_8px_rgba(243,100,62,0.2)] hover:brightness-105 hover:shadow-none",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-full px-4",
        lg: "h-14 rounded-full px-8 text-[18px]",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
