import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { listConversations } from "../lib/chatStore";
import { timeAgo } from "../lib/timeago";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type Row = {
  id: string;
  name: string;
  lastText?: string;
  lastTs?: number;
};

export default function ChatIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    try {
      const list = listConversations().map((r: any) => ({
        id: r.id,
        name: r.name,
        lastText: r.lastText,
        lastTs: r.lastTs ?? 0,
      }));
      list.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
      setRows(list);
    } catch {
      setRows([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Chats</h1>
          <p className="text-neutral-600">Your conversations</p>
        </motion.div>

        {rows.length === 0 ? (
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
          <div className="space-y-2">
            {rows.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all border border-neutral-200 bg-white"
                  onClick={() => navigate(`/chat/${r.id}`)}
                >
                  <div className="flex items-center gap-4 px-4 py-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">
                        {r.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="truncate font-semibold text-neutral-800">{r.name}</div>
                        {r.lastTs && (
                          <div className="ml-3 flex-shrink-0 text-xs text-neutral-500">
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
    </div>
  );
}
