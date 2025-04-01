import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Philosophy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background image or video */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg.jpg" // or replace with a hosted image URL or video element
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Mingle</h1>
        <p className="text-lg mb-8 max-w-xl">
          Discover people near you at the same venues. Mingle is all about real connections in real spaces.
        </p>

        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <Button
            variant="default"
            className="w-full text-lg py-6"
            onClick={() => navigate("/location-permission")}
          >
            Create Account
          </Button>
          <Button
            variant="outline"
            className="w-full text-lg py-6 text-white border-white"
            onClick={() => navigate("/signup")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Philosophy;