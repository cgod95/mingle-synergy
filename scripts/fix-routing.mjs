import fs from "node:fs";

const F = "src/App.tsx";
let s = fs.readFileSync(F, "utf8");
let changed = false;

// 1) Ensure NotFoundStandalone exists and is imported
const notFoundImport = 'import NotFoundStandalone from "./pages/NotFoundStandalone";';
if (!/from\s+"\.\/pages\/NotFoundStandalone"/.test(s)) {
  const lastImportIdx = s.lastIndexOf("import ");
  if (lastImportIdx !== -1) {
    const insertAt = s.indexOf("\n", lastImportIdx) + 1;
    s = s.slice(0, insertAt) + notFoundImport + "\n" + s.slice(insertAt);
    changed = true;
  }
}

// 2) Replace any wildcard redirect to /404 with rendering NotFoundStandalone
const wildcard404 = /<Route\s+path="\*"\s+element=\{\s*<Navigate\s+to="\/404"[^}]*>\s*\}\s*\/>/g;
if (wildcard404.test(s)) {
  s = s.replace(wildcard404, '<Route path="*" element={<NotFoundStandalone />} />');
  changed = true;
}

// 3) If there’s a dedicated /404 route, keep it but render NotFoundStandalone (no redirect)
const route404 = /<Route\s+path="\/404"\s+element=\{[^}]*\}\s*\/>/g;
if (route404.test(s)) {
  s = s.replace(route404, '<Route path="/404" element={<NotFoundStandalone />} />');
  changed = true;
}

// 4) Make "/" go to "/sign-up" for now if not present
if (!/<Route\s+path="\/"\s+element=\{\s*<Navigate\s+to="\/sign-up"/.test(s)) {
  s = s.replace(
    /<Routes>\s*/,
    '<Routes>\n              <Route path="/" element={<Navigate to="/sign-up" replace />} />\n'
  );
  changed = true;
}

// 5) Remove any programmatic sends to /404 -> send to /sign-up instead
const before = s;
s = s
  .replace(/navigate\(\s*['"]\/404['"]\s*\)/g, 'navigate("/sign-up")')
  .replace(/<Navigate\s+to="\/404"([^>]*)>/g, '<Navigate to="/sign-up"$1>')
  .replace(/\bto:\s*['"]\/404['"]/g, 'to: "/sign-up"')
  .replace(/\bhref=['"]\/404['"]/g, 'href="/sign-up"')
  .replace(/\bto=['"]\/404['"]/g, 'to="/sign-up"');

if (s !== before) changed = true;

// Save if changed
if (changed) {
  fs.writeFileSync(F, s);
  console.log("✅ Updated routing in src/App.tsx");
} else {
  console.log("ℹ️ No routing changes needed in src/App.tsx");
}
