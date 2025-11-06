import { ReactNode } from "react";

/**
 * TEMP: Always allow while we stabilize flows.
 * Hook your real auth/onboarding checks back in later.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
