const fs = require("fs");
const p = "src/main.tsx";
if (!fs.existsSync(p)) {
  console.error("✗ src/main.tsx not found");
  process.exit(1);
}
let s = fs.readFileSync(p, "utf8");

function ensureImport(from, named) {
  const rx = new RegExp(`import\\s+\\{[^}]*\\b${named}\\b[^}]*\\}\\s+from\\s+["']${from}["']\\s*;`);
  if (!rx.test(s)) {
    // If there is an existing import from same module with braces, merge into it; else add a fresh import
    const modRx = new RegExp(`import\\s+\\{([^}]*)\\}\\s+from\\s+["']${from}["']\\s*;`);
    if (modRx.test(s)) {
      s = s.replace(modRx, (_m, grp) => `import { ${grp.trim().length ? grp.trim() + ", " : ""}${named} } from "${from}";`);
    } else {
      // Insert after first import
      const firstImport = s.indexOf("import ");
      const endLine = s.indexOf("\n", firstImport) + 1;
      s = s.slice(0, endLine) + `import { ${named} } from "${from}";\n` + s.slice(endLine);
    }
  }
}

ensureImport("./lib/likesStore", "ensureDemoLikesSeed");
ensureImport("./lib/chatStore", "seedDemoConversations");

// Insert seed calls exactly once before the first ".render("
if (!/ensureDemoLikesSeed\(\);/.test(s) || !/seedDemoConversations\(\);/.test(s)) {
  // Find the first ".render("
  const idx = s.indexOf(".render(");
  if (idx === -1) {
    console.error("✗ Could not find .render( in src/main.tsx");
    process.exit(1);
  }
  // Insert both seeds a few lines above that call, but after imports.
  const lines = s.split("\n");
  let renderLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(".render(")) { renderLine = i; break; }
  }
  if (renderLine === -1) {
    console.error("✗ Could not find .render( line in src/main.tsx");
    process.exit(1);
  }
  // If not already present, inject above render line
  if (!/ensureDemoLikesSeed\(\);/.test(s)) lines.splice(renderLine, 0, "ensureDemoLikesSeed();");
  if (!/seedDemoConversations\(\);/.test(s)) lines.splice(renderLine, 0, "seedDemoConversations();");
  s = lines.join("\n");
}

fs.writeFileSync(p, s);
console.log("✓ Patched src/main.tsx to import & run seeding");
