// 🧠 Purpose: Create the SignIn page to allow existing users to log in. This completes the /signin route and uses Firebase Auth for authentication.

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/venues');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome back</h1>
        <p className="text-sm text-muted-foreground text-center">Sign in to continue</p>

        <div className="space-y-4">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleSignIn} className="w-full" disabled={!email.trim() || !password.trim()}>Sign In</Button>
          <p className="text-xs text-center text-muted-foreground">Don't have an account? <a className="underline" href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}
