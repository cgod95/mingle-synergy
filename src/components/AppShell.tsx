import { ReactNode } from "react";
import BottomNav from "./layout/BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-5xl pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
