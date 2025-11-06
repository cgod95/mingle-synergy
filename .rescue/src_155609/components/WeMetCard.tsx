import React, { useState } from "react";
import { UserProfile } from "@/types/UserProfile";
import { Button } from "@/components/ui/button";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";

interface WeMetCardProps {
  user: UserProfile;
  onConfirmWeMet: (userId: string) => void;
}

const WeMetCard: React.FC<WeMetCardProps> = ({ user, onConfirmWeMet }) => {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    onConfirmWeMet(user.id);
    setShowModal(false);
  };

  return (
    <div className="rounded-2xl shadow p-4 bg-white flex flex-col items-center text-center">
      <img 
        src={user.photos?.[0] || '/placeholder.svg'} 
        alt={user.name} 
        className="w-24 h-24 rounded-full object-cover mb-2" 
      />
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <Button onClick={() => setShowModal(true)} className="mt-3">
        We Met
      </Button>

      <WeMetConfirmationModal
        open={showModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default WeMetCard; 