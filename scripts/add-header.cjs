const fs = require('fs');
const p = 'src/App.tsx';
let s = fs.readFileSync(p, 'utf8');

// Ensure Header import
if (!s.includes(`from "./components/Header"`)) {
  s = s.replace(
    /(from\s+"\.\/components\/ErrorBoundary";?\s*\n)/,
    `$1import Header from "./components/Header";\n`
  );
}

// Insert <Header /> before first <Routes> if not present
if (!s.includes('<Header />') && s.includes('<Routes>')) {
  s = s.replace('<Routes>', '<Header />\n            <Routes>');
}

fs.writeFileSync(p, s);
console.log('✅ <Header /> included in App and import added');
