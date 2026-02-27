import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../BottomNav";
import { useSyncUserState } from "@/hooks/useSyncUserState";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { PageTransition } from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeBackWrapper } from "@/components/ui/SwipeBack";

const CheckInPage = lazy(() => import("@/pages/CheckInPage"));
const Matches = lazy(() => import("@/pages/Matches"));
const Profile = lazy(() => import("@/pages/Profile"));

const TAB_ROUTES = ['/checkin', '/matches', '/profile'] as const;
const TAB_ROOTS = new Set<string>(TAB_ROUTES);

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

const TabFallback = () => (
  <div className="min-h-[60dvh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AppShell() {
  const location = useLocation();
  const isTabRoute = TAB_ROOTS.has(location.pathname);
  const prevPathnameRef = useRef(location.pathname);
  const [transitionDirection, setTransitionDirection] = useState<'push' | 'pop' | 'fade'>('fade');
  
  useEffect(() => {
    const dir = getTransitionDirection(prevPathnameRef.current, location.pathname);
    setTransitionDirection(dir);
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  useSyncUserState();
  useMatchNotifications();
  useMessageNotifications();

  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const { isOnline } = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return undefined;
    }
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline]);

  return (
    <div 
      className="min-h-[100dvh] bg-neutral-900"
      style={{
        paddingBottom: keyboardOpen
          ? '0px'
          : 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-amber-600/80 text-white text-xs font-medium text-center py-1.5 px-4">
              You're offline. Some features may not work.
            </div>
          </motion.div>
        )}
        {showBackOnline && isOnline && (
          <motion.div
            key="online"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-green-600/80 text-white text-xs font-medium text-center py-1.5 px-4">
              Back online
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        {/* Keep-alive tab pages — always mounted, toggled via visibility + opacity for smooth transitions */}
        <div className="relative">
          {TAB_ROUTES.map((route) => {
            const isActive = location.pathname === route;
            const Comp = route === '/checkin' ? CheckInPage : route === '/matches' ? Matches : Profile;
            return (
              <div
                key={route}
                style={{
                  visibility: isActive ? 'visible' : 'hidden',
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  transition: 'opacity 120ms ease-in-out',
                  position: isActive ? 'relative' : 'absolute',
                  inset: isActive ? undefined : 0,
                  width: isActive ? undefined : '100%',
                }}
              >
                <Suspense fallback={<TabFallback />}>
                  <ErrorBoundary><Comp /></ErrorBoundary>
                </Suspense>
              </div>
            );
          })}
        </div>

        {/* Non-tab routes use Outlet with page transitions + swipe-back */}
        {!isTabRoute && (
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname} direction={transitionDirection}>
              <SwipeBackWrapper>
                <Outlet />
              </SwipeBackWrapper>
            </PageTransition>
          </AnimatePresence>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
