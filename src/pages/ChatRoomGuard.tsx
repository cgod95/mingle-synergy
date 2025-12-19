import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveMatches } from "@/lib/matchesCompat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const RealChatRoom = React.lazy(() => import("./ChatRoom"));

export default function ChatRoomGuard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Only use currentUser.uid - don't fall back to arbitrary values
  const userId = currentUser?.uid;

  const [ready, setReady] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    // Guard: ensure we have required values before proceeding
    if (!id || typeof navigate !== 'function') {
      return;
    }
    
    // If no authenticated user, redirect to sign in
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view chats.",
        variant: "destructive",
      });
      navigate("/signin", { replace: true });
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
            toast({
              title: "Chat unavailable",
              description: "Opening your most recent chat instead.",
            });
            navigate(`/chat/${all[0].id}`, { replace: true });
            setOk(true);
          } else {
            toast({
              title: "No active chats",
              description: "You don't have any active matches right now.",
            });
            navigate("/matches", { replace: true });
            setOk(false);
          }
        } else {
          setOk(true);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        toast({
          title: "Error loading chat",
          description: "Please try again.",
          variant: "destructive",
        });
        navigate("/matches", { replace: true });
        setOk(false);
      } finally {
        if (alive) {
          setReady(true);
        }
      }
    })();
    return () => { alive = false; };
  }, [id, navigate, userId, toast]);

  return (
    <>
      {!ready ? <LoadingSpinner variant="fullscreen" message="Loading chat..." /> :
        ok ? <React.Suspense fallback={<LoadingSpinner variant="fullscreen" message="Opening chat..." />}><RealChatRoom /></React.Suspense> : null}
    </>
  );
}
