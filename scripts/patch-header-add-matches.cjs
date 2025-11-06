const fs = require('fs');
const p = 'src/components/Header.tsx';
if (!fs.existsSync(p)) {
  console.error('❌ Missing src/components/Header.tsx');
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// ensure Link import exists
if (!/from "react-router-dom"/.test(s) && !/from 'react-router-dom'/.test(s)) {
  s = `import { Link, NavLink } from "react-router-dom";\n` + s;
} else if (!/NavLink/.test(s)) {
  s = s.replace(/from ["']react-router-dom["'];?/,
    (m) => s.includes('Link') ? m.replace('Link', 'Link, NavLink') : m.replace('from', 'import { NavLink } from').replace(/;$/, '')
  );
}

// add Matches link if missing
if (!/to=["']\/matches["']/.test(s)) {
  s = s.replace(
    /(<nav[^>]*>[^]*?)(<NavLink[^>]*to=["']\/profile["'][^>]*>[^<]*<\/NavLink>)/,
    `$1<NavLink to="/matches">Matches</NavLink>\n            $2`
  );
}

fs.writeFileSync(p, s);
console.log('✅ Header patched (Matches link)');
