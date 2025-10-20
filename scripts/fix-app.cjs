const fs = require('fs');
const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('Missing src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// 1) Drop duplicate page imports (SignIn/SignUp/Venues/Profile/LandingPage/etc.)
{
  const lines = s.split('\n');
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    if (/^import\s+[\w{},\s*]+\s+from\s+["']\.\/pages\//.test(line)) {
      const key = line.trim().replace(/\s+/g, ' ');
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(line);
  }
  s = out.join('\n');
}

// 2) Ensure NotFoundStandalone import (and normalize any old alias)
if (!/from ["']\.\/pages\/NotFoundStandalone["']/.test(s)) {
  s = s.replace(
    /(from ["']\.\/context\/OnboardingContext["'];\s*)/,
    `$1import NotFoundStandalone from "./pages/NotFoundStandalone";\n`
  );
}
s = s.replace(
  /import\s+NotFound\s+from\s+["']\.\/pages\/NotFoundStandalone["'];?/g,
  'import NotFoundStandalone from "./pages/NotFoundStandalone";'
);

// 3) Ensure ProtectedRoute import
if (!/from ["']\.\/components\/ProtectedRoute["']/.test(s)) {
  s = s.replace(
    /(from ["']\.\/context\/OnboardingContext["'];\s*(?:\r?\n)?)/,
    `$1import ProtectedRoute from "./components/ProtectedRoute";\n`
  );
}

// 4) Replace the Routes block
s = s.replace(
  /<Routes>[\s\S]*?<\/Routes>/m,
  `<Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/404" element={<NotFoundStandalone />} />
              <Route path="*" element={<NotFoundStandalone />} />
            </Routes>`
);

// 5) Write back
fs.writeFileSync(p, s);
console.log('✅ Updated', p);
