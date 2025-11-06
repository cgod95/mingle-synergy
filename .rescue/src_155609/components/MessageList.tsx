import React, { useEffect, useRef } from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn(
                "max-w-[75%] px-4 py-2 rounded-lg text-sm",
                isCurrentUser
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-white border text-gray-900 self-start mr-auto"
              )}
            >
              <p>{msg.text}</p>
              <p className={cn(
                "text-xs mt-1 opacity-70",
                isCurrentUser ? "text-right" : "text-left"
              )}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList; 