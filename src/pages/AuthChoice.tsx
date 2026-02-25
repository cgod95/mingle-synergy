import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function AuthChoice() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start pt-[15vh] min-h-[80vh] text-center space-y-8 px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">Welcome to Mingle</h1>
        <p className="text-lg text-neutral-300">Choose how you want to continue:</p>
        <div className="flex gap-4 w-full max-w-sm">
          <Button onClick={() => navigate('/signup')} className="flex-1 h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl">Sign Up</Button>
          <Button variant="outline" onClick={() => navigate('/signin')} className="flex-1 h-14 border-neutral-600 hover:bg-neutral-700 text-neutral-300 font-semibold text-base rounded-2xl">Sign In</Button>
        </div>
      </div>
    </Layout>
  );
} 