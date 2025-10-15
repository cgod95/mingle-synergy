import React, { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { OnboardingContext } from "@/context/OnboardingContext";

const ChatPage: React.FC<{ messages: any[]; partnerId: string }> = ({ messages, partnerId }) => {
  const { currentUser } = useContext(AuthContext);
  const { userProfile } = useContext(OnboardingContext);

  const uid = currentUser?.uid || userProfile?.uid;

  return (
    <div className="flex flex-col p-4 space-y-3">
      {messages.map((msg, i) => {
        const isOutbound = msg.from === uid;
        const isLastOutbound =
          isOutbound &&
          i === messages.map(m => m.from === uid).lastIndexOf(true);
        const seenByPartner = msg.readBy?.includes(partnerId);

        return (
          <div
            key={msg.id || i}
            className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl ${
                isOutbound
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
            {isLastOutbound && seenByPartner && (
              <span
                data-testid="seen-indicator"
                className="text-xs text-gray-400 mt-1 ml-2"
              >
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
