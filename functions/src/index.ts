import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export { expireOldMessages } from "./expireOldMessages";
