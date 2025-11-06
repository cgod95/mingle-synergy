const fs = require('fs');
const p = 'src/components/Header.tsx';
if (!fs.existsSync(p)) { console.error('Missing', p); process.exit(1); }
let s = fs.readFileSync(p,'utf8');

// ensure imports
if (!/from "react-router-dom"/.test(s)) {
  s = `import { NavLink, Link } from "react-router-dom";\n` + s;
} else if (!/NavLink/.test(s)) {
  s = s.replace(/from "react-router-dom";/, 'from "react-router-dom";');
}

// add link next to Venues/Profile
if (!/to="\/matches"/.test(s)) {
  s = s.replace(
    /(<NavLink to="\/venues"[^>]*>[^<]*<\/NavLink>)/,
    `$1\n          <NavLink to="/matches">Matches</NavLink>`
  );
  if (!/to="\/matches"/.test(s)) {
    // fallback: append into first <nav>
    s = s.replace(
      /(<nav[^>]*>)/,
      `$1\n          <NavLink to="/matches">Matches</NavLink>`
    );
  }
}

fs.writeFileSync(p,s);
console.log('✅ Header.tsx updated with Matches link');
