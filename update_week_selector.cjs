const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// 1. Add ref declaration and useEffect
const hookContent = `
  const weekSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (weekSelectorRef.current && activeUpdateIndex !== null) {
      const container = weekSelectorRef.current;
      const activeBtn = container.querySelector(\`#week-btn-\${activeUpdateIndex}\`) as HTMLElement;
      if (activeBtn) {
        const scrollLeft = activeBtn.offsetLeft - (container.offsetWidth / 2) + (activeBtn.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeUpdateIndex]);
`;

content = content.replace(
  "const [heroTab, setHeroTab] = useState<'3d' | '360'>('3d');",
  "const [heroTab, setHeroTab] = useState<'3d' | '360'>('3d');" + hookContent
);

// 2. Add ref to container
content = content.replace(
  /<div className=\{\`flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 mb-4 md:pb-4 md:mb-6\`\}>/g,
  '<div ref={weekSelectorRef} className={`flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 mb-4 md:pb-4 md:mb-6`}>'
);

// 3. Add ID to button
content = content.replace(
  /<button key=\{i\} onClick=\{\(\) => setActiveUpdateIndex\(i\)\} className=\{\`relative min-w-\[130px\] md:min-w-\[160px\] p-6 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left group shrink-0 snap-start \$\{i === activeUpdateIndex \? 'border-brand-blue bg-brand-blue\/10 shadow-\[0_10px_30px_rgba\\(34,100,171,0\\.1\\)\]' : 'border-white\/5 bg-slate-900\/40 hover:bg-slate-900\/90 backdrop-blur-2xl'\}\`\}>/g,
  '<button id={`week-btn-${i}`} key={i} onClick={() => setActiveUpdateIndex(i)} className={`relative min-w-[130px] md:min-w-[160px] p-6 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left group shrink-0 snap-start ${i === activeUpdateIndex ? \'border-brand-blue bg-brand-blue/10 shadow-[0_10px_30px_rgba(34,100,171,0.1)]\' : \'border-white/5 bg-slate-900/40 hover:bg-slate-900/90 backdrop-blur-2xl\'}`}>'
);

fs.writeFileSync('App.tsx', content);
