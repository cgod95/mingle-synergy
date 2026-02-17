import { Outlet } from "react-router-dom";
import BottomNav from "../BottomNav";
import MingleHeader from "./MingleHeader";
import { useSyncUserState } from "@/hooks/useSyncUserState";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

export default function AppShell() {
  // Sync user state from Firebase on startup
  useSyncUserState();
  
  // Listen for new match notifications and show toasts
  useMatchNotifications();

  // Track keyboard visibility so BottomNav hides and padding adjusts.
  // The hook adds 'keyboard-visible' to <body>, which triggers
  // .hide-on-keyboard in CSS (used by BottomNav).
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  
  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-neutral-900"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        // When keyboard is open the BottomNav hides, so drop the 80px nav padding
        paddingBottom: keyboardOpen
          ? '0px'
          : 'calc(80px + env(safe-area-inset-bottom, 0px))',
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
