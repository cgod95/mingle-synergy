"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireOldMessagesDev = exports.expireOldMessages = void 0;
exports.runExpiryOnce = runExpiryOnce;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const MATCHES_COLLECTION = "matches";
const MESSAGES_SUBCOLLECTION = "messages";
const WINDOW_MS = 3 * 60 * 60 * 1000;
async function runExpiryOnce(now = Date.now(), opts) {
    const cutoff = new Date(now - WINDOW_MS);
    const q = await db.collection(MATCHES_COLLECTION)
        .where("createdAt", "<=", firestore_1.Timestamp.fromDate(cutoff))
        .where("expired", "==", false)
        .get();
    let expiredMatches = 0;
    let cleanedMessages = 0;
    for (const doc of q.docs) {
        const matchRef = doc.ref;
        await matchRef.set({ expired: true, expiredAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
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
exports.expireOldMessages = (0, scheduler_1.onSchedule)("every 1 hours", async () => {
    await runExpiryOnce();
});
exports.expireOldMessagesDev = (0, https_1.onRequest)(async (req, res) => {
    try {
        const clean = req.query.clean === "1" || req.query.clean === "true";
        const result = await runExpiryOnce(Date.now(), { clean });
        res.json(result);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg });
    }
});
