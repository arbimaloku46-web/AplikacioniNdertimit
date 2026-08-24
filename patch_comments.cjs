const fs = require('fs');
let code = fs.readFileSync('components/UpdateComments.tsx', 'utf8');

// Add showAllComments state
code = code.replace(
  'const [newComment, setNewComment] = useState(\'\');',
  'const [newComment, setNewComment] = useState(\'\');\n  const [showAll, setShowAll] = useState(false);'
);

// Modify comments mapping
code = code.replace(
  'comments.map((comment) => (',
  'const visibleComments = showAll ? comments : comments.slice(-3);\n        return (\n          <>\n            {!showAll && comments.length > 3 && (\n              <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">\n                View previous comments ({comments.length - 3})\n              </button>\n            )}\n            {visibleComments.map((comment) => ('
);

code = code.replace(
  '))\n        )}',
  '))}\n          </>\n        )}'
);

fs.writeFileSync('components/UpdateComments.tsx', code);
console.log("Patched UpdateComments.tsx");
