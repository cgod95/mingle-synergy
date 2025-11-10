import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2 } from "lucide-react";
import { getVenues } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";

const ACTIVE_KEY = "mingle_active_venue";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [venues, setVenues] = useState<any[]>([]);
  const [checked, setChecked] = useState<boolean>(() => !!localStorage.getItem(ACTIVE_KEY));
  const { currentUser } = useAuth();

  useEffect(() => {
    getVenues().then(setVenues).catch(() => setVenues([]));
  }, []);

  const onCheckIn = async (id: string) => {
    // DEMO MODE: Photo requirement disabled
    // Photo check removed for easier demo/testing
    
    localStorage.setItem(ACTIVE_KEY, id);
    setChecked(true);
    
    // Track user checked in event per spec section 9
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      const venue = venues.find(v => v.id === id);
      trackUserCheckedIn(id, venue?.name || id);
    } catch (error) {
      console.warn('Failed to track user_checked_in event:', error);
    }
    
    navigate(`/venues/${id}`);
  };

  const preselect = params.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v, index) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all h-full ${
                  preselect === v.id
                    ? "border-2 border-indigo-500 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50"
                    : "border border-neutral-200 hover:border-indigo-300 hover:shadow-lg bg-white"
                }`}
                onClick={() => onCheckIn(v.id)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-800 text-xl mb-1">{v.name}</h3>
                      {v.address && (
                        <p className="text-sm text-neutral-500">{v.address}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-indigo-600 hover:bg-indigo-50 font-medium"
                  >
                    Check In →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
