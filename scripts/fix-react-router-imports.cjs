const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.log('⚠️ src/App.tsx not found');
  process.exit(0);
}
let s = fs.readFileSync(p, 'utf8');

const importRe = /^\s*import\s*\{([^}]*)\}\s*from\s*["']react-router-dom["'];\s*$/gm;

// 1) Collect all named imports from react-router-dom
let all = new Set();
let m;
while ((m = importRe.exec(s)) !== null) {
  const names = m[1]
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  names.forEach(n => all.add(n));
}

// 2) If none, nothing to do
if (all.size === 0) {
  console.log('✓ No react-router-dom named import issues found');
  process.exit(0);
}

// 3) Remove ALL react-router-dom named import lines
s = s.replace(importRe, '');

// 4) Build a single, de-duplicated line (keep common ones first for readability)
const preferredOrder = ['BrowserRouter','Routes','Route','Navigate','Link','NavLink','useNavigate','useParams'];
const present = preferredOrder.filter(n => all.has(n));
preferredOrder.forEach(n => all.delete(n));
const rest = Array.from(all).sort();
const finalList = [...present, ...rest];
const cleanLine = `import { ${finalList.join(', ')} } from "react-router-dom";\n`;

// 5) Insert the clean line after the very first import in the file
s = s.replace(/(import[\s\S]*?;\s*\n)/, `$1${cleanLine}`);

// 6) Tiny cleanup: collapse any multiple blank lines
s = s.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(p, s);
console.log('✅ react-router-dom imports normalized in src/App.tsx');
