import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

export async function runExpiryOnce(now = Date.now()) {
  // TODO: implement real pruning with `db`
  return { scannedMatches: 0, expiredMatches: 0, cleanedMessages: 0, now };
}

export const expireOldMessages = onSchedule("every 1 hours", async () => {
  await runExpiryOnce();
});

export const expireOldMessagesDev = onRequest(async (_req, res) => {
  try {
    const result = await runExpiryOnce();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "unknown error" });
  }
});
