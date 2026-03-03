# Berlin Accelerator Demo Checklist

Use this checklist to prepare for and run Mingle demos at the Berlin accelerator.

---

## Pre-Demo (Before the Day)

- [ ] **Clear cache** – Clear browser cache and localStorage to avoid stale state
- [ ] **Confirm demo mode** – Ensure `VITE_DEMO_MODE=true` when running locally, or use the deployed demo URL
- [ ] **Firebase indexes** – Confirm Firestore indexes are deployed and enabled (see [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md))
- [ ] **Run E2E** – Execute `npm run test:e2e` with dev server on `localhost:5173` to verify critical flows
- [ ] **Test on device** – If presenting on iOS, run a quick smoke test on the actual device

---

## 2-Minute Pitch Flow

*Landing → Demo → Check-in → Venue → Like → Match → Chat*

1. **Landing** – Open app, show value prop (“No more swiping. No more noise. Just meet people.”)
2. **Entry** – Click “Join Closed Beta” or “Try Demo” → sign up or enter demo
3. **Check-in** – Show venue list, tap “Check in” on first venue
4. **Venue** – Show “X people here now”, scroll through people grid
5. **Like** – Tap like on 1–2 people; mention mutual like → match
6. **Match** – If match appears, tap to open chat
7. **Chat** – Show messages area and input; send a quick message

---

## 5-Minute Deep-Dive

*Add these after the 2-minute flow*

- **Profile** – Bottom nav → Profile; show bio, photos, interests
- **Settings** – Profile → Settings; show preferences, notifications
- **Block/Report** – From a profile or match, demonstrate block/report flow
- **Help** – Settings → Help; show FAQ and support options

---

## iOS Device Checks

- [ ] **Keyboard in chat** – Open chat, focus input; keyboard should appear and input remain visible (scrollIntoView fallback when keyboard undetected)
- [ ] **Haptics** – Like/check-in should trigger haptic feedback if supported
- [ ] **Layout** – Safe areas respected; bottom nav and content not cut off
- [ ] **PWA** – Add to Home Screen works; app launches from home screen

---

## Quick Reference

| Step | Action |
|------|--------|
| Start | `npm run dev` (with `VITE_DEMO_MODE=true` for local demo) |
| URL | `http://localhost:5173` or deployed preview |
| E2E | `PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e` |

---

## Troubleshooting

- **Chat not loading** – Verify Firestore indexes; check [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md)
- **No venues** – Demo mode uses `demoVenues`; production needs Firebase/venue data
- **Keyboard covers input** – ChatRoom has scrollIntoView fallback when `keyboardHeight === 0`
