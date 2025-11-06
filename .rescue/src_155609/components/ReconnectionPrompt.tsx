import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ReconnectionPromptProps {
  name: string;
}

const ReconnectionPrompt: React.FC<ReconnectionPromptProps> = ({ name }) => {
  const navigate = useNavigate();

  const handleReconnect = () => {
    navigate('/reconnect'); // Redirects user to dedicated reconnect page
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Reconnect with {name}</h3>
      <p className="text-sm text-blue-800 mb-4">
        To reconnect with <strong>{name}</strong>, you both need to check into the same venue again.
      </p>
      <button
        onClick={handleReconnect}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Reconnect Now
      </button>
    </div>
  );
};

export default ReconnectionPrompt; 