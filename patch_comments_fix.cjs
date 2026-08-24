const fs = require('fs');
let code = fs.readFileSync('components/UpdateComments.tsx', 'utf8');

code = code.replace(
  '{(!comments || comments.length === 0) ? (\n          <p className="text-sm text-slate-500 italic text-center py-6">No comments yet. Start the discussion!</p>\n        ) : (\n          const visibleComments = showAll ? comments : comments.slice(-3);\n        return (\n          <>\n            {!showAll && comments.length > 3 && (\n              <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">\n                View previous comments ({comments.length - 3})\n              </button>\n            )}\n            {visibleComments.map((comment) => (',
  `{(!comments || comments.length === 0) ? (
          <p className="text-sm text-slate-500 italic text-center py-6">No comments yet. Start the discussion!</p>
        ) : (
          (() => {
            const visibleComments = showAll ? comments : comments.slice(-3);
            return (
              <>
                {!showAll && comments.length > 3 && (
                  <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    View previous comments ({comments.length - 3})
                  </button>
                )}
                {visibleComments.map((comment) => (`
);

code = code.replace(
  '))}\n          </>\n        )}',
  '))}\n              </>\n            );\n          })()\n        )}'
);

fs.writeFileSync('components/UpdateComments.tsx', code);
console.log("Patched UpdateComments.tsx fixed");
