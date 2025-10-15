import React, { useContext, useMemo } from "react";
import { AuthContext } from "@/context/AuthContext";
import { OnboardingContext } from "@/context/OnboardingContext";

type Message = {
  id?: string;
  text: string;
  from: string;
  readBy?: string[];
};

type ChatPageProps = {
  messages: Message[];
  partnerId: string;
};

const ChatPage: React.FC<ChatPageProps> = ({ messages, partnerId }) => {
  const { currentUser } = useContext(AuthContext);
  const { userProfile } = useContext(OnboardingContext);

  const uid = currentUser?.uid || userProfile?.uid;

  // precompute last outbound index to avoid recomputing inside render
  const lastOutboundIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]?.from === uid) idx = i;
    }
    return idx;
  }, [messages, uid]);

  return (
    <div className="flex flex-col p-4 space-y-3">
      {messages.map((msg, i) => {
        const isOutbound = msg.from === uid;
        const isLastOutbound = isOutbound && i === lastOutboundIndex;
        const seenByPartner = Boolean(msg.readBy?.includes(partnerId));

        return (
          <div
            key={msg.id ?? `${i}`}
            className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl ${
                isOutbound ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
            {isLastOutbound && seenByPartner && (
              <span data-testid="seen-indicator" className="text-xs text-gray-400 mt-1 ml-2">
                Seen
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatPage;
