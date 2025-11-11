import React from "react";

const MessageLimitNotice: React.FC = () => {
  return (
    <div className="p-4 border border-yellow-200 rounded-2xl bg-yellow-50 shadow max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Message Limit Reached</h3>
      <p className="text-sm text-yellow-700">
        You've sent all 5 messages for this match. You can reconnect if you both check in again.
      </p>
    </div>
  );
};

export default MessageLimitNotice; 