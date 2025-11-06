const fs = require('fs');
const p = 'src/lib/matchStore.ts';
if (!fs.existsSync(p)) {
  console.error('matchStore not found at', p);
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

if (!/export function getTotalUnread\s*\(/.test(s)) {
  s += `
export function getTotalUnread(): number {
  return read().reduce(
    (n, m) => n + ((m.messages || []).filter(msg => msg.sender === "other").length),
    0
  );
}
`;
  fs.writeFileSync(p, s);
  console.log('✅ Added getTotalUnread to matchStore.ts');
} else {
  console.log('✓ getTotalUnread already present');
}
