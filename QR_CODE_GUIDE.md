# QR Code Guide - Closed Beta Testing

**Purpose:** Generate QR codes for venue check-ins during closed beta testing  
**Status:** Ready for Use  
**Last Updated:** January 2025

---

## 🎯 Quick Start

### For Closed Beta Testing:
1. **Generate QR code** using external service (see below)
2. **Print QR code** and place at venue
3. **Friends scan** with phone camera → Auto-checks in

---

## 📱 How It Works

### User Flow:
1. Friend scans QR code with phone camera app
2. QR code contains URL: `https://your-domain.com/checkin?venueId=1&source=qr`
3. Browser opens URL → App loads
4. App detects `venueId` and `source=qr` params
5. **Auto-checks in** to venue
6. User sees venue details page

---

## 🔧 Generating QR Codes

### Option 1: External QR Code Generator (Recommended for Beta)

**Step 1:** Choose a QR code generator:
- [QRCode Monkey](https://www.qrcode-monkey.com/) (Free, no signup)
- [QR Code Generator](https://www.qr-code-generator.com/) (Free)
- [QRCode.com](https://www.qrcode.com/) (Free)

**Step 2:** Generate QR code URL:
```
https://your-domain.com/checkin?venueId=1&source=qr
```

Replace:
- `your-domain.com` with your actual domain (e.g., `mingle.app` or `localhost:5173` for testing)
- `1` with the actual venue ID

**Step 3:** Download QR code image

**Step 4:** Print and place at venue

---

### Option 2: Using QR Code Utility (Future)

When ready, you can use the utility function:

```typescript
import { generateVenueQRCodeURL } from '@/utils/qrCodeGenerator';

const qrUrl = generateVenueQRCodeURL('1', 'https://your-domain.com');
// Returns: https://your-domain.com/checkin?venueId=1&source=qr
```

Then use any QR code generator with this URL.

---

## 🏢 Venue IDs

### Demo Mode Venues:
- Venue ID `1` - Neon Garden
- Venue ID `2` - Club Aurora
- Venue ID `3` - The Loft
- Venue ID `4` - Sky Bar
- Venue ID `5` - Underground
- Venue ID `6` - Rooftop Lounge
- Venue ID `7` - The Basement
- Venue ID `8` - Harbor View

### For Closed Beta:
- Choose one venue for your event
- Use that venue's ID in the QR code
- All friends scan same QR code → All check into same venue

---

## 📋 QR Code Format

### Full URL Format (Recommended):
```
https://your-domain.com/checkin?venueId=1&source=qr
```

**Benefits:**
- Works when scanned outside app
- Opens app/web automatically
- Auto-checks in via URL params

### Simple Format (Alternative):
```
venueId=1
```

**Benefits:**
- Smaller QR code
- Faster scanning
- Only works within app context

---

## 🧪 Testing QR Codes

### Step 1: Generate Test QR Code
1. Use external generator
2. URL: `http://localhost:5173/checkin?venueId=1&source=qr` (for local testing)
3. Download QR code

### Step 2: Test Scanning
1. Open QR code image on another device/screen
2. Scan with phone camera app
3. Should open app → Auto-check in

### Step 3: Verify
- Check-in should happen automatically
- User should see venue details page
- User should see "Scanned QR code" message

---

## 🎨 QR Code Best Practices

### Size & Quality:
- **Minimum size:** 2cm x 2cm (0.8" x 0.8")
- **Recommended:** 5cm x 5cm (2" x 2") or larger
- **Print quality:** High resolution (300 DPI minimum)
- **Contrast:** High contrast (black on white)

### Placement:
- **Height:** Eye level (1.5m / 5ft)
- **Lighting:** Well-lit area
- **Distance:** Easy to scan from 30cm (1ft) away
- **Multiple copies:** Place at entrance, bar, tables

### Design:
- Add venue name below QR code
- Add instructions: "Scan to check in"
- Use branded colors if desired
- Test print before final printing

---

## 🔄 For Production (Future)

### When html5-qrcode is installed:
1. Enable in-app QR scanner component
2. Users can scan directly in app
3. No need for external camera app

### Current Workaround:
- Use phone camera app (works great!)
- Native QR scanning in iOS/Android
- No library needed

---

## 📝 Example QR Code URLs

### Local Development:
```
http://localhost:5173/checkin?venueId=1&source=qr
```

### Staging:
```
https://staging.mingle.app/checkin?venueId=1&source=qr
```

### Production:
```
https://mingle.app/checkin?venueId=1&source=qr
```

---

## ✅ Checklist for Closed Beta Event

- [ ] Choose venue for event
- [ ] Get venue ID
- [ ] Generate QR code URL
- [ ] Create QR code image
- [ ] Print QR code (multiple copies)
- [ ] Test scanning with phone camera
- [ ] Verify auto-check-in works
- [ ] Place QR codes at venue
- [ ] Test with friends before event

---

## 🐛 Troubleshooting

### QR code doesn't open app:
- Check URL format is correct
- Verify domain matches app domain
- Test URL in browser first

### Auto-check-in doesn't work:
- Check browser console for errors
- Verify `venueId` param is correct
- Ensure user is authenticated

### Camera app doesn't scan:
- Ensure QR code is well-lit
- Try different camera app
- Check QR code isn't damaged

---

## 📚 Resources

- [QR Code Generator](https://www.qrcode-monkey.com/)
- [QR Code Best Practices](https://www.qrcode.com/en/best-practices/)
- [Mobile QR Scanning Guide](https://support.apple.com/en-us/HT208843)

---

**Next:** Generate QR codes for your closed beta event venue!

