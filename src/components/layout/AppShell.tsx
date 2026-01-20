import { Outlet } from "react-router-dom";
import BottomNav from "../BottomNav";
import MingleHeader from "./MingleHeader";
import { useSyncUserState } from "@/hooks/useSyncUserState";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";

export default function AppShell() {
  // Sync user state from Firebase on startup
  useSyncUserState();
  
  // Listen for new match notifications and show toasts
  useMatchNotifications();
  
  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-neutral-900"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <MingleHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
