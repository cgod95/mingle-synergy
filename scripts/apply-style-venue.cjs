const fs = require('fs');
const p = 'src/components/venue/VenueDetails.tsx';
if (!fs.existsSync(p)) { console.log('⚠️ VenueDetails.tsx not found'); process.exit(0); }
let s = fs.readFileSync(p,'utf8'); let changed = false;

// Imports
if (!/from\s+"\.{1,2}\/ui\/Card"/.test(s)) { s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Card from "../../ui/Card";\n`); changed = true; }
if (!/from\s+"\.{1,2}\/ui\/Avatar"/.test(s)) { s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Avatar from "../../ui/Avatar";\n`); changed = true; }
if (!/from\s+"\.{1,2}\/ui\/Button"/.test(s)) { s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Button from "../../ui/Button";\n`); changed = true; }

// Replace person tiles container to use Card + Avatar + Button
s = s.replace(
  /<div key=\{p\.id\} style=\{\{[^}]*\}\}>[\s\S]*?<div style=\{\{\s*display:\s*"flex"[\s\S]*?<\/div>\s*<\/div>/g,
  (m) => m
    .replace(/<div key=\{p\.id\}[^>]*>/, `<Card key={p.id} className="p-3">`)
    .replace(/<\/div>\s*$/, `</Card>`)
    .replace(/<img[\s\S]*?alt=\{p\.name\}[\s\S]*?>/g, `<Avatar src={p.avatar} alt={p.name} size={48} />`)
    .replace(/<button([\s\S]*?)>[\s\S]*?Like[\s\S]*?<\/button>/, `<Button onClick={()=>handleLike(p)}>Like & Chat</Button>`)
);

if (s !== fs.readFileSync(p,'utf8')) { fs.writeFileSync(p,s); console.log('✅ VenueDetails.tsx styled'); }
else { console.log('✓ VenueDetails.tsx already styled'); }
