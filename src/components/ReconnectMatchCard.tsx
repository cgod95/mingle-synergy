import React from 'react';

interface ReconnectMatchCardProps {
  name: string;
  onReconnect: () => void;
}

const ReconnectMatchCard: React.FC<ReconnectMatchCardProps> = ({ name, onReconnect }) => {
  return (
    <div className="p-4 border border-neutral-700 rounded-2xl shadow bg-neutral-800 max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">Match expired</h3>
      <p className="text-sm text-neutral-400 mb-4">
        Your match with <span className="font-medium text-white">{name}</span> expired. Reconnect by checking in again.
      </p>
      <button
        onClick={onReconnect}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition min-h-[44px]"
      >
        Reconnect now
      </button>
    </div>
  );
};

export default ReconnectMatchCard; 