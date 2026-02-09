import { Link } from "react-router-dom";

const items = [
  { to: "/checkin", label: "Venues", icon: "🏙️" },
  { to: "/matches", label: "Matches", icon: "💫" },
  { to: "/matches", label: "Chat",    icon: "💬" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomTabs({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-screen-md border-t border-neutral-700/50 nav-blur-ios hide-on-keyboard" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}>
      <div className="grid grid-cols-4">
        {items.map(it => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center justify-center py-3 text-xs min-h-[44px]"
            >
              <span className={`text-lg ${active ? "opacity-100" : "opacity-60"}`}>{it.icon}</span>
              <span className={`${active ? "font-medium text-indigo-400" : "text-neutral-500"}`}>{it.label}</span>
              {active && <span className="mt-1 h-1 w-6 rounded-full bg-indigo-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
