import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SuccessAlert } from "@/components/DisplayUtils";
import Layout from "@/components/Layout";
import BottomNav from "@/components/BottomNav";

export default function CheckInSuccess() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center pb-20">
        <SuccessAlert message="You've successfully checked in to the venue!" />
        <h1 className="text-3xl font-bold mb-4">You're checked in! 🎉</h1>
        <p className="text-lg text-muted-foreground mb-6">
          See who else is here and start connecting.
        </p>
        <Button onClick={() => navigate("/matches")} className="text-white">
          View My Matches
        </Button>
      </div>
      <BottomNav />
    </Layout>
  );
} 