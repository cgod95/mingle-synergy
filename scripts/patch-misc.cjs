const fs = require('fs');

function patchApp() {
  const p = 'src/App.tsx';
  if (!fs.existsSync(p)) return console.log('⚠️ App.tsx not found, skipping.');
  let s = fs.readFileSync(p,'utf8');
  let changed = false;

  // A) Remove duplicate Navigate import if present twice
  const lines = s.split('\n');
  const navLineIdxs = lines
    .map((L,i)=>({L,i}))
    .filter(x => /^\s*import\s*\{\s*Navigate\s*\}\s*from\s*["']react-router-dom["'];\s*$/.test(x.L))
    .map(x=>x.i);
  if (navLineIdxs.length > 1) {
    // remove all but first
    navLineIdxs.slice(1).reverse().forEach(i => lines.splice(i,1));
    s = lines.join('\n'); changed = true;
  }

  // B) Ensure "Navigate" is included once in the main react-router-dom import if that’s the pattern used
  if (/from\s+["']react-router-dom["']/.test(s) && !/\{\s*Navigate\s*\}/.test(s)) {
    s = s.replace(
      /(import\s*\{\s*[^}]*)(\}\s*from\s*["']react-router-dom["'];)/,
      (m,a,b) => a.includes('Routes') ? `${a}, Navigate ${b}` : m
    );
    changed = true;
  }

  // C) Swap <Venues /> -> <VenueList />
  if (/<Venues\s*\/>/.test(s)) {
    s = s.replace(/<Venues\s*\/>/g, '<VenueList />'); changed = true;
  }

  // D) Ensure VenueList import exists; remove any dead "Venues" import
  if (!/from\s+["']\.\/pages\/VenueList["']/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport VenueList from "./pages/VenueList";\n`);
    changed = true;
  }
  s = s.replace(/^\s*import\s+Venues\s+from\s+["']\.\/pages\/Venues["'];\s*\n?/m, () => { changed = true; return '' });

  if (changed) { fs.writeFileSync(p,s); console.log('✅ App.tsx patched'); }
  else { console.log('✓ App.tsx already OK'); }
}

function patchPeopleInVenue() {
  const p = 'src/components/venue/PeopleInVenue.tsx';
  if (!fs.existsSync(p)) return console.log('⚠️ PeopleInVenue.tsx not found, skipping.');
  let s = fs.readFileSync(p,'utf8'); let changed = false;

  // Ensure React import
  if (!/import\s+React\b/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `import React from "react";\n$1`);
    changed = true;
  }
  // Ensure useNavigate import
  if (!/useNavigate/.test(s)) {
    s = s.replace(/(import\s*\{\s*[^}]*\}\s*from\s*["']react-router-dom["'];)/,
      (m) => m.includes('useNavigate') ? m : m.replace('{', '{ useNavigate, ')
    );
    if (!/from\s*["']react-router-dom["']/.test(s)) {
      s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport { useNavigate } from "react-router-dom";\n`);
    }
    changed = true;
  }

  if (changed) { fs.writeFileSync(p,s); console.log('✅ PeopleInVenue.tsx patched'); }
  else { console.log('✓ PeopleInVenue.tsx already OK'); }
}

function patchDemoVenues() {
  const p = 'src/lib/demoVenues.ts';
  if (!fs.existsSync(p)) return console.log('⚠️ demoVenues.ts not found, skipping.');
  let s = fs.readFileSync(p,'utf8'); let changed = false;

  if (!/export\s+function\s+getAllVenues\s*\(/.test(s)) {
    s += `

export function getAllVenues(){
  try {
    // return whichever exists
    // @ts-ignore
    if (typeof demoVenues !== 'undefined') return demoVenues;
    // @ts-ignore
    if (typeof venues !== 'undefined') return venues;
  } catch {}
  return [];
}
`;
    changed = true;
  }

  if (changed) { fs.writeFileSync(p,s); console.log('✅ demoVenues.ts: getAllVenues() added'); }
  else { console.log('✓ demoVenues.ts already has getAllVenues()'); }
}

patchApp();
patchPeopleInVenue();
patchDemoVenues();
