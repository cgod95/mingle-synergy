const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('Missing src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// Ensure import
if (!s.includes(`from "./pages/PublicVenue"`)) {
  s = s.replace(
    /(\nimport\s+NotFoundStandalone[^\n]+\n)/,
    `$1import PublicVenue from "./pages/PublicVenue";\n`
  );
  // Fallback: if NotFound import not found, just add after React Router imports
  if (!s.includes(`from "./pages/PublicVenue"`)) {
    s = s.replace(
      /(from "react-router-dom";\s*\n)/,
      `$1import PublicVenue from "./pages/PublicVenue";\n`
    );
  }
}

// Add route before 404/catch-all
if (!s.includes('path="/v/:id"')) {
  const routeLine = `              <Route path="/v/:id" element={<PublicVenue />} />\n`;
  if (s.includes('path="/404"')) {
    s = s.replace(
      /(\s*<Route\s+path="\/404"[^\n]*\n)/,
      routeLine + `$1`
    );
  } else if (s.includes('path="*"')) {
    s = s.replace(
      /(\s*<Route\s+path="\*"[^\n]*\n)/,
      routeLine + `$1`
    );
  } else {
    // Fallback: inject near end of Routes block
    s = s.replace(
      /(<\/Routes>)/,
      routeLine + `            $1`
    );
  }
}

fs.writeFileSync(p, s);
console.log('✅ App.tsx updated with /v/:id route and PublicVenue import');
