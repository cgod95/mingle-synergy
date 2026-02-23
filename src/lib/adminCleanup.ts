import { firestore } from '@/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { CHECKIN_DURATION_MS } from '@/lib/checkinStore';

const CLEANUP_RAN_KEY = 'mingle:adminCleanupRan';

/**
 * One-time cleanup: expire stale check-ins in Firestore and update venue image.
 * Runs once per browser session (tracked via sessionStorage).
 */
export async function runAdminCleanup(): Promise<void> {
  if (!firestore) return;
  if (sessionStorage.getItem(CLEANUP_RAN_KEY)) return;
  sessionStorage.setItem(CLEANUP_RAN_KEY, '1');

  try {
    await expireStaleCheckIns();
    await updateScarletWeaselImage();
  } catch (e) {
    console.warn('[adminCleanup] error:', e);
  }
}

async function expireStaleCheckIns(): Promise<void> {
  if (!firestore) return;

  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('currentVenue', '!=', null));
  const snapshot = await getDocs(q);
  const now = Date.now();
  let cleaned = 0;

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const checkedInAt = data.checkedInAt;

    let checkedInMs = 0;
    if (typeof checkedInAt === 'number') {
      checkedInMs = checkedInAt;
    } else if (checkedInAt instanceof Timestamp) {
      checkedInMs = checkedInAt.toMillis();
    } else if (checkedInAt?.toMillis) {
      checkedInMs = checkedInAt.toMillis();
    } else if (checkedInAt?.toDate) {
      checkedInMs = checkedInAt.toDate().getTime();
    }

    // If no timestamp or older than 24h, clear the check-in
    if (!checkedInMs || now - checkedInMs > CHECKIN_DURATION_MS) {
      try {
        await updateDoc(doc(firestore!, 'users', userDoc.id), {
          currentVenue: null,
          checkedInAt: null,
          isCheckedIn: false,
        });
        cleaned++;
      } catch {
        // best-effort per user
      }
    }
  }

  if (cleaned > 0) {
    console.log(`[adminCleanup] Expired ${cleaned} stale check-ins`);
  }
}

async function updateScarletWeaselImage(): Promise<void> {
  if (!firestore) return;

  try {
    const venueRef = doc(firestore, 'venues', 'scarlet-weasel-redfern');
    await updateDoc(venueRef, {
      image: '/venues/scarlet-weasel.png',
    });
  } catch {
    // Venue may not exist or user may not have write access
  }
}
