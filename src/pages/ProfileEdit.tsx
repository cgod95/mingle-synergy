// 🧠 Purpose: Allow the user to edit their display name with clean, validated input and responsive Hinge-style UI

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
        navigate('/profile');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Edit Profile</h1>
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-lg font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl text-lg focus:outline-none focus:ring focus:border-black"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-black text-white text-lg rounded-xl hover:bg-gray-900 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
