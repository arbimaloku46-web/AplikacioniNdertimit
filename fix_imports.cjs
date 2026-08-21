const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');
code = code.replace(
  /} from "lucide-react";/,
  ', Box, MessageCircle, LayoutGrid } from "lucide-react";'
);
fs.writeFileSync('App.tsx', code);
