import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 font-semibold min-h-11 motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary/90",
        outline: "border border-line bg-surface text-ink hover:bg-bg",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        accent: "bg-accent text-accent-fg hover:bg-accent/90",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", full: false },
  },
);

export function Button({
  className,
  variant,
  full,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>) {
  return <button type={type} className={cn(variants({ variant, full }), className)} {...props} />;
}
