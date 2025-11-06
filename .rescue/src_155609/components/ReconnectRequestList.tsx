import { UserProfile } from "@/types/services";
import { ReconnectRequestCard } from "@/components/ReconnectRequestCard";

type Props = {
  requests: UserProfile[];
  onAccept?: () => void;
  isLoading?: boolean;
};

/**
 * ReconnectRequestList component displays a list of reconnect requests
 * with loading states and empty states handled automatically.
 */
export const ReconnectRequestList = ({ requests, onAccept, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-3"></div>
        <p className="text-sm">Loading requests...</p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
        <p className="text-sm">No reconnect requests at the moment.</p>
        <p className="text-xs text-gray-400 mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((user) => (
        <ReconnectRequestCard 
          key={user.uid || user.id || `user-${Math.random()}`} 
          user={user} 
          onAccept={onAccept} 
        />
      ))}
    </div>
  );
};

export default ReconnectRequestList; 