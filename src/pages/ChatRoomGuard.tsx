import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveMatches } from "@/lib/matchesCompat";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const RealChatRoom = React.lazy(() => import("./ChatRoom"));

export default function ChatRoomGuard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || localStorage.getItem("userId") || "demo_user";

  const [ready, setReady] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const all = await getActiveMatches(userId);
      const match = all.find(m => m.id === id);
      if (!alive) return;
      if (!match) {
        if (all.length) {
          toast("Previous chat isn’t available; opening your active chat.");
          navigate(`/chat/${all[0].id}`, { replace: true });
          setOk(true);
        } else {
          toast("No active chats right now.");
          navigate("/matches", { replace: true });
          setOk(false);
        }
      } else {
        setOk(true);
      }
      setReady(true);
    })();
    return () => { alive = false; };
  }, [id, navigate, userId]);

  return (
    <>
      <Toaster position="top-center" />
      {!ready ? <div className="p-6 animate-pulse text-muted-foreground">Loading chat…</div> :
        ok ? <React.Suspense fallback={<div className="p-6">Opening chat…</div>}><RealChatRoom /></React.Suspense> : null}
    </>
  );
}
