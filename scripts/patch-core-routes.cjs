const fs = require('fs');
const p = 'src/App.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(src, impLine) {
  if (!s.includes(impLine)) {
    // place near other imports
    s = s.replace(/(^import .*;[\r\n]+)/, (m) => m + impLine + '\n');
  }
}

function ensureRoute(routeLine) {
  if (!s.includes(routeLine.trim())) {
    s = s.replace(/<\/Routes>/, `  ${routeLine}\n    </Routes>`);
  }
}

ensureImport('./pages/VenueList', 'import VenueList from "./pages/VenueList";');
ensureImport('./components/venue/VenueDetails', 'import VenueDetails from "./components/venue/VenueDetails";');
ensureImport('./pages/Matches', 'import Matches from "./pages/Matches";');

ensureRoute('<Route path="/venues" element={<VenueList />} />');
ensureRoute('<Route path="/venues/:id" element={<VenueDetails />} />');
ensureRoute('<Route path="/matches" element={<Matches />} />');

fs.writeFileSync(p, s);
console.log('✓ App.tsx patched: core routes in place');
