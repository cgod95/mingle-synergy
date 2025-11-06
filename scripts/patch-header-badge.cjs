const fs = require("fs");
const p = "src/components/Header.tsx";
if (!fs.existsSync(p)) {
  console.log("❌ src/components/Header.tsx not found");
  process.exit(1);
}
let s = fs.readFileSync(p, "utf8");

// Ensure we import getMatches
if (!/from "\.\.\/lib\/matchStore"/.test(s)) {
  s = s.replace(
    /import\s+\{[^}]*\}\s+from\s+"react-router-dom";?/,
    '$&\nimport { getMatches } from "../lib/matchStore";'
  );
}

// Add count state/effect if missing
if (!/const \[matchCount, setMatchCount\]/.test(s)) {
  s = s.replace(
    /export default function Header\(\)\s*\{\s*\n/,
    'export default function Header() {\n  const [matchCount, setMatchCount] = React.useState<number>(() => getMatches().length);\n  React.useEffect(() => {\n    const update = () => setMatchCount(getMatches().length);\n    update();\n    const t = setInterval(update, 2000);\n    const onStorage = (e: StorageEvent) => { if (e.key && e.key.startsWith("match:")) update(); };\n    window.addEventListener("storage", onStorage);\n    return () => { clearInterval(t); window.removeEventListener("storage", onStorage); };\n  }, []);\n'
  );
}

// Replace plain Matches link with badge version
s = s.replace(
  /<NavLink to="\/matches">Matches<\/NavLink>/,
  '<NavLink to="/matches">Matches{matchCount ? ` (${matchCount})` : ""}</NavLink>'
);

fs.writeFileSync(p, s);
console.log("✅ Header.tsx patched with Matches badge");
