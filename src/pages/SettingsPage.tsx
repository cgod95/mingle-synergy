import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="w-full max-w-md space-y-4">
        <Link to="/profile/edit" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Edit Profile</Link>
        <Link to="/preferences" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Preferences</Link>
        <Link to="/account-settings" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Account Settings</Link>
        <Link to="/terms" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Terms & Conditions</Link>
        <Link to="/privacy" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Privacy Policy</Link>
        <Link to="/safety" className="block w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-900">Safety</Link>
        <button
          onClick={() => navigate('/logout')}
          className="block w-full p-4 rounded-lg bg-red-100 hover:bg-red-200 font-medium text-red-700 mt-8"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage; 