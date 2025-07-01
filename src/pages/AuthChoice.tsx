import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AuthChoice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Mingle</h1>
      <p className="text-lg mb-8 text-gray-600">Choose how you want to continue:</p>
      <div className="flex gap-4">
        <Button onClick={() => navigate('/onboarding')}>Sign Up</Button>
        <Button variant="outline" onClick={() => navigate('/signin')}>Sign In</Button>
      </div>
    </div>
  );
} 