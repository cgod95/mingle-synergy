# Manual Setup: Scarlet Weasel Redfern Venue

If you prefer to add the venue manually via Firebase Console, follow these steps:

## Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**

## Step 2: Create Collection (if it doesn't exist)
- Collection ID: `venues`
- Click "Start collection"

## Step 3: Add Document
- **Document ID**: `scarlet-weasel-redfern` (or let Firebase auto-generate)
- **Fields**:

| Field | Type | Value |
|-------|------|-------|
| `id` | string | `scarlet-weasel-redfern` |
| `name` | string | `Scarlet Weasel` |
| `type` | string | `bar` |
| `address` | string | `88 Regent St` |
| `city` | string | `Redfern` |
| `state` | string | `NSW` |
| `postcode` | string | `2016` |
| `country` | string | `Australia` |
| `latitude` | number | `-33.8925` |
| `longitude` | number | `151.2044` |
| `image` | string | `https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop` |
| `checkInCount` | number | `0` |
| `expiryTime` | number | `120` |
| `zones` | array | `["main", "outdoor", "back"]` |
| `checkedInUsers` | array | `[]` |
| `specials` | array | `[{"title": "Happy Hour", "description": "5-7pm Daily"}, {"title": "Live Music", "description": "Fridays & Saturdays"}]` |
| `description` | string | `A cozy bar in the heart of Redfern` |
| `createdAt` | timestamp | (use server timestamp) |
| `updatedAt` | timestamp | (use server timestamp) |

## Step 4: Verify
- Check that the document appears in the `venues` collection
- Verify all fields are correct

## Step 5: Test in App
1. Ensure `VITE_DEMO_MODE=false` in Vercel environment variables
2. Deploy/redeploy your app
3. Sign up/login
4. Go to Check In page
5. You should see "Scarlet Weasel" as the only venue

## Notes
- Coordinates are approximate for Redfern area
- You can update the image URL with an actual photo of Scarlet Weasel if available
- Adjust zones and specials as needed based on the actual venue







