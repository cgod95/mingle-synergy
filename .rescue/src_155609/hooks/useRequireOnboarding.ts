import * as React from "react";

type Result = {
  isOnboardingComplete: boolean;
  setIsOnboardingComplete: (v: boolean) => void;
};

export default function useRequireOnboarding(): Result {
  const demo = import.meta.env.VITE_DEMO_MODE === "true";
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState<boolean>(demo ? true : false);

  // If you had redirect logic before, we intentionally skip it in demo mode.
  React.useEffect(() => {
    if (demo) return;
    // (keep any real redirect checks here in non-demo)
  }, [demo]);

  return { isOnboardingComplete, setIsOnboardingComplete };
}
