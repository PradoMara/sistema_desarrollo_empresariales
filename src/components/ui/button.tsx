import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-[0_10px_24px_rgba(2,132,199,0.28)]",
  secondary: "border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
  ghost: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-[0_10px_24px_rgba(225,29,72,0.24)]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}