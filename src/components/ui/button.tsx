import * as React from "react";
import { cn } from "#/utils";

/**
 * Simple button component used throughout the layout.
 * It mirrors the API of the Shadcn UI Button but avoids TypeScript
 * generic syntax that can confuse the patch parser.
 */
export const Button = React.forwardRef(function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
  },
  ref: React.Ref<HTMLButtonElement>,
) {
  const {
    className,
    variant = "default",
    size = "default",
    ...rest
  } = props;

  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-muted/50",
    link: "underline-offset-4 hover:underline text-primary",
  };

  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-9 w-9",
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
});

Button.displayName = "Button";

