const fs = require('fs');
const p = 'src/components/venue/VenueDetails.tsx';
if (!fs.existsSync(p)) {
  console.log('! File not found:', p);
  process.exit(0);
}
let s = fs.readFileSync(p, 'utf8');

const before = /onClick=\{\s*\(\)\s*=>\s*navigate\((["'])\/checkin\1\)\s*\}/g;
const after  = 'onClick={() => navigate(`/checkin?id=${venue.id}`)}';

if (before.test(s)) {
  s = s.replace(before, after);
  fs.writeFileSync(p, s);
  console.log('✓ VenueDetails.tsx patched: Check-in button now passes venue id');
} else if (!s.includes('navigate(`/checkin?id=${venue.id}`)')) {
  // Try a more generic replacement of the string literal navigate("/checkin")
  s = s.replace(/navigate\((["'])\/checkin\1\)/g, 'navigate(`/checkin?id=${venue.id}`)');
  fs.writeFileSync(p, s);
  console.log('✓ VenueDetails.tsx patched (generic): Check-in button now passes venue id');
} else {
  console.log('✓ VenueDetails.tsx already uses venue id');
}
