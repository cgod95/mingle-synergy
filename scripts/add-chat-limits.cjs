const fs = require('fs');

const candidates = ['src/pages/Chat.tsx', 'src/pages/MatchRoom.tsx'];
const target = candidates.find(f => fs.existsSync(f));

if (!target) {
  console.log('ℹ️ No Chat.tsx or MatchRoom.tsx found; skipping.');
  process.exit(0);
}

let s = fs.readFileSync(target, 'utf8');
let changed = false;

// Ensure React hooks imports exist
if (!/useState/.test(s) || !/useEffect/.test(s)) {
  if (/from "react"/.test(s)) {
    s = s.replace(/from "react";/, 'from "react";');
  } else if (/import React/.test(s)) {
    // leave as-is, we’ll add named hooks import
  } else {
    s = `import React, { useState, useEffect } from "react";\n` + s;
    changed = true;
  }

  if (!/useState|useEffect/.test(s)) {
    s = s.replace(
      /import React(?:,[^{}]*)? from "react";/,
      'import React, { useState, useEffect } from "react";'
    );
    changed = true;
  } else {
    if (!/useState/.test(s)) {
      s = s.replace(/from "react";/, ', { useState } from "react";');
      changed = true;
    }
    if (!/useEffect/.test(s)) {
      s = s.replace(/from "react";/, ', { useEffect } from "react";');
      changed = true;
    }
  }
}

// Inject state + constants right after first function component if missing
if (!/messageLimit/.test(s) || !/expiryHours/.test(s)) {
  s = s.replace(
    /(function\s+[A-Z][A-Za-z0-9_]*\s*\([^)]*\)\s*\{)/,
    `$1
  // Demo chat limits (idempotent)
  const messageLimit = 3;
  const expiryHours = 3;
  const [timeLeft, setTimeLeft] = useState(expiryHours * 60 * 60 * 1000);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(id);
  }, []);
`
  );
  changed = true;
}

// Guard sendMessage
if (!/Message limit of /.test(s)) {
  s = s.replace(
    /(sendMessage\s*\(\s*.*?\)\s*\{)/,
    `$1
    // Enforce demo message cap and expiry
    if (Array.isArray(messages) && messages.length >= messageLimit) {
      alert(\`Message limit of \${messageLimit} reached.\`);
      return;
    }
    if (typeof timeLeft === 'number' && timeLeft <= 0) {
      alert(\`This chat expired after \${expiryHours} hours.\`);
      return;
    }`
  );
  changed = true;
}

if (changed) {
  fs.writeFileSync(target, s);
  console.log('✅ Added message limit + expiry to', target);
} else {
  console.log('ℹ️ Chat limits already present in', target);
}
