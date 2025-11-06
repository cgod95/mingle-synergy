import { Outlet, useLocation, Link } from "react-router-dom";
import BottomTabs from "@/components/nav/BottomTabs";

export default function AppShell() {
  const loc = useLocation();
  const hideTabs = false; // keep tabs visible across app for now
  return (
    <div className="mx-auto min-h-dvh max-w-screen-md bg-neutral-50 text-neutral-900">
      <main className="pb-[76px]">
        <Outlet />
      </main>
      {!hideTabs && <BottomTabs pathname={loc.pathname} />}
    </div>
  );
}
