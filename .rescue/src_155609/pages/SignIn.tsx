import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const nav = useNavigate();
  const loc = useLocation() as unknown as { state?: { from?: string } };
  const { login } = useAuth();
  const from = loc.state?.from || "/venues";

  function onContinue() {
    login({ id: "demo", name: "Demo User", email: "demo@example.com" });
    nav(from, { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-600">This is a demo sign-in. Click continue.</p>
        <button
          onClick={onContinue}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
