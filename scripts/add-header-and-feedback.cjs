const fs = require('fs');

const p = 'src/App.tsx';
if (!fs.existsSync(p)) {
  console.error('Missing src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// Ensure Header import
if (!s.includes('from "./components/Header"')) {
  if (s.match(/from "\.\/components\/ErrorBoundary";?/)) {
    s = s.replace(
      /from "\.\/components\/ErrorBoundary";?/,
      '$&\nimport Header from "./components/Header";'
    );
  } else {
    s = `import Header from "./components/Header";\n` + s;
  }
}

// Ensure <Header /> before first <Routes>
if (!s.includes('<Header />')) {
  s = s.replace('<Routes>', '<Header />\n            <Routes>');
}

// Ensure Feedback import
if (!s.includes('from "./pages/Feedback"')) {
  if (s.match(/from "\.\/pages\/Profile";?/)) {
    s = s.replace(
      /from "\.\/pages\/Profile";?/,
      '$&\nimport Feedback from "./pages/Feedback";'
    );
  } else {
    s = `import Feedback from "./pages/Feedback";\n` + s;
  }
}

// Ensure /feedback route exists (place before the catch-all or before /404)
if (!s.includes('path="/feedback"')) {
  const feedbackRoute = '              <Route path="/feedback" element={<Feedback />} />\n';
  if (s.includes('<Route path="*"')) {
    s = s.replace('              <Route path="*"', feedbackRoute + '              <Route path="*"');
  } else if (s.includes('<Route path="/404"')) {
    s = s.replace('              <Route path="/404"', feedbackRoute + '              <Route path="/404"');
  } else {
    // As a fallback, append before </Routes>
    s = s.replace('</Routes>', feedbackRoute + '            </Routes>');
  }
}

fs.writeFileSync(p, s);
console.log('✅ App.tsx wired with Header + Feedback route');
