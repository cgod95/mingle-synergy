import { PropsWithChildren } from "react";
import Header from "./Header";
import BottomTab from "./BottomTab";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomTab />
    </div>
  );
}
