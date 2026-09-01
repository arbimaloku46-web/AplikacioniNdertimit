const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

const progressiveImageComponent = `
const ProgressiveImage = ({ src, alt, className, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={\`relative w-full h-full overflow-hidden \${className || ''}\`}>
      <div className={\`absolute inset-0 bg-slate-800/50 transition-opacity duration-500 \${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}\`} />
      <img
        src={src}
        alt={alt}
        className={\`w-full h-full object-cover transition-all duration-700 ease-in-out \${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}\`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};
`;

code = code.replace(
  "// --- Hotspot Components ---",
  progressiveImageComponent + "\n// --- Hotspot Components ---"
);

// Replace img in grid
const oldImg = `<img 
                                                  src={thumbUrl} 
                                                  alt={item.description}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                                loading="lazy"
                                                decoding="async"
                                            />`;
                                            
const newImg = `<ProgressiveImage 
                                                  src={thumbUrl} 
                                                  alt={item.description}
                                                  className="transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                            />`;

code = code.replace(oldImg, newImg);

fs.writeFileSync('components/MediaGrid.tsx', code);
