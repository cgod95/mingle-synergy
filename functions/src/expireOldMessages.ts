import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const expireOldMessages = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    const now = Date.now();
    const expirationTime = now - 3 * 60 * 60 * 1000; // 3 hours ago

    const messagesRef = db.collection("messages");
    const snapshot = await messagesRef.where("timestamp", "<", expirationTime).get();

    if (snapshot.empty) {
      console.log("No old messages to delete.");
      return null;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Expired ${snapshot.size} old messages.`);
    return null;
  }); 