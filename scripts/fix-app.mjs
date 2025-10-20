import fs from 'node:fs';

const path = 'src/App.tsx';
if (!fs.existsSync(path)) {
  console.error('❌ Missing src/App.tsx');
  process.exit(1);
}

let s = fs.readFileSync(path, 'utf8');

// 1) Remove any duplicate imports
s = s.replace(/^\s*import\s+LandingPage\s+from\s+['"]\.\/pages\/LandingPage['"];?\s*$/mg, '');
s = s.replace(/^\s*import\s+NotFoundStandalone\s+from\s+['"]\.\/pages\/NotFoundStandalone['"];?\s*$/mg, '');

// 2) Insert a single canonical import for each after the import block
const lines = s.split('\n');
let idx = 0;
while (idx < lines.length && /^import\b/.test(lines[idx])) idx++;
lines.splice(idx, 0,
  "import LandingPage from './pages/LandingPage';",
  "import NotFoundStandalone from './pages/NotFoundStandalone';"
);
s = lines.join('\n');

// 3) Normalize the NotFound routes
s = s.replace(/<Route\s+path=["']\/404["'][\s\S]*?\/>/g, '              <Route path="/404" element={<NotFoundStandalone />} />');
s = s.replace(/<Route\s+path=["']\*["'][\s\S]*?\/>/g, '              <Route path="*" element={<NotFoundStandalone />} />');

// 4) Clean up any accidental double self-closing tokens
s = s.replace(/<NotFoundStandalone\s*\/>\s*\/>/g, '<NotFoundStandalone />');
s = s.replace(/}\s*\/>\s*}\s*\/>/g, '} />');

fs.writeFileSync(path, s);
console.log('✅ Fixed', path);
