import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

const MATCHES_COLLECTION = "matches";
const MESSAGES_SUBCOLLECTION = "messages";
const WINDOW_MS = 3 * 60 * 60 * 1000;

export async function runExpiryOnce(now = Date.now(), opts?: { clean?: boolean }) {
  const cutoff = new Date(now - WINDOW_MS);
  const q = await db.collection(MATCHES_COLLECTION)
    .where("createdAt", "<=", Timestamp.fromDate(cutoff))
    .where("expired", "==", false)
    .get();

  let expiredMatches = 0;
  let cleanedMessages = 0;

  for (const doc of q.docs) {
    const matchRef = doc.ref;
    await matchRef.set(
      { expired: true, expiredAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    expiredMatches++;

    if (opts?.clean) {
      const msgs = await matchRef.collection(MESSAGES_SUBCOLLECTION).get();
      const batch = db.batch();
      msgs.docs.forEach((m) => batch.delete(m.ref));
      if (!msgs.empty) {
        await batch.commit();
        cleanedMessages += msgs.size;
      }
    }
  }

  return {
    scannedMatches: q.size,
    expiredMatches,
    cleanedMessages,
    cutoff: cutoff.getTime(),
    now,
  };
}

export const expireOldMessages = onSchedule("every 1 hours", async () => {
  await runExpiryOnce();
});

export const expireOldMessagesDev = onRequest(async (req, res) => {
  try {
    const clean = req.query.clean === "1" || req.query.clean === "true";
    const result = await runExpiryOnce(Date.now(), { clean });
    res.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});
