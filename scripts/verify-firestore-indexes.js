#!/usr/bin/env node
/**
 * Firestore index verification script
 * Verifies firestore.indexes.json exists and contains required index definitions.
 * Run before deploy: node scripts/verify-firestore-indexes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');

console.log('🔍 Verifying Firestore indexes...\n');

if (!fs.existsSync(indexesPath)) {
  console.error('❌ firestore.indexes.json not found.');
  console.error('   Create it or run: firebase firestore:indexes');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
} catch (e) {
  console.error('❌ Failed to parse firestore.indexes.json:', e.message);
  process.exit(1);
}

const indexes = config.indexes;
if (!Array.isArray(indexes)) {
  console.error('❌ firestore.indexes.json must have an "indexes" array.');
  process.exit(1);
}

// Required indexes for critical app features
const required = [
  {
    collectionGroup: 'messages',
    fields: ['matchId', 'createdAt'],
    desc: 'Chat messages (subscribeToMessages, loadOlderMessages)',
  },
  {
    collectionGroup: 'users',
    fields: ['currentVenue', 'isVisible'],
    desc: 'People at venue (usePeopleAtVenue)',
  },
  {
    collectionGroup: 'matches',
    fields: ['userId1', 'timestamp'],
    desc: 'User matches (userId1)',
  },
  {
    collectionGroup: 'matches',
    fields: ['userId2', 'timestamp'],
    desc: 'User matches (userId2)',
  },
];

const fieldPaths = (idx) =>
  (idx.fields || []).map((f) => (typeof f === 'object' ? f.fieldPath : f)).sort();

const hasIndex = (collectionGroup, fields) =>
  indexes.some(
    (idx) =>
      idx.collectionGroup === collectionGroup &&
      fieldPaths(idx).join(',') === [...fields].sort().join(',')
  );

let missing = 0;
for (const req of required) {
  const ok = hasIndex(req.collectionGroup, req.fields);
  console.log(`${ok ? '✅' : '❌'} ${req.collectionGroup} [${req.fields.join(', ')}] - ${req.desc}`);
  if (!ok) missing++;
}

if (missing > 0) {
  console.error(`\n❌ ${missing} required index(es) missing. Deploy may fail.`);
  console.error('   See docs/FIRESTORE_INDEXES.md for details.');
  process.exit(1);
}

console.log(`\n✅ All ${required.length} required indexes defined.`);
console.log('   Deploy with: firebase deploy --only firestore:indexes');
