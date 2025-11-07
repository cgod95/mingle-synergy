import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function AuthChoice() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
        <h1 className="text-4xl font-bold text-neutral-900">Welcome to Mingle</h1>
        <p className="text-lg text-neutral-600">Choose how you want to continue:</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/onboarding')}>Sign Up</Button>
          <Button variant="outline" onClick={() => navigate('/signin')}>Sign In</Button>
        </div>
      </div>
    </Layout>
  );
} 