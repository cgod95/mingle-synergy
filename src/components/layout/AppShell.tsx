import { Outlet } from "react-router-dom";
import BottomNav from "../BottomNav";
import MingleHeader from "./MingleHeader";
import { DemoModeIndicator } from "../DemoModeIndicator";
import config from "@/config";
import { useSyncUserState } from "@/hooks/useSyncUserState";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";

export default function AppShell() {
  // Sync user state from Firebase on startup
  useSyncUserState();
  
  // Listen for new match notifications and show toasts
  useMatchNotifications();
  
  return (
    <div className="min-h-screen bg-neutral-900 pb-14">
      {/* Closed Beta indicator - shows when DEMO_MODE is true (for development) */}
      {config.DEMO_MODE && <DemoModeIndicator variant="compact" />}
      <MingleHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      {/* BottomNav will hide itself during onboarding */}
      <BottomNav />
    </div>
  );
}
