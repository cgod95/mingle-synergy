const fs = require("fs");
const p = "src/App.tsx";
let s = fs.readFileSync(p, "utf8");

// add import
if (!s.includes('from "./pages/Feedback"')) {
  s = s.replace(
    /from "\.\/pages\/SignUp";?/,
    `$&\nimport Feedback from "./pages/Feedback";`
  );
}

// add route
if (!s.includes('<Route path="/feedback"')) {
  s = s.replace(
    /<Route path="\*".*<\/Routes>/s,
    `<Route path="/feedback" element={<Feedback />} />\n  $&`
  );
}

fs.writeFileSync(p, s);
console.log("✅ /feedback route added to App.tsx");
