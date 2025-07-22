// /src/types/notification.ts

// 🧠 Purpose: Define correct structure for notification payloads used in notificationService

export interface NotificationData {
  id: string;
  title: string;
  body: string;     // ✅ Required in NotificationData
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  message: string;  // ✅ Required only in internal Notification use
  timestamp: number;
} 