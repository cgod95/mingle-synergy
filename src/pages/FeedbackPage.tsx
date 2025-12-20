import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { logError } from "@/utils/errorHandler";
import config from "@/config";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (!config.DEMO_MODE && firestore) {
        // Save to Firestore in production
        await addDoc(collection(firestore, 'feedback'), {
          text: text.trim(),
          userId: currentUser?.uid || 'anonymous',
          timestamp: serverTimestamp(),
          status: 'new'
        });
      }
      
      setSent(true);
      setText("");
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      logError(error as Error, { source: 'FeedbackPage', action: 'submitFeedback' });
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="mx-auto max-w-md p-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold">Feedback</h1>
        <p className="mb-4 text-sm text-neutral-600">Tell us what to improve.</p>
        {sent ? (
          <div className="rounded-xl bg-green-50 p-3 text-green-700">Thanks! We’ve got it.</div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <textarea 
              className="rounded-xl border px-3 py-2" 
              rows={5} 
              value={text} 
              onChange={(e)=>setText(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              className="rounded-xl bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" 
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
