const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf8');

// Add import Download
if (!code.includes('plugins/download')) {
  code = code.replace(
    'import Zoom from "yet-another-react-lightbox/plugins/zoom";',
    'import Zoom from "yet-another-react-lightbox/plugins/zoom";\nimport Download from "yet-another-react-lightbox/plugins/download";'
  );
}

// Update plugins array
code = code.replace(
  'plugins={[Captions, Video, Zoom]}',
  'plugins={[Captions, Video, Zoom, Download]}'
);

// Map slide to add downloadUrl
code = code.replace(
  'const baseProps = {\n            mediaId: item.id,\n            title: item.description,\n            description: `${item.category} • ${item.type}`,\n          };',
  'const baseProps = {\n            mediaId: item.id,\n            title: item.description,\n            description: `${item.category} • ${item.type}`,\n            downloadUrl: item.url,\n          };'
);

// Fix layout of custom-video
code = code.replace(
  '<div className="w-full h-full flex items-center justify-center p-6 md:p-12">\n                            <div className="relative w-full max-w-[1280px] aspect-video max-h-[80vh] shadow-2xl">',
  '<div className="w-full h-full flex items-center justify-center">\n                            <div className="relative w-full h-[90vh] md:h-screen flex items-center justify-center">'
);

// Fix layout of custom-image
code = code.replace(
  '<div className="relative inline-flex items-center justify-center max-w-full max-h-full shadow-2xl">\n                            <img \n                                src={(slide as any).src} \n                                alt={(slide as any).title} \n                                className="max-w-full max-h-[80vh] w-auto h-auto object-contain pointer-events-none"',
  '<div className="relative w-full h-full flex items-center justify-center">\n                            <img \n                                src={(slide as any).src} \n                                alt={(slide as any).title} \n                                className="w-full h-[90vh] md:h-screen object-contain pointer-events-none"'
);

// Fix native video
code = code.replace(
  '<div className="w-full h-full flex items-center justify-center p-6 md:p-12 relative">\n                             <div className="relative max-w-full max-h-full inline-block flex items-center justify-center">\n                                 <video \n                                     controls \n                                     autoPlay \n                                     playsInline \n                                     className="max-w-full max-h-[80vh] object-contain shadow-2xl relative z-10"',
  '<div className="w-full h-full flex items-center justify-center relative">\n                             <div className="relative w-full h-full flex items-center justify-center">\n                                 <video \n                                     controls \n                                     autoPlay \n                                     playsInline \n                                     className="w-full h-[90vh] md:h-screen object-contain relative z-10"'
);

fs.writeFileSync('components/MediaGrid.tsx', code);
console.log("Patched MediaGrid.tsx");
