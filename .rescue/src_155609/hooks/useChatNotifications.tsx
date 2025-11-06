// 🧠 Purpose
// Enable real-time in-app message notifications and last message preview for match chats

import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { subscribeToMessages, Message } from '@/services/messageService';

interface NotificationData {
  unreadMessages?: Record<string, number>;
}

export function useChatNotifications(currentUserId: string) {
  const [notifications, setNotifications] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsub = onSnapshot(
      doc(firestore, 'notifications', currentUserId),
      (docSnap) => {
        const data = docSnap.data() as NotificationData | undefined;
        if (data) setNotifications(data.unreadMessages || {});
      }
    );
    
    return () => unsub();
  }, [currentUserId]);
  
  return notifications;
}

export function useLastMessage(matchId: string) {
  const [lastMessage, setLastMessage] = useState<null | { text: string; createdAt: Date }>(null);
  
  useEffect(() => {
    if (!matchId) return;
    
    // Use the existing message service to subscribe to messages
    const unsubscribe = subscribeToMessages(matchId, (messages: Message[]) => {
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        setLastMessage({ 
          text: lastMsg.text, 
          createdAt: lastMsg.createdAt 
        });
      } else {
        setLastMessage(null);
      }
    });
    
    return () => unsubscribe();
  }, [matchId]);
  
  return lastMessage;
}

export function useUnreadCount(matchId: string, currentUserId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!matchId || !currentUserId) return;
    
    // For now, we'll use a simple approach
    // In a full implementation, you'd track read status in Firestore
    const unsubscribe = subscribeToMessages(matchId, (messages: Message[]) => {
      // Count messages from other users that haven't been read
      const unread = messages.filter(msg => 
        msg.senderId !== currentUserId && 
        !msg.readBy?.includes(currentUserId)
      ).length;
      
      setUnreadCount(unread);
    });
    
    return () => unsubscribe();
  }, [matchId, currentUserId]);
  
  return unreadCount;
} 