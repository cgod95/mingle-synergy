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
          className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#6D28D9]/10 flex items-center justify-center"
        >
          <SearchX className="w-12 h-12 text-[#A78BFA]" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">404 - Page Not Found</h1>
        <p className="text-[#9CA3AF] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate('/signin')}
            variant="outline"
            className="border-[#2D2D3A] hover:bg-[#1a1a24] text-[#9CA3AF]"
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
