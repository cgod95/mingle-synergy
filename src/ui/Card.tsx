import React from "react";
export default function Card({ className="", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-neutral-700 bg-neutral-800 shadow-sm ${className}`} {...rest} />;
}
