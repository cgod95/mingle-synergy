#!/bin/bash
# Quick script to add Scarlet Weasel venue using Firebase CLI
# Requires: firebase-tools installed and logged in

set -e

echo "🍺 Adding Scarlet Weasel Redfern venue to Firestore..."

# Use Firebase CLI to add the venue document
firebase firestore:set venues/scarlet-weasel-redfern '{
  "id": "scarlet-weasel-redfern",
  "name": "Scarlet Weasel",
  "type": "bar",
  "address": "88 Regent St",
  "city": "Redfern",
  "state": "NSW",
  "postcode": "2016",
  "country": "Australia",
  "latitude": -33.8925,
  "longitude": 151.2044,
  "image": "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
  "checkInCount": 0,
  "expiryTime": 120,
  "zones": ["main", "outdoor", "back"],
  "checkedInUsers": [],
  "specials": [
    {"title": "Happy Hour", "description": "5-7pm Daily"},
    {"title": "Live Music", "description": "Fridays & Saturdays"}
  ],
  "description": "A cozy bar in the heart of Redfern"
}' --project mingle-a12a2

echo "✅ Venue added successfully!"
echo "📝 Next: Verify in Firebase Console and redeploy from main"







