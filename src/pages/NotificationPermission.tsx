import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotificationPermission: React.FC = () => {
  const navigate = useNavigate();

  const handlePermission = async () => {
    try {
      const result = await Notification.requestPermission();
      console.log("Notification permission:", result);
      navigate("/email-signup");
    } catch (error) {
      console.error("Notification permission error:", error);
      navigate("/email-signup");
    }
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      navigate("/email-signup");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <h1 className="text-3xl font-bold mb-4">Allow Notifications</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We'll use notifications to let you know about matches, messages, and updates when you're checked in.
      </p>

      <Button className="text-lg px-8 py-4 mb-4" onClick={handlePermission}>
        Allow Notifications
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

export default NotificationPermission;