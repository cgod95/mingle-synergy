import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/create-profile');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center">
      <Header title="Sign Up" />
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white p-6 mt-16 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">Create your account</h2>

        <label className="block mb-2 text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mt-4 mb-2 text-sm font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full mt-6"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
};

export default Signup;
