import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};
export default function Button({ variant="primary", size="md", className="", ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all";
  const sizes = size==="sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  const styles = {
    primary:  "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary:"bg-white border border-slate-200 text-slate-800 hover:bg-slate-50",
    ghost:    "bg-transparent text-slate-700 hover:bg-slate-50",
    danger:   "bg-rose-600 text-white hover:bg-rose-700"
  }[variant];
  return <button className={`${base} ${sizes} ${styles} ${className}`} {...rest} />;
}
