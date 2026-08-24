const fs = require('fs');
let code = fs.readFileSync('components/UpdateComments.tsx', 'utf8');

// Remove the outer card styling and header
code = code.replace(
  '<div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl relative z-30 shadow-2xl mt-8">',
  '<div className="relative w-full">'
);

code = code.replace(
  '<h3 className="text-xs uppercase font-extrabold tracking-tight text-brand-blue mb-6 tracking-widest flex items-center gap-2">\n        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>\n        Weekly Discussion\n      </h3>',
  ''
);

// Add the hide button
code = code.replace(
  '{!showAll && comments.length > 3 && (\n                  <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">\n                    View previous comments ({comments.length - 3})\n                  </button>\n                )}',
  `{!showAll && comments.length > 3 && (
                  <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    View previous comments ({comments.length - 3})
                  </button>
                )}
                {showAll && comments.length > 3 && (
                  <button onClick={() => setShowAll(false)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    Hide previous comments
                  </button>
                )}`
);

fs.writeFileSync('components/UpdateComments.tsx', code);
console.log("Patched UpdateComments.tsx for layout and hide button");
