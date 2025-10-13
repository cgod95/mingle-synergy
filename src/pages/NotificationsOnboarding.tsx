import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsOnboarding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Enable Notifications</h1>
      <p className="text-lg text-gray-600 mb-8">This step will ask the user to enable notifications for new matches and messages.</p>
      <button
        className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold"
        onClick={() => {
          // TODO: Actually enable notifications
          navigate('/sign-up');
        }}
      >
        Enable Notifications
      </button>
    </div>
  );
};

export default NotificationsOnboarding; 