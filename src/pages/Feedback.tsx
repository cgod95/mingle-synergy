import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { feedbackRepo } from "@/services/feedbackRepo";
import { Button } from "@/components/ui/button";
import { logError } from "@/utils/errorHandler";

type FeedbackItem = { id?: string; message: string; createdAt: number; from?: string | null };

export default function Feedback() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      const all = await feedbackRepo.list();
      setItems(all);
    } catch (error) {
      logError(error as Error, { source: 'Feedback', action: 'loadFeedback' });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await feedbackRepo.save(text.trim(), currentUser?.email || currentUser?.name || null);
      setText("");
      setBanner("✅ Thanks for your feedback!");
      setTimeout(() => setBanner(null), 2000);
      await loadFeedback(); // Reload to show new feedback
    } catch (error) {
      logError(error as Error, { source: 'Feedback', action: 'saveFeedback' });
      setBanner("❌ Failed to save feedback. Please try again.");
      setTimeout(() => setBanner(null), 2000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-violet-400 hover:text-violet-300 hover:bg-neutral-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Feedback</h1>
          <p className="text-sm text-neutral-400 mb-6">
            Tell us what feels good, broken, or missing. Your feedback helps us improve!
          </p>

          <form onSubmit={onSubmit} className="mb-8">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 text-white px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-neutral-500 text-base"
              rows={5}
              placeholder="Share your thoughts, report bugs, or suggest features..."
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-3 mt-3">
              <button 
                type="submit" 
                disabled={isSubmitting || !text.trim()}
                className="rounded-full bg-gradient-to-r from-violet-500 to-violet-500 px-6 py-2 text-white hover:from-violet-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </button>
              {banner && (
                <div className={`text-sm ${banner.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {banner}
                </div>
              )}
            </div>
          </form>

          {items.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Your Previous Feedback</h2>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id || it.createdAt} className="rounded-xl border border-neutral-700 bg-neutral-800 p-4">
                    <div className="text-xs text-neutral-500 mb-1">
                      {new Date(it.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-300">{it.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  );
}
