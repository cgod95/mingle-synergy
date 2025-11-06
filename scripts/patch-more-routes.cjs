const fs = require('fs');
const p = 'src/App.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(imp) {
  if (!s.includes(imp)) {
    s = s.replace(/(^import .*;[\r\n]+)/, (m) => m + imp + '\n');
  }
}
function ensureRoute(route) {
  if (!s.includes(route.trim())) {
    s = s.replace(/<\/Routes>/, `  ${route}\n    </Routes>`);
  }
}
ensureImport('import Profile from "./pages/Profile";');
ensureImport('import CheckIn from "./pages/CheckIn";');
ensureImport('import ChatIndex from "./pages/ChatIndex";');
ensureImport('import ChatRoom from "./pages/ChatRoom";');
ensureImport('import Matches from "./pages/Matches";');

ensureRoute('<Route path="/profile" element={<Profile />} />');
ensureRoute('<Route path="/checkin" element={<CheckIn />} />');
ensureRoute('<Route path="/chat" element={<ChatIndex />} />');
ensureRoute('<Route path="/chat/:matchId" element={<ChatRoom />} />');
ensureRoute('<Route path="/matches" element={<Matches />} />');

fs.writeFileSync(p, s);
console.log('✓ App.tsx patched with profile/checkin/chat/matches routes');
