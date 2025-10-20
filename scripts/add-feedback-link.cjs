const fs = require('fs');
const path = require('path');

function findHeader() {
  const candidates = [
    'src/components/Header.tsx',
    'src/components/Header.jsx',
    'src/components/Header.ts',
    'src/components/TopNav.tsx',
    'src/components/Layout.tsx',
    'src/components/Navigation.tsx',
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;

  // fallback scan
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(t|j)sx?$/.test(f)) files.push(full);
    }
  }
  walk('src/components');
  const hits = files.filter(f => {
    const s = fs.readFileSync(f, 'utf8');
    return s.includes('Link') && (s.includes('/profile') || s.includes('/venues') || s.includes('<nav'));
  });
  return hits[0] || null;
}

function createMinimalHeader() {
  const p = 'src/components/Header.tsx';
  if (fs.existsSync(p)) return p;
  const s = `import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav style={{display:"flex",gap:12,padding:12,borderBottom:"1px solid #eee"}}>
      <Link to="/">Home</Link>
      <Link to="/venues">Venues</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/feedback">Feedback</Link>
    </nav>
  );
}
`;
  fs.writeFileSync(p, s);
  console.log('🆕 Created minimal Header.tsx');
  return p;
}

function ensureFeedbackLink(headerPath) {
  let s = fs.readFileSync(headerPath, 'utf8');

  // Ensure Link import exists and includes Link
  if (!/from\s+["']react-router-dom["']/.test(s)) {
    s = `import { Link } from "react-router-dom";\n` + s;
  } else if (!/Link\s*\}/.test(s)) {
    s = s.replace(/from\s+["']react-router-dom["'];?/,
      (m) => {
        if (/\{[^}]*\}/.test(m)) {
          return m.replace(/\{([^}]*)\}/, (mm, inside) => `{ ${inside.includes('Link') ? inside : (inside.trim() ? inside + ', Link' : 'Link')} }`);
        }
        return `import { Link } ${m}`;
      }
    );
  }

  if (!/to=["']\/feedback["']/.test(s)) {
    if (s.includes('<Link to="/profile">')) {
      s = s.replace('<Link to="/profile">Profile</Link>',
        '<Link to="/profile">Profile</Link>\n      <Link to="/feedback">Feedback</Link>');
    } else if (s.includes('<Link to="/venues">')) {
      s = s.replace('<Link to="/venues">Venues</Link>',
        '<Link to="/venues">Venues</Link>\n      <Link to="/feedback">Feedback</Link>');
    } else if (s.includes('<nav')) {
      s = s.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/,
        (m, inner) => m.replace(inner, `${inner}\n  <Link to="/feedback">Feedback</Link>\n`));
    } else {
      s = s.replace(/return\s*\(/, match =>
        `${match}\n  <nav style={{display:"flex",gap:12,padding:12,borderBottom:"1px solid #eee"}}>\n    <Link to="/">Home</Link>\n    <Link to="/venues">Venues</Link>\n    <Link to="/profile">Profile</Link>\n    <Link to="/feedback">Feedback</Link>\n  </nav>\n`);
    }
  }

  fs.writeFileSync(headerPath, s);
  console.log('✅ Feedback link ensured in', headerPath);
}

function ensureHeaderInApp() {
  const app = 'src/App.tsx';
  if (!fs.existsSync(app)) return;
  let s = fs.readFileSync(app, 'utf8');

  if (!/from\s+["']\.\/components\/Header["']/.test(s)) {
    s = s.replace(/(import NotFoundStandalone[^;]+;)/, `$1\nimport Header from "./components/Header";`);
  }

  if (!/<Header\s*\/>/.test(s)) {
    s = s.replace(/(<OnboardingProvider>[\s\S]*?<div data-testid="app-loaded"[^>]*>\s*<\/div>)/m,
      `$1\n            <Header />`);
  }

  fs.writeFileSync(app, s);
  console.log('✅ <Header /> rendered in App.tsx');
}

(function main(){
  let header = findHeader();
  if (!header) header = createMinimalHeader();
  ensureFeedbackLink(header);
  ensureHeaderInApp();
})();
