import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-lg active:shadow-md",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg active:shadow-md",
        outline:
          "border-2 border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-600",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 shadow-sm hover:shadow-md dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        ghost: "hover:bg-neutral-100 text-neutral-700 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:active:bg-neutral-700",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/90 active:text-primary/80 dark:text-primary dark:hover:text-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[100px]",
        sm: "h-9 rounded-md px-3 text-xs min-w-[80px]",
        lg: "h-12 rounded-lg px-8 text-base min-w-[120px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
) 