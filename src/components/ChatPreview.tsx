import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useLastMessage, useUnreadCount } from '@/hooks/useChatNotifications';

interface MatchData {
  id: string;
  displayName: string;
}

export function ChatPreview({ match }: { match: MatchData }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const lastMsg = useLastMessage(match.id);
  const unreadCount = useUnreadCount(match.id, currentUser?.uid || '');

  const getMessagePreview = () => {
    if (!lastMsg?.text) return 'No messages yet';
    const text = lastMsg.text;
    return text.length > 40 ? `${text.slice(0, 40)}...` : text;
  };

  return (
    <div
      className="flex justify-between items-center px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => navigate(`/chat/${match.id}`)}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-lg truncate">{match.displayName}</span>
        <span className="text-sm text-gray-500 truncate">
          {getMessagePreview()}
        </span>
      </div>
      <div className="flex flex-col items-end ml-3">
        <div className="text-xs text-gray-400">
          {lastMsg?.createdAt &&
            formatDistanceToNow(lastMsg.createdAt, { addSuffix: true })}
        </div>
        {unreadCount > 0 && (
          <span className="mt-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
} 