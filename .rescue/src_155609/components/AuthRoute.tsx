import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Public-only gate:
 * - If NOT authenticated -> render the public page (children)
 * - If authenticated     -> send them to the app home (/venues)
 */
const AuthRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/venues" replace />;
  }
  return <>{children}</>;
};

export default AuthRoute;
