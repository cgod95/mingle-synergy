import React from "react";

interface ReconnectButtonProps {
  onClick: () => void;
}

const ReconnectButton: React.FC<ReconnectButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mt-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
    >
      Reconnect
    </button>
  );
};

export default ReconnectButton; 