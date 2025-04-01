import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LocationPermission: React.FC = () => {
  const navigate = useNavigate();

  const handleAllow = () => {
    navigator.geolocation.getCurrentPosition(
      () => navigate("/notification-permission"),
      () => navigate("/notification-permission") // fallback
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <h1 className="text-3xl font-bold mb-4">Allow Location Access</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Mingle helps you find people at the same venue as you. To make that possible, we need your location permission.
      </p>

      <Button className="text-lg px-8 py-4 mb-4" onClick={handleAllow}>
        Allow Location
      </Button>

      <button
        className="text-sm text-muted-foreground underline"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
};

export default LocationPermission;