import React from 'react';

interface ReconnectMatchCardProps {
  name: string;
  onReconnect: () => void;
}

const ReconnectMatchCard: React.FC<ReconnectMatchCardProps> = ({ name, onReconnect }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-2xl shadow bg-white max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Match expired</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your match with <span className="font-medium">{name}</span> expired. Reconnect by checking in again.
      </p>
      <button
        onClick={onReconnect}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Reconnect now
      </button>
    </div>
  );
};

export default ReconnectMatchCard; 