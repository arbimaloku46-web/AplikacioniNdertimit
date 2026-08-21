const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /LayoutGrid,, Box, MessageCircle, LayoutGrid } from "lucide-react";/,
  'LayoutGrid, Box, MessageCircle } from "lucide-react";'
);

fs.writeFileSync('App.tsx', code);
