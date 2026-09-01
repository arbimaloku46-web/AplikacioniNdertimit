const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

const progressiveImageComponent = `
const ProgressiveImage = ({ src, alt, className, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lqipSrc, setLqipSrc] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to create a tiny LQIP version if it's a supported CDN, 
    // otherwise fallback to a colored skeleton.
    if (src && src.includes('supabase.co')) {
      // Supabase image transformation to generate a 20px blur placeholder
      const url = new URL(src);
      url.searchParams.set('width', '20');
      url.searchParams.set('quality', '20');
      url.searchParams.set('blur', '10');
      setLqipSrc(url.toString());
    }
  }, [src]);

  return (
    <div className={\`relative w-full h-full overflow-hidden \${className || ''}\`}>
      {/* Background Pulse / Skeleton */}
      <div className={\`absolute inset-0 bg-slate-800/80 transition-opacity duration-700 \${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}\`} />
      
      {/* LQIP Image if supported */}
      {lqipSrc && (
        <img 
          src={lqipSrc} 
          alt="" 
          className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 \${isLoaded ? 'opacity-0' : 'opacity-100'}\`} 
          aria-hidden="true" 
        />
      )}

      {/* Main High-Res Image */}
      <img
        src={src}
        alt={alt}
        className={\`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out \${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'}\`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};
`;

code = code.replace(/const ProgressiveImage = \(\{ src, alt, className, \.\.\.props \}: any\) => \{[\s\S]*?<\//, progressiveImageComponent.replace('</', '<\\/')); // Handle replace safely

fs.writeFileSync('components/MediaGrid.tsx', code);
