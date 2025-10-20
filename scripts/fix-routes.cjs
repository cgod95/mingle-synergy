const fs = require('fs');
const file = 'src/App.tsx';
if (!fs.existsSync(file)) { console.error('Missing src/App.tsx'); process.exit(1); }
let s = fs.readFileSync(file,'utf8');

// Ensure the NotFound import exists
if (!s.includes('./pages/NotFoundStandalone')) {
  s = 'import NotFoundStandalone from "./pages/NotFoundStandalone";\n' + s;
}

// Replace entire <Routes>...</Routes> block
const routesRe = /<Routes>[\s\S]*?<\/Routes>/m;
const newRoutes = `
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/sign-in" element={<SignIn />} />
  <Route path="/sign-up" element={<SignUp />} />
  <Route path="/venues" element={<Venues />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/404" element={<NotFoundStandalone />} />
  <Route path="*" element={<NotFoundStandalone />} />
</Routes>
`.trim();

if (routesRe.test(s)) s = s.replace(routesRe, newRoutes);
else {
  console.error('Could not find <Routes> block in src/App.tsx');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('✅ Routes fixed in src/App.tsx');
