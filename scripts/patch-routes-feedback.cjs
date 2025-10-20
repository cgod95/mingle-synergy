const fs = require('fs');
const p = 'src/App.tsx';
let s = fs.readFileSync(p, 'utf8');

// Ensure imports
if (!s.includes(`from "./pages/Feedback"`)) {
  s = s.replace(
    /(from\s+"\.\/pages\/Profile";?\s*\n)/,
    `$1import Feedback from "./pages/Feedback";\n`
  );
}
if (!s.includes(`from "./pages/AdminFeedback"`)) {
  s = s.replace(
    /(from\s+"\.\/pages\/Feedback";?\s*\n)/,
    `$1import AdminFeedback from "./pages/AdminFeedback";\n`
  );
}

// Ensure routes exist
const feedbackRoute = `              <Route path="/feedback" element={<Feedback />} />`;
const adminRoute = `              <Route path="/admin/feedback" element={<AdminFeedback />} />`;

if (!s.includes(feedbackRoute) || !s.includes(adminRoute)) {
  if (s.includes(`<Route path="/404"`) || s.includes(`<Route path='/404'`)) {
    s = s.replace(
      /(\s*<Route\s+path=["']\/404["'][^>]*\/>\s*)/m,
      `${feedbackRoute}\n${adminRoute}\n$1`
    );
  } else if (s.includes(`</Routes>`)) {
    s = s.replace(
      /<\/Routes>/m,
      `${feedbackRoute}\n${adminRoute}\n            </Routes>`
    );
  }
}

fs.writeFileSync(p, s);
console.log('✅ Routes for /feedback and /admin/feedback ensured in src/App.tsx');
