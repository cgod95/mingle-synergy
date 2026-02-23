import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../BottomNav";
import MingleHeader from "./MingleHeader";
import { useSyncUserState } from "@/hooks/useSyncUserState";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { PageTransition } from "@/components/ui/PageTransition";
import { AnimatePresence, motion } from "framer-motion";

const TAB_ROOTS = new Set(['/checkin', '/matches', '/profile']);

function getRouteDepth(pathname: string): number {
  if (TAB_ROOTS.has(pathname)) return 0;
  return pathname.split('/').filter(Boolean).length;
}

function getTransitionDirection(prev: string, next: string): 'push' | 'pop' | 'fade' {
  const prevDepth = getRouteDepth(prev);
  const nextDepth = getRouteDepth(next);
  if (TAB_ROOTS.has(prev) && TAB_ROOTS.has(next)) return 'fade';
  if (nextDepth > prevDepth) return 'push';
  if (nextDepth < prevDepth) return 'pop';
  return 'fade';
}

export default function AppShell() {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const [transitionDirection, setTransitionDirection] = useState<'push' | 'pop' | 'fade'>('fade');
  
  useEffect(() => {
    const dir = getTransitionDirection(prevPathnameRef.current, location.pathname);
    setTransitionDirection(dir);
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  useSyncUserState();
  useMatchNotifications();

  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const { isOnline } = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-neutral-900"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        // When keyboard is open the BottomNav hides, so drop the 80px nav padding
        paddingBottom: keyboardOpen
          ? '0px'
          : 'calc(72px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <MingleHeader />
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-600/90 text-white text-xs font-medium text-center py-1.5 px-4">
              You're offline. Some features may not work.
            </div>
          </motion.div>
        )}
        {showBackOnline && isOnline && (
          <motion.div
            key="online"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-green-600/90 text-white text-xs font-medium text-center py-1.5 px-4">
              Back online
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} direction={transitionDirection}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
