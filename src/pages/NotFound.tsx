import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/utils/errorHandler";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logError(new Error(`404 Error: User attempted to access non-existent route: ${location.pathname}`), { source: 'NotFound', action: 'routeAccess', pathname: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-4xl mx-auto px-4 py-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-900/50 flex items-center justify-center"
        >
          <SearchX className="w-12 h-12 text-indigo-400" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">404 - Page Not Found</h1>
        <p className="text-neutral-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate('/signin')}
            variant="outline"
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
