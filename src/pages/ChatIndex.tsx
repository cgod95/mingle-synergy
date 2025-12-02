import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { listConversations } from "../lib/chatStore";
import { timeAgo } from "../lib/timeago";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ChatListSkeleton } from "@/components/ui/LoadingStates";
import BottomNav from "@/components/BottomNav";

type Row = {
  id: string;
  name: string;
  lastText?: string;
  lastTs?: number;
};

export default function ChatIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Simulate loading delay
      setTimeout(() => {
        const list = listConversations().map((r: any) => ({
          id: r.id,
          name: r.name,
          lastText: r.lastText,
          lastTs: r.lastTs ?? 0,
        }));
        list.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
        setRows(list);
        setIsLoading(false);
      }, 200);
    } catch {
      setRows([]);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">Chats</h1>
          <p className="text-lg text-neutral-600">Your conversations</p>
        </motion.div>

        {isLoading ? (
          <ChatListSkeleton />
        ) : rows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">No conversations yet</h3>
              <p className="text-sm text-neutral-600">Start chatting with your matches!</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all border border-neutral-200 bg-white"
                  onClick={() => navigate(`/chat/${r.id}`)}
                >
                  <div className="flex items-center gap-4 px-6 py-5">
                    <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-indigo-100">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-bold text-lg">
                        {r.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="truncate font-bold text-lg text-neutral-800">{r.name}</div>
                        {r.lastTs && (
                          <div className="ml-3 flex-shrink-0 text-xs text-neutral-500 font-medium">
                            {timeAgo(r.lastTs)}
                          </div>
                        )}
                      </div>
                      <div className="truncate text-sm text-neutral-600">
                        {r.lastText ?? "Start the conversation"}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
