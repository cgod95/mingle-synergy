const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) { console.error('Missing src/App.tsx'); process.exit(1); }
let s = fs.readFileSync(p, 'utf8');

// Replace <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />
// with    <Route path="/venues" element={<Venues />} />
s = s.replace(
  /<Route\s+path=["']\/venues["']\s+element={(?:\s*)<ProtectedRoute>\s*<Venues\s*\/>\s*<\/ProtectedRoute>\s*}\s*\/>/m,
  '<Route path="/venues" element={<Venues />} />'
);

// Also handle same line compact variant just in case:
s = s.replace(
  /<Route\s+path=["']\/venues["']\s+element={<ProtectedRoute><Venues\s*\/><\/ProtectedRoute>}\s*\/>/m,
  '<Route path="/venues" element={<Venues />} />'
);

fs.writeFileSync(p, s);
console.log('✅ /venues is now public');
