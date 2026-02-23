import React from "react";
export default function MessageBubble({ from="other", children }: { from?: "you"|"other"|"system"; children: React.ReactNode }) {
  if (from==="system") {
    return <div className="my-2 text-center text-[12px] text-slate-500">{children}</div>;
  }
  const you = from==="you";
  return (
    <div className={`flex ${you ? "justify-end" : "justify-start"} my-1`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13px] leading-5
        ${you ? "bg-violet-100 text-slate-900" : "bg-slate-100 text-slate-900"}`}>
        {children}
      </div>
    </div>
  );
}
