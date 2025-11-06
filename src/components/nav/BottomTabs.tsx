import { Link } from "react-router-dom";

const items = [
  { to: "/venues", label: "Venues", icon: "🏙️" },
  { to: "/matches", label: "Matches", icon: "💫" },
  { to: "/chat",    label: "Chat",    icon: "💬" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomTabs({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-screen-md border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="grid grid-cols-4">
        {items.map(it => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center justify-center py-3 text-xs"
            >
              <span className={`text-lg ${active ? "opacity-100" : "opacity-60"}`}>{it.icon}</span>
              <span className={`${active ? "font-medium" : "text-neutral-500"}`}>{it.label}</span>
              {active && <span className="mt-1 h-1 w-6 rounded-full bg-neutral-900" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
