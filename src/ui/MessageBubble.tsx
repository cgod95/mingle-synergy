import React from "react";
export default function MessageBubble({ from="other", children }: { from?: "you"|"other"|"system"; children: React.ReactNode }) {
  if (from==="system") {
    return <div className="my-2 text-center text-xs text-neutral-500">{children}</div>;
  }
  const you = from==="you";
  return (
    <div className={`flex ${you ? "justify-end" : "justify-start"} my-1`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-5
        ${you ? "bg-violet-600 text-white" : "bg-neutral-800 text-neutral-100"}`}>
        {children}
      </div>
    </div>
  );
}
