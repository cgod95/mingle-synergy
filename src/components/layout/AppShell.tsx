import { Outlet } from "react-router-dom";
import BottomNav from "../BottomNav";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-14">
      <main className="mx-auto max-w-md p-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
