import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveMatches, MATCH_EXPIRY_MS } from "@/lib/matchesCompat";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { logError } from "@/utils/errorHandler";

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
        if (config.DEMO_MODE) {
          // Demo mode: use localStorage-based matches
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
        } else {
          // Production: verify match exists in Firebase
          const { default: matchService } = await import('@/services/firebase/matchService');
          const match = await matchService.getMatchById(id);
          if (!alive) return;
          
          if (!match) {
            // Match not found - get all matches to redirect or go to matches page
            const allMatches = await matchService.getMatches(currentUser?.uid || userId);
            if (allMatches.length > 0) {
              toast("Previous chat isn't available; opening your active chat.");
              navigate(`/chat/${allMatches[0].id}`, { replace: true });
              setOk(true);
            } else {
              toast("No active chats right now.");
              navigate("/matches", { replace: true });
              setOk(false);
            }
          } else {
            // Check if match is expired
            const isExpired = Date.now() - match.timestamp > MATCH_EXPIRY_MS;
            if (isExpired) {
              toast("This match has expired. Check into the same venue to reconnect!");
              navigate("/matches", { replace: true });
              setOk(false);
              return;
            }
            
            // Verify current user is a participant
            const isParticipant = match.userId1 === currentUser?.uid || match.userId2 === currentUser?.uid;
            if (!isParticipant) {
              toast("You don't have access to this chat.");
              navigate("/matches", { replace: true });
              setOk(false);
            } else {
              setOk(true);
            }
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoomGuard', matchId: id, userId });
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
  }, [id, navigate, userId, currentUser?.uid]);

  return (
    <>
      <Toaster position="top-center" />
      {!ready ? <div className="p-6 animate-pulse text-muted-foreground">Loading chat…</div> :
        ok ? <React.Suspense fallback={<div className="p-6">Opening chat…</div>}><RealChatRoom /></React.Suspense> : null}
    </>
  );
}
