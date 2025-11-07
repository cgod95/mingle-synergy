import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, Camera } from "lucide-react";
import { getVenues } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { hasRequiredPhotos, getPhotoRequirementMessage } from "../lib/photoRequirement";
import { useToast } from "@/hooks/use-toast";

const ACTIVE_KEY = "mingle_active_venue";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const venues = useMemo(() => getVenues(), []);
  const [checked, setChecked] = useState<boolean>(() => !!localStorage.getItem(ACTIVE_KEY));
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const onCheckIn = async (id: string) => {
    // Check photo requirement per spec
    // Try to get user profile photos (may need to fetch from service)
    let userPhotos: string[] = [];
    
    if (currentUser?.uid) {
      try {
        // Try to get photos from userService if available
        const { userService } = await import("@/services");
        const profile = await userService.getUserProfile(currentUser.uid);
        userPhotos = profile?.photos || [];
      } catch {
        // Fallback: check if photos exist in currentUser
        userPhotos = (currentUser as any)?.photos || [];
      }
    }
    
    if (!hasRequiredPhotos(userPhotos)) {
      toast({
        title: "Photo Required",
        description: getPhotoRequirementMessage(),
        duration: 4000,
      });
      navigate("/profile/edit");
      return;
    }

    localStorage.setItem(ACTIVE_KEY, id);
    setChecked(true);
    navigate(`/venues/${id}`);
  };

  const preselect = params.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Check In</h1>
          <p className="text-neutral-600">Select your current venue to start meeting people</p>
        </motion.div>

        {checked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">You're checked in! Browse people at your venue.</p>
          </motion.div>
        )}

        <div className="space-y-3">
          {venues.map((v, index) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  preselect === v.id
                    ? "border-2 border-indigo-500 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50"
                    : "border border-neutral-200 hover:border-indigo-300 hover:shadow-md bg-white"
                }`}
                onClick={() => onCheckIn(v.id)}
              >
                <div className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-800 text-lg">{v.name}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{v.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600"
                  >
                    Select →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
