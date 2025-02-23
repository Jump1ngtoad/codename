import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transform active:translate-y-0.5 active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_6px_0_0_hsl(var(--primary-dark))] hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_6px_0_0_hsl(var(--destructive-dark))] hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-[0_6px_0_0_hsl(var(--border))] hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_6px_0_0_hsl(var(--secondary-dark))] hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-none active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline shadow-none active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
) 