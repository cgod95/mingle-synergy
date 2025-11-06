import React from "react";
type Props = React.HTMLAttributes<HTMLSpanElement> & { tone?: "info"|"success"|"warning"|"danger"|"muted" };
export default function Badge({ tone="info", className="", ...rest }: Props) {
  const toneMap = {
    info:    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
    warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100",
    danger:  "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
    muted:   "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${toneMap} ${className}`} {...rest} />;
}
