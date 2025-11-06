const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('❌ src/App.tsx not found');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// import
if (!s.includes(`from "./pages/DebugTools"`)) {
  s = s.replace(
    /(\nimport\s+NotFoundStandalone[^\n]*\n)/,
    `$1import DebugTools from "./pages/DebugTools";\n`
  );
}

// route
if (!s.includes('path="/debug"')) {
  s = s.replace(
    /(<Route\s+path="\/profile"[\s\S]*?\/>\s*)/,
    `$1
              <Route path="/debug" element={<DebugTools />} />
`
  );
}

fs.writeFileSync(p, s);
console.log('✅ App.tsx updated with /debug route');
