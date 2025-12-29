import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { logError } from "@/utils/errorHandler";
import config from "@/config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { goBackSafely } from "@/utils/navigation";
import BottomNav from "@/components/BottomNav";

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('other');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (!config.DEMO_MODE && firestore) {
        // Save to Firestore in production
        await addDoc(collection(firestore, 'feedback'), {
          text: text.trim(),
          email: email.trim() || null,
          type: feedbackType,
          userId: currentUser?.uid || 'anonymous',
          userEmail: currentUser?.email || null,
          timestamp: serverTimestamp(),
          status: 'new',
          source: 'web-app',
          userAgent: navigator.userAgent,
        });
      }
      
      // Also save to localStorage for demo mode or as backup
      try {
        const feedbackHistory = JSON.parse(localStorage.getItem('mingle:feedback') || '[]');
        feedbackHistory.push({
          text: text.trim(),
          email: email.trim() || null,
          type: feedbackType,
          timestamp: Date.now(),
        });
        localStorage.setItem('mingle:feedback', JSON.stringify(feedbackHistory));
      } catch {
        // Non-critical
      }
      
      setSent(true);
      setText("");
      setEmail("");
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it soon.",
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
    <div className="min-h-screen bg-neutral-900 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBackSafely(navigate, '/settings')}
            className="text-indigo-400 hover:text-indigo-300 hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-white">Send Feedback</CardTitle>
                <CardDescription className="text-neutral-400">
                  Help us make Mingle better
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thank you!</h3>
                <p className="text-neutral-400 mb-6">
                  We've received your feedback and will review it soon.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="border-indigo-600 text-indigo-400 hover:bg-indigo-900/30"
                >
                  Send More Feedback
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-neutral-300">Type</Label>
                  <Select value={feedbackType} onValueChange={(v) => setFeedbackType(v as FeedbackType)}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="bug" className="text-white hover:bg-neutral-700">🐛 Bug Report</SelectItem>
                      <SelectItem value="feature" className="text-white hover:bg-neutral-700">✨ Feature Request</SelectItem>
                      <SelectItem value="improvement" className="text-white hover:bg-neutral-700">💡 Improvement</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-neutral-700">💬 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Feedback Text */}
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-neutral-300">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Share your thoughts, report bugs, or suggest features..."
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 min-h-[120px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Email (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    Email <span className="text-neutral-500">(optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-neutral-500">
                    Provide your email if you'd like us to follow up with you.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSubmitting || !text.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Beta info */}
        <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-700/30 rounded-lg">
          <p className="text-sm text-indigo-300">
            <strong>Beta Testers:</strong> Your feedback is incredibly valuable! 
            We read every submission and use it to improve Mingle.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
