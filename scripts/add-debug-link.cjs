const fs = require('fs');
const p = 'src/components/Header.tsx';
if (!fs.existsSync(p)) {
  console.log('ℹ️ No Header.tsx found; skipping nav injection.');
  process.exit(0);
}
let s = fs.readFileSync(p, 'utf8');

// Ensure imports
if (!/from "react-router-dom"/.test(s)) {
  s = `import { NavLink } from "react-router-dom";\n` + s;
} else if (!/NavLink/.test(s)) {
  s = s.replace(/from "react-router-dom";/, 'from "react-router-dom";');
}

// Add Debug link after Feedback
if (!/to="\/debug"/.test(s)) {
  s = s.replace(
    /(<NavLink to="\/feedback">Feedback<\/NavLink>)/,
    `$1
          <NavLink to="/debug">Debug</NavLink>`
  );
}

fs.writeFileSync(p, s);
console.log('✅ Header updated with Debug link');
