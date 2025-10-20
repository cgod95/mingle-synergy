const fs = require('fs');
const cp = require('child_process');

function list(pattern){
  try {
    const out = cp.execSync(
      `grep -RIl --include='*.{ts,tsx,js,jsx}' '${pattern}' src || true`,
      { stdio: ['ignore','pipe','ignore'] }
    ).toString().trim().split('\n').filter(Boolean);
    return out;
  } catch { return []; }
}

const files = Array.from(new Set([
  ...list('/404'),
  ...list("navigate('/404"),
  ...list('Navigate to="/404"'),
]));

let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f,'utf8');
  let s = before;

  s = s.replace(/navigate\(\s*['"]\/404['"]\s*\)/g, 'navigate("/sign-up")');
  s = s.replace(/<Navigate\s+to="\/404"([^>]*)>/g, '<Navigate to="/sign-up"$1>');
  s = s.replace(/\bto:\s*['"]\/404['"]/g, 'to: "/sign-up"');
  s = s.replace(/\bhref=['"]\/404['"]/g, 'href="/sign-up"');
  s = s.replace(/\bto=['"]\/404['"]/g, 'to="/sign-up"');

  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log('✅ updated', f);
    changed++;
  }
}
console.log(`Done. Files changed: ${changed}`);
