import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logger from '@/utils/Logger';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg mb-8 text-gray-600">The page you are looking for does not exist.</p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/signin')}
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default NotFound;
