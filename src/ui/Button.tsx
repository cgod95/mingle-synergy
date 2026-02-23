import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};
export default function Button({ variant="primary", size="md", className="", ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all";
  const sizes = size==="sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  const styles = {
    primary:  "bg-violet-600 text-white hover:bg-violet-700 shadow-sm",
    secondary:"bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700",
    ghost:    "bg-transparent text-neutral-300 hover:bg-neutral-800",
    danger:   "bg-rose-600 text-white hover:bg-rose-700"
  }[variant];
  return <button className={`${base} ${sizes} ${styles} ${className}`} {...rest} />;
}
