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
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center"
        >
          <SearchX className="w-12 h-12 text-indigo-600" />
        </motion.div>
        <h1 className="text-heading-1 mb-3">404 - Page Not Found</h1>
        <p className="text-body-secondary mb-8">
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
            className="border-neutral-300 hover:bg-neutral-50"
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
