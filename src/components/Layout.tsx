// 🧠 Purpose: Shared layout wrapper for all authenticated/protected pages.
// Uses React Router Outlet to render nested routes. Includes bottom navigation
// and demo mode banner (if enabled). Applies consistent structure and animations.

import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import DemoModeIndicator from "@/components/DemoModeIndicator";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      <motion.div
        className="flex-grow overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Outlet />
      </motion.div>
      <BottomNav />
      <DemoModeIndicator variant="compact" />
    </div>
  );
};

export default Layout; 