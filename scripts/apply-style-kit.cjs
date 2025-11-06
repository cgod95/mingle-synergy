const fs = require('fs');

function patchHeader() {
  const p = 'src/components/Header.tsx';
  if (!fs.existsSync(p)) return console.log('⚠️ Header.tsx not found, skipping.');
  let s = fs.readFileSync(p, 'utf8');

  // Import Badge
  if (!/from\s+"\.{1,2}\/ui\/Badge"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Badge from "../ui/Badge";\n`);
  }

  // Ensure state vars are not duplicated
  s = s
    .replace(/const\s*\[\s*unreadCount\s*,\s*setUnread\s*\][^\n]*\n/g, '')
    .replace(/const\s*\[\s*matchCount\s*,\s*setMatchCount\s*\][^\n]*\n/g, '')
    .replace(/const\s*\[\s*unread\s*,\s*setUnread\s*\][^\n]*\n/g, '')
    .replace(/const\s*\[\s*matches\s*,\s*setMatchCount\s*\][^\n]*\n/g, '');

  // Inject canonical state once after useAuth()
  s = s.replace(
    /(const\s*\{\s*user\s*,\s*logout\s*\}\s*=\s*useAuth\(\);\s*)/,
    `$1
  const [unread, setUnread] = React.useState(0);
  const [matchCount, setMatchCount] = React.useState(0);
  React.useEffect(() => {
    try {
      const { getTotalUnread, getMatchCount } = require("../lib/matchStore");
      const tick = () => {
        setUnread(getTotalUnread());
        setMatchCount(getMatchCount());
      };
      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    } catch {}
  }, []);
`
  );

  // Replace any plain counts with badges inside the nav block
  s = s.replace(
    /(<nav[^>]*>[\s\S]*?)(<\/nav>)/,
    (_, a, b) => {
      let block = _;
      // add Matches link badge if not present
      if (!/Matches<\/NavLink>/.test(block)) {
        block = block.replace(/(<nav[^>]*>)/, `$1
          <NavLink to="/matches">Matches</NavLink>
        `);
      }
      // Insert badges near matches link
      block = block.replace(/(<NavLink[^>]*to="\/matches"[^>]*>Matches<\/NavLink>)/,
        `$1 <Badge tone="info">{matchCount} matches</Badge>{unread > 0 && <Badge tone="warning" className="ml-2">{unread} unread</Badge>}`
      );
      return block;
    }
  );

  fs.writeFileSync(p, s);
  console.log('✅ Patched Header.tsx');
}

function patchMatches() {
  const p = 'src/pages/Matches.tsx';
  if (!fs.existsSync(p)) return console.log('⚠️ Matches.tsx not found, skipping.');
  let s = fs.readFileSync(p, 'utf8');

  // Imports
  if (!/from\s+"\.{1,2}\/ui\/Card"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Card from "../ui/Card";\n`);
  }
  if (!/from\s+"\.{1,2}\/ui\/Avatar"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Avatar from "../ui/Avatar";\n`);
  }
  if (!/from\s+"\.{1,2}\/ui\/Badge"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Badge from "../ui/Badge";\n`);
  }

  // Replace list item container with Card
  s = s.replace(
    /<li\s+key=\{m\.id\}[^>]*>([\s\S]*?)<\/li>/g,
    `<Card key={m.id} className="p-3">$1</Card>`
  );

  // Replace <img ...> with <Avatar ...>
  s = s.replace(
    /<img\s+([^>]*?)src=\{m\.otherAvatar[^>]*?alt=\{m\.otherName\}[^>]*?>/g,
    `<Avatar src={m.otherAvatar} alt={m.otherName} />`
  );

  // Add expiry badge
  s = s.replace(
    /(Expires in\s*\{\s*formatSeconds\(remaining\)\s*\}\s*)/g,
    `{/* replaced by badge */}`
  );
  s = s.replace(
    /(\{expired \? \()([\s\S]*?)(\) : \()([\s\S]*?)(\)\)})/m,
    `{expired ? <Badge tone="danger">Expired</Badge> : <Badge tone="info">Expires in {formatSeconds(remaining)}</Badge>}`
  );

  fs.writeFileSync(p, s);
  console.log('✅ Patched Matches.tsx');
}

function patchChatRoom() {
  const p = 'src/pages/ChatRoom.tsx';
  if (!fs.existsSync(p)) return console.log('⚠️ ChatRoom.tsx not found, skipping.');
  let s = fs.readFileSync(p, 'utf8');

  // Imports for MessageBubble and Button
  if (!/from\s+"\.{1,2}\/ui\/MessageBubble"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport MessageBubble from "../ui/MessageBubble";\n`);
  }
  if (!/from\s+"\.{1,2}\/ui\/Button"/.test(s)) {
    s = s.replace(/(import[\s\S]*?;\s*)/, `$1\nimport Button from "../ui/Button";\n`);
  }

  // Replace raw bubble divs with <MessageBubble>
  s = s.replace(
    /{\(match\.messages \|\| \[\]\)\.map\(\(m\) => \(\s*<div[\s\S]*?<\/div>\s*\)\)}/m,
    `{(match.messages || []).map(m => (
      <MessageBubble key={m.id} from={m.sender as any}>{m.text}</MessageBubble>
    ))}`
  );

  // Replace Send button
  s = s.replace(
    /<button([^>]*)>\s*Send\s*<\/button>/,
    `<Button type="submit" disabled={expired || !text.trim()} variant={(expired || !text.trim()) ? "secondary" : "primary"}>Send</Button>`
  );

  fs.writeFileSync(p, s);
  console.log('✅ Patched ChatRoom.tsx');
}

patchHeader();
patchMatches();
patchChatRoom();
