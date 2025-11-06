import React from 'react';
import { Match } from '@/types/match';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Clock, Users } from 'lucide-react';

interface ConfirmationStatusProps {
  match: Match;
  className?: string;
}

const ConfirmationStatus: React.FC<ConfirmationStatusProps> = ({ match, className = '' }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const confirmations = match.confirmations || {};
  const confirmedCount = Object.values(confirmations).filter(Boolean).length;
  const currentUserConfirmed = confirmations[currentUser.uid] === true;
  const otherUserConfirmed = Object.entries(confirmations).some(([userId, confirmed]) => 
    userId !== currentUser.uid && confirmed
  );

  const getStatusInfo = () => {
    if (confirmedCount === 0) {
      return {
        text: 'No confirmations yet',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
      };
    } else if (confirmedCount === 1) {
      if (currentUserConfirmed) {
        return {
          text: 'You confirmed - waiting for them',
          icon: <Clock className="w-4 h-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      } else {
        return {
          text: 'They confirmed - confirm you met',
          icon: <Users className="w-4 h-4" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      }
    } else {
      return {
        text: 'Both confirmed meeting!',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusInfo.bgColor} ${className}`}>
      {statusInfo.icon}
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    </div>
  );
};

export default ConfirmationStatus; 