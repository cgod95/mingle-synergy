const fs = require('fs');
const f = 'src/App.tsx';
if (!fs.existsSync(f)) { console.error('Missing src/App.tsx'); process.exit(1); }
let s = fs.readFileSync(f,'utf8');

// Ensure import
if (!s.includes('./pages/NotFoundStandalone')) {
  s = 'import NotFoundStandalone from "./pages/NotFoundStandalone";\n' + s;
}

// Replace wildcard route to use NotFoundStandalone
s = s.replace(/<Route\s+path="\*".*?\/>/s, '<Route path="*" element={<NotFoundStandalone />} />');

// Ensure /404 route renders NotFoundStandalone (or add it if missing)
if (s.includes('path="/404"')) {
  s = s.replace(/<Route\s+path="\/404".*?\/>/s, '<Route path="/404" element={<NotFoundStandalone />} />');
} else {
  s = s.replace(/<Routes>/, '<Routes>\n              <Route path="/404" element={<NotFoundStandalone />} />');
}

fs.writeFileSync(f,s);
console.log('✅ Updated', f);
