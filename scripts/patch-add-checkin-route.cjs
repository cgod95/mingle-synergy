const fs = require('fs');
const p = 'src/App.tsx';
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('import CheckIn from "./pages/CheckIn";')) {
  // insert after first block of imports
  s = s.replace(/(^import .*;[\r\n]+)/, (m) => m + 'import CheckIn from "./pages/CheckIn";\n');
}

if (!/path=["']\/checkin["']/.test(s)) {
  // insert the Route before the wildcard/404 route if present, else before </Routes>
  if (s.includes('<Route path="*"')) {
    s = s.replace(
      /<Route path="\*"[\s\S]*?>[\s\S]*?<\/Route>/,
      (m) => `<Route path="/checkin" element={<CheckIn />} />\n      ${m}`
    );
  } else {
    s = s.replace(
      /<\/Routes>/,
      `  <Route path="/checkin" element={<CheckIn />} />\n    </Routes>`
    );
  }
}

fs.writeFileSync(p, s);
console.log('✓ App.tsx patched: CheckIn import + route ensured');
