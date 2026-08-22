const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// replace useState<User | null>(null) with hardcoded user
code = code.replace(
  'const [user, setUser] = useState<User | null>(null);',
  'const [user, setUser] = useState<User | null>({ uid: "test", name: "Test", username: "test", email: "test", photoURL: "", isAdmin: true });'
);
fs.writeFileSync('App.tsx', code);
