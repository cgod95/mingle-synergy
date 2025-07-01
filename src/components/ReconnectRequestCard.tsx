import { UserProfile } from "@/types/services";
import { AcceptReconnectButton } from "@/components/AcceptReconnectButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReconnectRequestCardProps {
  user: UserProfile;
  onAccept?: () => void;
}

export const ReconnectRequestCard = ({ user, onAccept }: ReconnectRequestCardProps) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-xl shadow-sm bg-white">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.photos?.[0] || ""} />
          <AvatarFallback>
            {(user.displayName || user.name || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{user.displayName || user.name || "Unknown User"}</span>
          <span className="text-sm text-gray-500">Wants to reconnect</span>
          {user.age > 0 && (
            <span className="text-xs text-gray-400">{user.age} years old</span>
          )}
        </div>
      </div>
      <AcceptReconnectButton 
        targetUid={user.uid || user.id} 
        onAccept={onAccept}
        size="sm"
      />
    </div>
  );
};

export default ReconnectRequestCard; 