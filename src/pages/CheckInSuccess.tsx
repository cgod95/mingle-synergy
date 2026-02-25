import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SuccessAlert } from "@/components/DisplayUtils";
import Layout from "@/components/Layout";
import BottomNav from "@/components/BottomNav";

export default function CheckInSuccess() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start pt-[15vh] min-h-screen min-h-[100dvh] bg-neutral-900 px-4 py-12 text-center pb-nav-safe">
        <SuccessAlert message="You've successfully checked in to the venue!" />
        <h1 className="text-3xl font-bold mb-4 text-white">You're checked in!</h1>
        <p className="text-lg text-neutral-300 mb-6">
          See who else is here and start connecting.
        </p>
        <Button onClick={() => navigate("/matches")} className="h-14 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl">
          View My Matches
        </Button>
      </div>
      <BottomNav />
    </Layout>
  );
} 