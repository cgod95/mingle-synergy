import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <section className="mx-auto max-w-md p-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-full bg-neutral-200"></div>
          <div>
            <div className="text-lg font-semibold">{user?.name ?? "You"}</div>
            <div className="text-sm text-neutral-500">{user?.email ?? "demo@mingle"}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div><div className="font-semibold">—</div><div className="text-neutral-500">Likes</div></div>
          <div><div className="font-semibold">—</div><div className="text-neutral-500">Matches</div></div>
          <div><div className="font-semibold">—</div><div className="text-neutral-500">Check-ins</div></div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/profile/edit" className="rounded-xl bg-neutral-900 px-4 py-2 text-center text-white">Edit Profile</Link>
          <Link to="/feedback" className="rounded-xl border px-4 py-2 text-center">Send Feedback</Link>
          <button onClick={logout} className="rounded-xl border px-4 py-2">Sign out</button>
        </div>
      </div>
    </section>
  );
}
