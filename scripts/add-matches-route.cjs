const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('Missing src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('import Matches from "./pages/Matches";')) {
  s = 'import Matches from "./pages/Matches";\n' + s;
}

if (!s.includes('path="/matches"')) {
  s = s.replace(/<\/Routes>/, '              <Route path="/matches" element={<Matches />} />\n            </Routes>');
}

fs.writeFileSync(p, s);
console.log('✅ App.tsx patched with /matches route and import');
