import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveMatches } from "@/lib/matchesCompat";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const RealChatRoom = React.lazy(() => import("./ChatRoom"));

export default function ChatRoomGuard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || localStorage.getItem("userId") || "demo_user";

  const [ready, setReady] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    // Guard: ensure we have required values before proceeding
    if (!id || typeof navigate !== 'function') {
      return;
    }

    let alive = true;
    (async () => {
      try {
        const all = await getActiveMatches(userId);
        const match = all.find(m => m.id === id);
        if (!alive) return;
        if (!match) {
          if (all.length) {
            toast("Previous chat isn't available; opening your active chat.");
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
      } catch (error) {
        console.error("Error loading chat:", error);
        toast("Error loading chat.");
        navigate("/matches", { replace: true });
        setOk(false);
      } finally {
        if (alive) {
          setReady(true);
        }
      }
    })();
    return () => { alive = false; };
  }, [id, navigate, userId]);

  return (
    <>
      <Toaster position="top-center" />
      {!ready ? <LoadingSpinner variant="fullscreen" message="Loading chat..." /> :
        ok ? <React.Suspense fallback={<LoadingSpinner variant="fullscreen" message="Opening chat..." />}><RealChatRoom /></React.Suspense> : null}
    </>
  );
}
