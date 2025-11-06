const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) process.exit(0);
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('from "./pages/ChatRoom"')) {
  if (s.includes('from "./pages/Profile";')) {
    s = s.replace('from "./pages/Profile";', 'from "./pages/Profile";\nimport ChatRoom from "./pages/ChatRoom";');
  } else {
    s = s.replace(/(import[\s\S]*?;)(\s*import[\s\S]*?;)/, `$1$2\nimport ChatRoom from "./pages/ChatRoom";`);
  }
}

if (!s.includes('path="/chat/:id"')) {
  const line = '              <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />\n';
  if (s.includes('<Route path="/404"')) {
    s = s.replace(/(\s*<Route path="\/404"[\s\S]*?\/>)/, line + '$1');
  } else if (s.includes('<Route path="*"')) {
    s = s.replace(/(\s*<Route path="\*"[\s\S]*?\/>)/, line + '$1');
  } else if (s.includes('</Routes>')) {
    s = s.replace('</Routes>', line + '</Routes>');
  }
}

fs.writeFileSync(p, s);
console.log('✅ Ensured ChatRoom import and /chat/:id route in App.tsx');
