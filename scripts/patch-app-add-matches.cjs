const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('❌ Missing src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// ensure imports
if (!/from "\.\/pages\/Matches"/.test(s)) {
  s = s.replace(/(from "\.\/pages\/Profile";?\s*)/,
    `$1\nimport Matches from "./pages/Matches";\n`);
}
if (!/from "\.\/pages\/ChatStub"/.test(s)) {
  s = s.replace(/(from "\.\/pages\/NotFoundStandalone";?\s*)/,
    `$1\nimport ChatStub from "./pages/ChatStub";\n`);
}

// add routes before 404 (or before closing </Routes>)
if (!/path=["']\/matches["']/.test(s)) {
  s = s.replace(
    /(<Route[^>]*path=["']\/profile["'][^>]*>[^<]*<\/Route>|<Route[^>]*path=["']\/profile["'][^>]*\/>)/,
    `$1
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <ChatStub />
                  </ProtectedRoute>
                }
              />`
  );
  if (!/path=["']\/matches["']/.test(s)) {
    // fallback: inject before 404
    s = s.replace(
      /(\s*<Route\s+path=["']\/404["'][^>]*>[^<]*<\/Route>|\s*<Route\s+path=["']\/404["'][^>]*\/>)/,
      `
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <ChatStub />
                  </ProtectedRoute>
                }
              />
$1`
    );
  }
}

fs.writeFileSync(p, s);
console.log('✅ App.tsx patched (matches + chat routes)');
